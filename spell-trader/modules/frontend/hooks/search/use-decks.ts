import queryKey from "@/modules/frontend/query-key";
import search from "@/modules/frontend/search";
import Search from "@/modules/frontend/search/types";
import { iff } from "@/modules/functions/shortcuts/iff";
import { Deck } from "@/types/App/Deck";
import {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { isEmpty, lt } from "lodash";
import { SearchResponse } from "typesense/lib/Typesense/Documents";

type UseDecksProps<T extends Deck> = {
  searchParams: Pick<Search.Params, "q" | "sort"> & {
    filters?: {
      name: string;
      updatedAt: string;
    };
  };
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

export function useDecks<T extends Deck>({
  searchParams = {},
  searchOptions = {
    group_by: "name",
    group_limit: 99,
  },
  queryOptions,
}: UseDecksProps<T>) {
  const { q, filters, sort } = searchParams;
  const per_page = 12;
  const decks = useInfiniteQuery({
    queryKey: queryKey.search(searchParams),
    queryFn: async ({ pageParam }) => {
      return search.decks<T>({
        q: q || "*",
        query_by: ["name"],
        // filter_by: "*",
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

  return decks;
}
