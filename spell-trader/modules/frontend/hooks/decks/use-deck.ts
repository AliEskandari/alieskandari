import db from "@/modules/db";
import { useQuery } from "@tanstack/react-query";
import queryKey from "../../query-key";
import { Deck } from "@/types/App/Deck";

export function useDeck<T extends Deck = Deck>(deckId: string | undefined) {
  const deck = useQuery({
    queryKey: queryKey.deck(deckId),
    queryFn: () => db.Deck.findById<T>(deckId),
    enabled: !!deckId,
  });

  return deck;
}
