/**
 * Query keys for use with `useQuery` and `useMutation` hooks.
 */

import { Clauses, Options } from "@/modules/db/functions/find";
import { SearchArgs } from "@/modules/scryfall/cards";
import { Deck } from "@/types/App/Deck";
import { Order } from "@/types/App/Order";
import { Package } from "@/types/App/Order/Package";
import { Product } from "@/types/App/Product";
import { Listing } from "@/types/App/Listing";
import { User } from "@/types/App/User";
import { Primitive } from "@/types/utilities";

export const queryKey = {
  deck: (id?: string) => ["decks", id],
  decks: <T extends Deck = Deck>(
    filters: Clauses<T> = {},
    options: Options<T> = {}
  ): [string, Clauses<T>, Options<T>] => ["decks", filters, options],
  deckCard: (
    deckId: string | undefined,
    cardId: string | undefined
  ): [
    "decks",
    Deck["id"] | undefined,
    "cards",
    Deck.Card["id"] | undefined
  ] => ["decks", deckId, "cards", cardId],
  deckCards: <S extends Deck.Card = Deck.Card>(
    deckId?: string,
    filters: Clauses<S> = {},
    options: Options<S> = {},
    ...keys: any[]
  ): [string, string | undefined, string, Clauses<S>, Options<S>, ...any[]] => [
    "decks",
    deckId,
    "cards",
    filters,
    options,
    ...keys,
  ],

  user: (
    id?: string | { filters?: Clauses<User>; options?: Options<User> },
    ...keys: Primitive[]
  ) => ["users", id, ...keys],
  users: (
    filters: Clauses<User> = {},
    options: Options<User> = {},
    ...keys: Primitive[]
  ): [string, Clauses<User>, Options<User>, ...Primitive[]] => [
    "users",
    filters,
    options,
    ...keys,
  ],
  listing: (id?: string) => ["listings", id],
  listings: <S extends Listing = Listing>(
    filters: Clauses<S> = {},
    options: Options<S> = {},
    ...keys: Primitive[]
  ): [string, Clauses<S>, Options<S>, ...Primitive[]] => [
    "listings",
    filters,
    options,
    ...keys,
  ],
  product: (id?: string, ...keys: Primitive[]) => ["products", id, ...keys],
  products: (
    filters: Clauses<Product> = {},
    options: Options<Product> = {},
    ...keys: Primitive[]
  ): [string, Clauses<Product>, Options<Product>, ...Primitive[]] => [
    "products",
    filters,
    options,
    ...keys,
  ],
  package: (id?: string) => ["packages", id],
  packages: (
    filters: Clauses<Package> = {},
    options: Options<Package> = {},
    ...keys: Primitive[]
  ): [string, Clauses<Package>, Options<Package>, ...Primitive[]] => [
    "packages",
    filters,
    options,
    ...keys,
  ],
  usersCart: (userId?: string) => ["users", userId, "cart"],
  usersWishlist: (userId?: string) => ["users", userId, "wishlist"],
  usersCollection: (userId?: string) => ["users", userId, "collection"],
  usersOrders: (
    userId?: string,
    filters: Clauses<Order> = {},
    options: Options<Order> = {}
  ): [string, string | undefined, string, Clauses<Order>, Options<Order>] => [
    "users",
    userId,
    "orders",
    filters,
    options,
  ],
  usersNotifications: (userId?: string) => ["users", userId, "notifications"],
  usersFeedback: (userId?: string) => ["users", userId, "feedback"],
  search: (query?: any) => ["search", query],
  scryfall: {
    set: (setCode?: string) => ["scryfall", "sets", setCode],
    cards: (searchArgs: SearchArgs): [string, string, SearchArgs] => [
      "scryfall",
      "cards",
      searchArgs,
    ],
  },
} as const;
