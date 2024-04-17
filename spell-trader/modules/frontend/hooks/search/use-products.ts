import queryKey from "@/modules/frontend/query-key";
import search from "@/modules/frontend/search";
import Search from "@/modules/frontend/search/types";
import { iff } from "@/modules/functions/shortcuts/iff";
import { Product } from "@/types/App/Product";
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { lt } from "lodash";
import { SearchResponse } from "typesense/lib/Typesense/Documents";

type UseProductsProps<T extends Product> = {
  searchParams: Search.Params;
  searchOptions?: {
    group_by?: string;
    group_limit?: number;
  };
  queryOptions?: Partial<
    UndefinedInitialDataInfiniteOptions<
      SearchResponse<T>,
      Error,
      InfiniteData<SearchResponse<T>>,
      QueryKey,
      number
    >
  >;
};

export function useProducts<T extends Product>({
  searchParams = {},
  searchOptions = {
    group_by: "title",
    group_limit: 99,
  },
  queryOptions,
}: UseProductsProps<T>) {
  const { q, query_by, per_page, filters, sort } = searchParams;
  const products = useInfiniteQuery({
    queryKey: queryKey.search(searchParams),
    queryFn: async ({ pageParam }) => {
      // assuming products are only mtg cards
      const filterBy = ["traits.lang:=en"];

      Object.values(filters ?? {}).forEach((filterParam) => {
        const filter = search.formFilter.product.card.mtg[filterParam.key];
        if (filter.type === "text") {
          const textFilterParam = filterParam as Search.Form.Filter.Text.Param;
          filterBy.push(
            `${filter.field}:${textFilterParam.value?.toLowerCase()}`
          );
        } else if (filter.type === "operator") {
          const operatorFilterParam =
            filterParam as Search.Form.Filter.Operator.Param;
          filterBy.push(
            `${filter.field}:${operatorFilterParam.operator}${operatorFilterParam.value}`
          );
        } else if (filter.type === "select") {
          const selectFilterParam =
            filterParam as Search.Form.Filter.Select.Param;
          const { value, type } = selectFilterParam;
          if (type === "any") {
            filterBy.push(`${filter.field}:=[${value}]`);
          } else if (type === "contain") {
            const clauses = value.map((value) => `${filter.field}:=${value}`);
            filterBy.push(clauses.join(" && "));
          } else if (type === "exact") {
            const clauses = value.map((value) => `${filter.field}:=${value}`);
            const negateValues = filter.options.filter(
              (option) => !value.includes(option)
            );
            clauses.push(`${filter.field}:!=[${negateValues}]`);
            filterBy.push(clauses.join(" && "));
          }
        }
      });

      filterBy.push(
        "traits.set:!=[YDMU, YONE, YMID, YWOE, HBG, YSNC, YNEO, YBRO]"
      );

      return search.products<T>({
        q: q ?? "*",
        query_by: query_by ?? ["title", "details", "traits.set_name"],
        filter_by: filterBy.join(" && "),
        per_page: per_page ?? 12,
        sort_by: `${sort?.by ?? "_text_match"}:${sort?.direction ?? "desc"}`,
        page: pageParam,
        infix: "fallback",
        prioritize_token_position: true,
        ...searchOptions,
      });
    },
    initialPageParam: 1,
    enabled: !!q || !!filters,
    getNextPageParam: (lastPage) => {
      const numHits = iff(
        !!searchOptions.group_by,
        lastPage.grouped_hits?.length,
        lastPage.hits?.length
      );
      return iff(lt(numHits, per_page), null, lastPage.page + 1);
    },
    staleTime: 1000 * 60 * 60, // 1 hour,
    // placeholderData: keepPreviousData,
    ...queryOptions,
  });

  return products;
}
