import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import queryKey from "@/modules/frontend/query-key";
import { Deck } from "@/types/App/Deck";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useDeckCards<S extends Deck.Card = Deck.Card>({
  deckId,
  filters = {},
  options = {},
  queryOptions = {},
}: {
  deckId: string | undefined;
  filters?: Clauses<S>;
  options?: Options<S>;
  queryOptions?: Partial<UseQueryOptions<S[]>>;
}) {
  const deckCards = useQuery({
    queryKey: queryKey.deckCards(deckId, filters, options),
    queryFn: async () => db.Deck.card.find<S>(deckId!, filters, options),
    ...queryOptions,
  });

  return deckCards;
}
