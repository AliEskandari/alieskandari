import { Product } from "@/types/App/Product";
import { Card } from "@/types/Scryfall/Card";
import qs from "qs";
import type Search from "../search/types";

const enc = encodeURIComponent;

const routes = {
  home: "/",
  search: (args: Search.Params) => `/search?${qs.stringify(args)}`,
  products: (id?: Product["id"]) => `/products/${id || ":id"}`,
  listings: {
    new: {
      category: "/listings/new/category",
      index: "/listings/new",
      single: "/listings/new/single",
      multiple: "/listings/new/multiple",
    },
    drafts: "/listings/drafts",
    published: "/listings/published",
    archived: "/listings/archived",
    sold: {
      path: "/listings/sold",
      package(id: string) {
        return `/listings/sold/${id}`;
      },
    },
    edit: (id: string) => `/listings/edit/${id}`,
  },
  myCards: {
    collection: "/my-cards/collection",
    decks: {
      home: "/my-cards/decks",
      deckId(deckId: string) {
        return `/my-cards/decks/${deckId}`;
      },
    },
    wishtlist: "/my-cards/wishlist",
    home: "/my-cards",
  },
  tcg: {
    home: "/tcg",
    mtg: "/tcg/mtg",
    sets: "/tcg/mtg/sets",
    cardLookup: {
      home: "/tcg/card-lookup",
      game(game: string) {
        return {
          path: `/tcg/card-lookup/${game}`,
          card(card: Card, lang?: string) {
            return this.set(card.set_name, card.set).card(
              card.name,
              card.collector_number,
              lang
            );
          },
          set(name: string, code: string) {
            const setSlug = enc(`${name}+${code}`);
            return {
              path: `/tcg/card-lookup/${game}/${setSlug}`,
              card(name: string, collectorNumber: string, lang?: string) {
                let path = `/tcg/card-lookup/${game}/${setSlug}/${enc(
                  `${name}+${collectorNumber}`
                )}`;
                if (lang) path = path.concat(`/${enc(lang)}`);
                return {
                  path: path,
                };
              },
            };
          },
        };
      },
    },
  },
  buy: {
    home: "/buy",
  },
  contact: "/contact",
  settings: {
    account: "/settings/account",
    ebay: "/settings/ebay",
    payments: "/settings/payments",
    storefront: "/settings/storefront",
  },
  orders: "/orders",
  plans: "/plans",
  cart: "/cart",
  storefront: {
    forSale: (handle?: string) => `/storefront/${handle}/for-sale`,
    decks: (handle?: string) => `/storefront/${handle}/decks`,
    feedback: (handle?: string) => `/storefront/${handle}/feedback`,
    // collection: (handle?: string) => `/storefront/${handle}/collection`,
    // trade: (handle?: string) => `/storefront/${handle}/trade`,
  },
  decks: {
    path: (deckId: string) => `/decks/${deckId}`,
    home: "/decks",
  },
  blog: "/blog",
} as const;

export default routes;
