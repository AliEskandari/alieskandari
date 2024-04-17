import db from "@/modules/db";
import { useQuery } from "@tanstack/react-query";
import queryKey from "../../query-key";
import { Deck } from "@/types/App/Deck";

export function useDeckCard<S extends Deck.Card = Deck.Card>(
  deckId: string | undefined,
  deckCardId: string | undefined
) {
  const deckCard = useQuery({
    queryKey: queryKey.deckCard(deckId, deckCardId),
    queryFn: () => db.Deck.card.findById<S>(deckId!, deckCardId),
    enabled: !!deckId && !!deckCardId,
    staleTime: 1000 * 60, // 1 hour
  });

  return deckCard;
}
