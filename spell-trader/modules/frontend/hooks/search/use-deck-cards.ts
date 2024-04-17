import queryKey from "@/modules/frontend/query-key";
import search from "@/modules/frontend/search";
import Search from "@/modules/frontend/search/types";
import { iff } from "@/modules/functions/shortcuts/iff";
import { Card } from "@/types/App/Deck/Card";
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { lt } from "lodash";
import { SearchResponse } from "typesense/lib/Typesense/Documents";

type UseProductsProps<T extends Card> = {
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

export function useDeckCards<T extends Card>({
  searchParams = {},
  searchOptions = {
    group_by: "title",
    group_limit: 99,
  },
  queryOptions,
}: UseProductsProps<T>) {
  const { q, filters, sort } = searchParams;
  const per_page = 12;
  const deckCards = useInfiniteQuery({
    queryKey: queryKey.search(searchParams),
    queryFn: async ({ pageParam }) => {
      return search.deckCards<T>({
        q: q || "*",
        query_by: ["title", "details", "traits.set_name"],
        // filter_by: filterBy.join(" && "),
        per_page,
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

  return deckCards;
}
