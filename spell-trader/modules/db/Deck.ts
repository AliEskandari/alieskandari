import { Deck as DeckType } from "@/types/App/Deck";
import { db } from "../firebase/client";
import { manager } from "./functions/manager";

export const Deck = {
  ...manager<DeckType>({
    db,
    collectionId: "decks",
    _default: {
      id: "",
      name: "",
      format: "commander",
      createdAt: "",
      updatedAt: "",
      photoUrl: "",
      user: {
        id: "",
      },
      product: {
        line: "magic-the-gathering",
      },
      status: "unlisted",
    },
  }),

  card: {
    ...manager<DeckType.Card>({
      db,
      collectionId: "cards",
      collectionPathFn: (id: string) => `decks/${id}/cards`,
      _default: {
        id: "",
        createdAt: "",
        updatedAt: "",
        product: {
          id: "",
          line: "magic-the-gathering",
        },
        deck: {
          id: "",
        },
        quantity: 1,
        group: "",
      },
    }),
  },
  /**
   * A history of changes made to a deck.
   *
   * @example
   * // Creating a new history item after a deck is copied.
   * const historyItem = await db.Deck.history.create<Deck.History.Item.CopiedDeck>(
   *   "deckId", // id of deck that was created
   *   {
   *     key: "copied-deck",
   *     user: { id: "user-id" }, // user who made the change
   *     deck: { id: "deck-id" }, // deck that was created
   *     traits: {
   *       copied: {
   *         deck: { id: "copied-deck-id" }, // deck that was copied
   *       },
   *     },
   *   }
   * );
   *
   * @example
   * // Creating a new history item after a deck is created.
   * const historyItem = await db.Deck.history.create<Deck.History.Item.CreatedDeck>(
   *   "deckId", // id of deck that was created
   *   {
   *     key: "created-deck",
   *     user: { id: "user-id" }, // user who made the change
   *     deck: { id: "deck-id" }, // deck that was created
   *   }
   * );
   *
   */
  history: manager<DeckType.History.Item>({
    db,
    collectionId: "history",
    collectionPathFn: (id: string) => `decks/${id}/history`,
    _default: {
      id: "",
      key: "created-deck",
      createdAt: "",
      updatedAt: "",
      deck: {
        id: "",
      },
      user: {
        id: "",
      },
    },
  }),
};
