import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import queryKey from "@/modules/frontend/query-key";
import { Deck } from "@/types/App/Deck";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useDecks<T extends Deck = Deck>({
  filters = {},
  options = {},
  queryOptions = {},
}: {
  filters?: Clauses<T>;
  options?: Options<T>;
  queryOptions?: Partial<UseQueryOptions<T[]>>;
} = {}) {
  const decks = useQuery({
    queryKey: queryKey.decks(filters, options),
    queryFn: async () => db.Deck.find<T>(filters, options),
    ...queryOptions,
  });

  return decks;
}
