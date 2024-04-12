import { Accordion } from "@/components/accordion";
import Button from "@/components/buttons/button";
import DropdownComponent, { Dropdown } from "@/components/dropdown";
import Img from "@/components/images/Img";
import ManaBlips from "@/components/mana-blips";
import GenericActionMenu from "@/components/menus/generic-action-menu";
import { DefaultDeckPhotoUrl } from "@/modals/decks/create-deck-modal";
import db from "@/modules/db";
import entityManager from "@/modules/entity-manager";
import debug from "@/modules/frontend/debug";
import hooks from "@/modules/frontend/hooks";
import queryKey from "@/modules/frontend/query-key";
import routes from "@/modules/frontend/routes";
import mtg from "@/modules/frontend/search/form-filter/product/card/mtg";
import type Search from "@/modules/frontend/search/types";
import { rand } from "@/modules/functions/math/rand";
import { iff } from "@/modules/functions/shortcuts/iff";
import { currentTimestamp } from "@/modules/functions/time/currentTimestamp";
import is from "@/modules/is";
import mixpanel from "@/modules/mixpanel";
import { DeckColors } from "@/pages/decks";
import { renderOracleText } from "@/pages/products/[product-id]";
import {
  ActiveFilterButton,
  SearchForm,
  Query as SearchQuery,
  formFilters as searchPageFormFilters,
} from "@/pages/search";
import { useModalStore, useUserStore } from "@/state";
import { Deck } from "@/types/App/Deck";
import { Product } from "@/types/App/Product";
import { MtgCardTypes } from "@/types/App/Product/Card/MtgCard";
import {
  ArrowLeftOnRectangleIcon,
  ArrowLongDownIcon,
  ArrowLongUpIcon,
  ArrowRightEndOnRectangleIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowRightOnRectangleIcon,
  BoltIcon,
  ClockIcon,
  DocumentPlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  RectangleGroupIcon,
  ShareIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
  UseQueryResult,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { increment } from "firebase/firestore";
import {
  cloneDeep,
  debounce,
  gt,
  isEmpty,
  isNumber,
  shuffle,
  startCase,
} from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import qs from "qs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twJoin, twMerge } from "tailwind-merge";
import logoNoText from "/public/logo-no-text.png";
import useMeasure from "@/modules/frontend/hooks/sensors/use-measure";
import tw from "@/modules/frontend/tailwind/tailwind";
import { MouseEvent } from "react";
import { RedirectIf } from "@/components/redirect-if";
import LoadOnScroll from "@/components/lazy/load-on-scroll";
import Head from "next/head";
import { Listing } from "@/types/App/Listing";

type CardGroup = {
  name: Deck.Card["group"];
  cards: PopulatedDeckCard[] | undefined[];
};

type CardGroupMap = Record<CardGroup["name"], CardGroup["cards"]>;

const cardGroupsPlaceholder = MtgCardTypes.map((type) => ({
  name: type,
  cards: Array(rand(3, 15, type.length)).fill(undefined),
})) as CardGroup[];

const cardGroupMapPlaceholder = cardGroupsPlaceholder.reduce(
  (acc, cardGroup) => {
    acc[cardGroup.name] = cardGroup.cards;
    return acc;
  },
  {} as CardGroupMap
);

export type PopulatedDeckCard = Omit<Deck.Card, "product"> & {
  product: Product.Card.MtgCard;
};

const formFilters = cloneDeep(searchPageFormFilters);
formFilters.unshift(mtg["card-name"]);

export type Query = {
  "deck-id": string;
} & SearchQuery;

export function FoilOverlay({ className }: { className?: string }) {
  return (
    <div
      className={twMerge("absolute opacity-20 inset-0 rounded-2xl", className)}
      style={{
        background: "linear-gradient(-60deg, purple, blue, green, yellow, red)",
      }}
    ></div>
  );
}

export default function DeckPage() {
  hooks.lifecycle.useMount(mixpanel.pages.user_deck_page);
  const router = useRouter();
  const { user } = useUserStore();
  const [cardPreviewDeckCardId, setCardPreviewDeckCardId] = useState<
    Deck.Card.Mtg["id"] | undefined
  >(undefined);
  const [cardPreviewProduct, setCardPreviewProduct] = useState<
    Product.Card.MtgCard | null | undefined
  >(undefined);
  const [cardPreviewAs, setCardPreviewAs] = useState<"deck-card" | "product">(
    "deck-card"
  );
  const { "deck-id": deckId } = router.query as Query;
  const parsedQuery = useMemo(
    () => qs.parse(router.query as Query) as Search.Params,
    [router.query]
  );
  const searchPaneDivRef = useRef<HTMLDivElement>(null);
  const searchResultsHeaderDivRef = useRef<HTMLDivElement>(null);
  const { q, filters: activeFilters, sort } = parsedQuery;
  const products = hooks.search.useProducts({
    searchParams: parsedQuery,
    queryOptions: {
      placeholderData: {
        pages: [{ grouped_hits: Array(4).fill({ hits: [{}] }) }],
      } as any,
    },
  });

  const deck = hooks.decks.useDeck(deckId);

  hooks.breadcrumbs.useBreadcrumbs({ [deckId]: deck.data?.name ?? "" }, [
    deckId,
    deck.data,
  ]);
  const isLoggedInUserDeck = !!user && deck.data?.user.id === user.id;

  const deckCards = hooks.decks.useDeckCards<Deck.Card.Mtg>({ deckId });
  const [settings, setSettings] = useState<{
    search: {
      numCols: number;
    };
  }>({
    search: {
      numCols: 3,
    },
  });

  useEffect(() => {
    if (cardPreviewDeckCardId) return;
    const firstDeckCard = deckCards.data?.[0];
    if (firstDeckCard) setCardPreviewDeckCardId(firstDeckCard.id);
  }, [deckCards.data]);

  const handleHoverDeckCard = (deckCard: Deck.Card.Mtg | null | undefined) => {
    setCardPreviewDeckCardId(deckCard?.id);
    setCardPreviewAs("deck-card");
  };

  const handleHoverSearchResult = (card: Product.Card.MtgCard | undefined) => {
    setCardPreviewProduct(card);
    setCardPreviewAs("product");
  };

  const handleSubmitSearchForm = () => {
    if (searchResultsHeaderDivRef.current && searchPaneDivRef.current) {
      // Calculate the top position of searchResultsHeaderDivRef relative to the searchPaneDivRef
      const elementTop =
        searchResultsHeaderDivRef.current.offsetTop -
        searchPaneDivRef.current.offsetTop;

      // Scroll to the element
      searchPaneDivRef.current.scrollTo({
        top: elementTop,
        behavior: "instant",
      });
    }
  };

  const scrollToSearchHeader = () => {
    // scroll to top of search pane
    if (searchPaneDivRef.current) {
      searchPaneDivRef.current.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  };

  const handleClickChangeSettingsSearchNumCols = (
    param: "increase" | "decrease"
  ) => {
    if (param === "increase") {
      setSettings({
        ...settings,
        search: { numCols: Math.min(settings.search.numCols + 1, 5) },
      });
    } else if (param === "decrease") {
      setSettings({
        ...settings,
        search: { numCols: Math.max(settings.search.numCols - 1, 1) },
      });
    }
  };

  return (
    <RedirectIf
      condition={user?.id !== deck.data?.user.id}
      isLoading={user === undefined || deck.data === undefined}
      redirectTo={routes.decks.path(deckId)}
    >
      <Head>
        <title>{deck.data?.name ?? "Deck"}</title>
      </Head>
      <main className="sm:px-3 mx-auto overflow-hidden absolute left-0 right-0 bottom-0 top-28 lg:top-28 flex flex-col gap-y-3">
        {/* Main Body */}
        <section className="flex overflow-hidden">
          {/* Desktop: Search to Add Card */}
          {iff(
            isLoggedInUserDeck,
            <aside
              ref={searchPaneDivRef}
              data-name="search"
              className="hidden w-3/12 xl:flex flex-col gap-y-4 border-r overflow-y-auto px-2"
            >
              <SearchForm
                formFilters={formFilters}
                onSubmit={handleSubmitSearchForm}
                className="mt-2"
              />

              {iff(
                (!products.isPlaceholderData && products.isSuccess) ||
                  products.isFetching,
                <div
                  className="sticky top-0 bg-white z-[1] border-b pt-2"
                  ref={searchResultsHeaderDivRef}
                >
                  <Button
                    variant="none"
                    className="p-3 py-4 rounded-xl bg-gray-100 hover:ring-1 ring-orange-500 mb-2 w-full transition-all"
                    onClick={scrollToSearchHeader}
                  >
                    <header>
                      <h3 className="flex items-center justify-center mb-2 text-sm text-gray-500">
                        <MagnifyingGlassIcon className="size-4" />
                        &nbsp;Found&nbsp;
                        <span className="font-medium">
                          {numeral(products.data?.pages[0].found).format("0,0")}
                        </span>
                        &nbsp;search results...
                      </h3>
                      <div className="flex gap-2 items-center no-scrollbar overflow-x-auto">
                        {Object.values(activeFilters ?? {}).map((filter) => (
                          <ActiveFilterButton
                            filterParam={filter}
                            onClickClear={(event) => {
                              event.stopPropagation();
                              delete activeFilters![filter.key];
                              const query = qs.stringify({
                                q,
                                filters: activeFilters,
                                sort,
                              });
                              router.push({
                                pathname: `/my-cards/decks/${deck.data?.id}`,
                                query,
                              });
                            }}
                          />
                        ))}
                        <Button
                          variant="outline"
                          className="text-sm px-1 py-0 whitespace-nowrap"
                          onClick={scrollToSearchHeader}
                        >
                          <PencilIcon className="w-5" />
                        </Button>
                      </div>
                    </header>
                  </Button>
                  <div className="flex flex-wrap justify-start gap-2 w-full items-center mb-3">
                    <h3 className="text-gray-500 flex items-center text-sm">
                      Sort by
                    </h3>
                    <DropdownComponent
                      key={sort?.by}
                      className="text-sm"
                      classNames={{ button: "w-36" }}
                      options={
                        [
                          {
                            name: "Relevance",
                            value: { by: "_text_match", direction: "desc" },
                          },
                          {
                            name: "Alphabetical",
                            value: {
                              by: "title(missing_values: last)",
                              direction: "asc",
                            },
                          },
                          {
                            name: "Mana Value",
                            value: {
                              by: "traits.cmc(missing_values: last)",
                              direction: "desc",
                            },
                          },
                          {
                            name: "Power",
                            value: {
                              by: "traits.power(missing_values: last)",
                              direction: "desc",
                            },
                          },
                          {
                            name: "Toughness",
                            value: {
                              by: "traits.toughness(missing_values: last)",
                              direction: "desc",
                            },
                          },
                          {
                            name: "Price",
                            value: {
                              by: "traits.prices.usd(missing_values: last)",
                              direction: "desc",
                            },
                          },
                        ] as Dropdown.NameValueOption<
                          Search.Params.Sort<Product.Card.MtgCard>
                        >[]
                      }
                      initialOption={(option) =>
                        option.value.by === (sort?.by ?? "_text_match")
                      }
                      onClickOption={(option) => {
                        const query = qs.stringify({
                          q,
                          filters: activeFilters,
                          sort: option.value,
                        });
                        router.push({
                          pathname: router.asPath.split("?")[0],
                          query,
                        });
                      }}
                    />
                    <DropdownComponent
                      key={sort?.direction}
                      options={
                        [
                          {
                            name: "Asc",
                            value: "asc",
                          },
                          {
                            name: "Desc",
                            value: "desc",
                          },
                        ] as Dropdown.NameValueOption<
                          Search.Params.Sort<Product.Card.MtgCard>["direction"]
                        >[]
                      }
                      initialOption={(option) =>
                        option.value === (sort?.direction ?? "desc")
                      }
                      onClickOption={(option) => {
                        const query = qs.stringify({
                          q,
                          filters: activeFilters,
                          sort: { ...sort, direction: option.value },
                        });
                        router.push({
                          pathname: router.asPath.split("?")[0],
                          query,
                        });
                      }}
                      className="w-fit flex-none text-sm"
                    />
                    <div className="flex justify-between w-fit 2xl:ml-auto rounded-xl divide-x divide-gray-200">
                      <Button
                        variant="secondary"
                        className="p-2 px-2.5 rounded-r-none flex justify-center w-1/2"
                        onClick={() =>
                          handleClickChangeSettingsSearchNumCols("increase")
                        }
                      >
                        <MagnifyingGlassMinusIcon className="size-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        className="p-2 px-2.5 rounded-l-none flex justify-center w-1/2"
                        onClick={() =>
                          handleClickChangeSettingsSearchNumCols("decrease")
                        }
                      >
                        <MagnifyingGlassPlusIcon className="size-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Cards */}
              {iff(
                (!products.isPlaceholderData && products.isSuccess) ||
                  products.isFetching,
                <div className="pt-2 w-full">
                  <div
                    className={twJoin(
                      "grid w-full gap-2",
                      settings.search.numCols === 1 && "grid-cols-1",
                      settings.search.numCols === 2 && "grid-cols-2",
                      settings.search.numCols === 3 && "grid-cols-3",
                      settings.search.numCols === 4 && "grid-cols-4",
                      settings.search.numCols === 5 && "grid-cols-5"
                    )}
                  >
                    {products.data?.pages
                      .flatMap((page) => page.grouped_hits)
                      .map((groupedHit, index) => (
                        <SearchResultCard
                          key={index}
                          card={
                            groupedHit?.hits?.[0].document as
                              | Product.Card.MtgCard
                              | undefined
                          }
                          onHover={handleHoverSearchResult}
                        />
                      ))}
                  </div>

                  {iff(
                    products.hasNextPage,
                    <Button
                      variant="primary"
                      className="p-2 my-4 w-full"
                      isLoading={products.isFetchingNextPage}
                      loadingText="Loading..."
                      onClick={() => products.fetchNextPage()}
                    >
                      Load More
                    </Button>
                  )}
                </div>,
                <EmptySearchState />
              )}
            </aside>
          )}

          {/* Desktop: Card Preview */}
          <section
            data-name="card-preview"
            className="hidden xl:flex xl:w-3/12 2xl:w-2/12 flex-none items-start px-2 pt-2 overflow-hidden flex-col gap-y-4 border-r"
          >
            <CardPreview
              deckCardId={cardPreviewDeckCardId}
              product={cardPreviewProduct}
              type={cardPreviewAs}
              deck={deck}
              editable={isLoggedInUserDeck}
            />
          </section>

          {/* Deck Cards */}
          <DeckPane
            deckId={deckId}
            onHoverDeckCard={handleHoverDeckCard}
            editable={isLoggedInUserDeck}
            className="xl:w-6/12 2xl:w-7/12"
          />
        </section>
      </main>
    </RedirectIf>
  );
}

export type legalities = {
  commander: string;
  standard: string;
  pioneer: string;
  modern: string;
  legacy: string;
  vintage: string;
  pauper: string;
  "pauper commander": string;
  oldschool: string;
  alchemy: string;
  historic: string;
  "historic brawl": string;
};

export type LegalStatus = "legal" | "not_legal" | "restricted" | "banned";

export type GroupViewProps = {
  populatedDeckCards: PopulatedDeckCard[] | undefined;
  onHover: (card?: Deck.Card.Mtg | null) => void;
  editable: boolean;
};

export function parseCardGroup(typeLine: string) {
  let mainType: string = typeLine.includes(" // ")
    ? typeLine.split(" // ")[0]
    : typeLine;

  if (mainType.includes("—")) {
    if (mainType.includes("Planeswalker")) {
      mainType = "planeswalker";
    } else if (mainType.includes("Creature")) {
      mainType = "creature";
    } else if (mainType.includes("Land")) {
      mainType = "land";
    } else if (mainType.includes("Instant")) {
      mainType = "instant";
    } else if (mainType.includes("Sorcery")) {
      mainType = "sorcery";
    } else if (mainType.includes("Artifact")) {
      mainType = "artifact";
    } else if (mainType.includes("Enchantment")) {
      mainType = "enchantment";
    } else if (mainType.includes("Battle")) {
      mainType = "other";
    }
  } else {
    if (mainType.includes("Land")) {
      mainType = "land";
    } else if (mainType.includes("Instant")) {
      mainType = "instant";
    } else if (mainType.includes("Sorcery")) {
      mainType = "sorcery";
    } else if (mainType.includes("Artifact")) {
      mainType = "artifact";
    } else if (mainType.includes("Enchantment")) {
      mainType = "enchantment";
    } else {
      mainType = "other";
    }
  }
  return mainType;
}

export function ViewAsText({
  populatedDeckCards,
  onHover,
  editable,
}: GroupViewProps) {
  const cardGroups = useMemo<CardGroupMap>(() => {
    if (!populatedDeckCards) return cardGroupMapPlaceholder;
    return populatedDeckCards.reduce((acc, populatedDeckCard) => {
      const group = populatedDeckCard.group;
      const cards = acc[group] ?? [];
      (cards as PopulatedDeckCard[]).push(populatedDeckCard);
      acc[group] = cards;
      return acc;
    }, {} as CardGroupMap);
  }, [populatedDeckCards]);

  type Col = CardGroup[];

  const cols = useMemo(() => {
    const cols: Col[] = [];

    const col1: Col = [];
    if (!isEmpty(cardGroups["commander"]))
      col1.push({ name: "commander", cards: cardGroups.commander });
    if (!isEmpty(cardGroups["creature"]))
      col1.push({ name: "creature", cards: cardGroups.creature });
    if (!isEmpty(cardGroups["planeswalker"]))
      col1.push({ name: "planeswalker", cards: cardGroups.planeswalker });
    if (col1.length > 0) cols.push(col1);

    const col2: Col = [];
    if (!isEmpty(cardGroups["instant"]))
      col2.push({ name: "instant", cards: cardGroups.instant });
    if (!isEmpty(cardGroups["sorcery"]))
      col2.push({ name: "sorcery", cards: cardGroups.sorcery });
    if (col2.length > 0) cols.push(col2);

    const col3: Col = [];
    if (!isEmpty(cardGroups["artifact"]))
      col3.push({ name: "artifact", cards: cardGroups.artifact });
    if (!isEmpty(cardGroups["enchantment"]))
      col3.push({ name: "enchantment", cards: cardGroups.enchantment });
    if (col3.length > 0) cols.push(col3);

    const col4: Col = [];
    if (!isEmpty(cardGroups["land"]))
      col4.push({ name: "land", cards: cardGroups.land });
    if (!isEmpty(cardGroups["sidedeck"]))
      col4.push({ name: "sidedeck", cards: cardGroups.sidedeck });

    if (!isEmpty(cardGroups["other"]))
      col4.push({ name: "other", cards: cardGroups.other });
    if (col4.length > 0) cols.push(col4);

    return cols;
  }, [cardGroups]);

  return (
    <div
      data-name="view-as-text"
      className="w-full grid gap-6 grid-cols-1 @sm:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4 overflow-visible"
    >
      {cols.map((col, index) => (
        <div key={index} className="w-full flex flex-col gap-6 items-start">
          {col.map((cardGroup) => (
            <ViewAsTextCardGroup
              key={cardGroup.name}
              type={cardGroup.name}
              populatedDeckCards={cardGroup.cards}
              onHover={onHover}
              editable={editable}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

type ViewAsTextCardGroupProps = {
  type: Deck.Card["group"];
  populatedDeckCards: PopulatedDeckCard[] | undefined[];
  onHover: (card?: Deck.Card.Mtg | null) => void;
  editable: boolean;
};

function ViewAsTextCardGroup({
  type,
  populatedDeckCards,
  onHover,
  editable,
}: ViewAsTextCardGroupProps) {
  const sortedCards = useMemo(() => {
    return populatedDeckCards?.sort((a, b) => {
      if (!a || !b) return 0;
      if (a.product.title < b.product.title) return -1;
      if (a.product.title > b.product.title) return 1;
      return 0;
    });
  }, [populatedDeckCards]);

  const quantity = useMemo(() => {
    return (populatedDeckCards as PopulatedDeckCard[]).reduce(
      (sum, deckCard) => {
        if (deckCard) sum += deckCard.quantity;
        return sum;
      },
      0
    );
  }, [populatedDeckCards]);

  return (
    <div className="flex flex-col w-full" key={type}>
      <div className="flex font-medium border-b pb-1 text-sm sm:text-base">
        <h3>
          {startCase(type)} ({quantity})
        </h3>
        &nbsp;•&nbsp;
        {numeral(
          (populatedDeckCards as PopulatedDeckCard[]).reduce(
            (totalPrice, card) => {
              const price =
                numeral(card?.product.traits.prices.usd).value() ?? 0;
              return totalPrice + price * (card?.quantity || 1);
            },
            0
          )
        ).format()}
      </div>
      <div className="flex flex-col">
        {sortedCards.map((deckCard, index) => (
          <TextCard
            key={deckCard?.id ?? index}
            deckId={deckCard?.deck.id}
            deckCardId={deckCard?.id}
            onHover={onHover}
            editable={editable}
          />
        ))}
      </div>
    </div>
  );
}

function TextCard({
  deckId,
  deckCardId,
  onHover,
  editable,
}: DeckCardCardProps) {
  const queryClient = useQueryClient();
  const deckCard = hooks.decks.useDeckCard<Deck.Card.Mtg>(deckId, deckCardId);
  const product = hooks.products.useProduct<Product.Card.MtgCard>(
    deckCard.data?.product.id
  );
  const format = hooks.decks.useDeck(deckId).data?.format;
  const updateQuantity = useUpdateQuantity();
  const moveCardToDeckGroup = useMoveCardToDeckGroup();
  const { modals } = useModalStore();

  const handleClickAddCardToDeck = async () => {
    updateQuantity.mutate({
      deckId,
      deckCardId,
      quantity: deckCard.data!.quantity + 1,
    });
  };

  const handleClickDeleteCardFromDeck = async () => {
    updateQuantity.mutate({
      deckId,
      deckCardId,
      quantity: deckCard.data!.quantity - 1,
    });
  };

  const handleClickSetCommander = async () => {
    moveCardToDeckGroup({
      deckCard: deckCard.data!,
      group: "commander",
    });
  };

  const handleClickMoveToSidedeck = async () => {
    moveCardToDeckGroup({
      deckCard: deckCard.data!,
      group: "sidedeck",
    });
  };

  const handleClickMoveToMaindeck = async () => {
    const cardInfo = (await db.Product.findById(
      deckCard.data?.product.id
    )) as Product.Card.MtgCard | null;

    moveCardToDeckGroup({
      deckCard: deckCard.data!,
      group: parseCardGroup(cardInfo!.traits?.type_line),
    });
  };

  const handleClickSetAsCoverPhoto = async () => {
    await db.Deck.update(deckId!, {
      photoUrl: product.data?.traits.image_uris?.art_crop,
    });
    queryClient.invalidateQueries({
      queryKey: queryKey.deck(deckId),
    });
  };

  const handleClickTitle = () => {
    mixpanel.actions.deck.deckCardClickedTextView(deckCard.data?.product.id);

    modals.show("/decks/card-details-modal", {
      deckId,
      deckCardId,
      editable,
    });
  };

  return (
    <div
      className="flex border-b pl-3 py-0.5 sm:py-1 group items-center text-sm sm:text-base"
      onMouseEnter={() => onHover(deckCard.data)}
    >
      <p className="w-1/12 mr-3 text-end flex-none">
        {deckCard.data?.quantity ?? <Skeleton width={10} />}
      </p>

      <Button
        variant="none"
        className="hover:underline text-start break-words text-wrap"
        onClick={handleClickTitle}
      >
        {product.data?.title ?? <Skeleton width={120} />}
      </Button>
      <div className="ml-auto flex items-center gap-x-2">
        <ManaBlips card={product.data} />

        {iff(
          editable,
          <GenericActionMenu
            className=""
            button={
              <EllipsisVerticalIcon className="w-5 h-5 lg:opacity-0 transition-opacity group-hover:opacity-100" />
            }
            items={[
              {
                label: "Increase Quantity",
                icon: <PlusIcon className="w-5" />,
                onClick: handleClickAddCardToDeck,
                closeMenuOnClick: false,
              },
              {
                label: "Decrease Quantity",
                icon: <MinusIcon className="w-5" />,
                onClick: handleClickDeleteCardFromDeck,
                closeMenuOnClick: false,
              },

              ...iff(
                (format === "commander" || format === "pauper-commander") &&
                  deckCard.data?.group !== "commander",
                [
                  {
                    label: "Set as Commander",
                    icon: <ShieldCheckIcon className="w-5" />,
                    onClick: handleClickSetCommander,
                    closeMenuOnClick: true,
                  },
                ],
                []
              ),
              ...iff(
                deckCard.data?.group === "commander",
                [
                  {
                    label: "Move to Main Deck",
                    icon: <ArrowLeftOnRectangleIcon className="w-5" />,
                    onClick: handleClickMoveToMaindeck,
                    closeMenuOnClick: false,
                  },
                ],
                []
              ),
              ...iff(
                deckCard.data?.group !== "sidedeck",
                [
                  {
                    label: "Move to Side Deck",
                    icon: <ArrowRightOnRectangleIcon className="w-5" />,
                    onClick: handleClickMoveToSidedeck,
                    closeMenuOnClick: false,
                  },
                ],
                []
              ),
              {
                label: "Set as Cover Photo",
                icon: <RectangleGroupIcon className="w-5" />,
                onClick: handleClickSetAsCoverPhoto,
                closeMenuOnClick: true,
              },
              {
                label: "Card Options",
                icon: <QuestionMarkCircleIcon className="w-5" />,
                onClick: () =>
                  modals.show("/decks/card-details-modal", {
                    deckId: deckId,
                    deckCardId: deckCardId,
                  }),
                closeMenuOnClick: true,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

export function ViewAsGrid({
  populatedDeckCards,
  onHover,
  editable,
}: GroupViewProps) {
  const cardGroups = useMemo<CardGroup[]>(() => {
    // Placeholder
    if (!populatedDeckCards) return cardGroupsPlaceholder;
    const cardGroupMap = populatedDeckCards.reduce((acc, populatedDeckCard) => {
      const group = populatedDeckCard.group;
      const cards = acc[group] ?? [];
      (cards as PopulatedDeckCard[]).push(populatedDeckCard);
      acc[group] = cards;
      return acc;
    }, {} as CardGroupMap);

    const cardGroupNamesSortedByPriority = [
      "commander",
      "creature",
      "instant",
      "sorcery",
      "enchantment",
      "artifact",
      "land",
      "sidedeck",
    ] as const;

    return cardGroupNamesSortedByPriority.reduce((acc, cardGroupName) => {
      const cards = cardGroupMap[cardGroupName];
      if (!isEmpty(cards)) acc.push({ name: cardGroupName, cards });
      return acc;
    }, [] as CardGroup[]);
  }, [populatedDeckCards]);

  return (
    <div className="flex flex-col gap-y-6">
      {cardGroups.map((cardGroup) => (
        <ViewAsGridCardGroup
          key={cardGroup.name}
          type={cardGroup.name}
          populatedDeckCards={cardGroup.cards}
          onHover={onHover}
          editable={editable}
        />
      ))}
    </div>
  );
}

function ViewAsGridCardGroup({
  type,
  populatedDeckCards,
  onHover,
  editable,
}: ViewAsTextCardGroupProps) {
  const quantity = useMemo(() => {
    return (populatedDeckCards as PopulatedDeckCard[]).reduce(
      (sum, deckCard) => sum + (deckCard?.quantity ?? 0),
      0
    );
  }, [populatedDeckCards]);

  return (
    <div>
      <div className="flex">
        <h3 className="font-medium mb-4">
          {startCase(type)} ({quantity})
        </h3>{" "}
        &nbsp;•&nbsp;
        <div>
          {numeral(
            (populatedDeckCards as PopulatedDeckCard[]).reduce(
              (totalPrice, card) => {
                const price =
                  numeral(card?.product.traits.prices.usd).value() ?? 0;
                return totalPrice + price * (card?.quantity || 1);
              },
              0
            )
          ).format()}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-x-4 gap-y-6">
        {populatedDeckCards?.map((deckCard, index) => (
          <div>
            <DeckCardCard
              key={deckCard?.id ?? index}
              deckId={deckCard?.deck.id}
              deckCardId={deckCard?.id}
              onHover={onHover}
              editable={editable}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type DeckCardCardProps = {
  deckId?: Deck["id"];
  deckCardId?: Deck.Card["id"];
  onHover: (card?: Deck.Card.Mtg | null) => void;
  editable: boolean;
};

export function DeckCardCard({
  deckId,
  deckCardId,
  onHover,
  editable,
}: DeckCardCardProps) {
  const updateQuantity = useUpdateQuantity();
  const deckCard = hooks.decks.useDeckCard<Deck.Card.Mtg>(deckId, deckCardId);
  const product = hooks.products.useProduct<Product.Card.MtgCard>(
    deckCard.data?.product.id
  );

  const handleClickIncrementQuantity = async () => {
    updateQuantity.mutate({
      deckId,
      deckCardId,
      quantity: deckCard.data!.quantity + 1,
    });
  };

  const handleClickDecrementQuantity = async () => {
    updateQuantity.mutate({
      deckId,
      deckCardId,
      quantity: deckCard.data!.quantity - 1,
    });
  };

  return (
    <div
      className="flex flex-col gap-y-1"
      onMouseEnter={() => onHover(deckCard.data)}
    >
      <div className="relative group">
        <Link href={routes.products(product.data?.id)}>
          <Img
            alt="Card Image"
            containerClassName="rounded-lg aspect-card"
            className="object-contain hover: cursor-pointer"
            src={
              product.data?.traits?.image_uris?.normal ??
              product.data?.photos.entities[0].src
            }
            fill
            quality={100}
            priority
            bgColor="bg-gray-200"
          />
        </Link>

        {iff(deckCard.data?.traits.finish === "foil", <FoilOverlay />)}

        <>
          {iff(
            !!deckCard.data,
            <span className="flex absolute -top-2 -left-2 rounded-full bg-black text-white text-sm w-7 h-7 justify-center items-center">
              {deckCard.data?.quantity}
            </span>
          )}

          {iff(
            editable,
            <div className="flex flex-row-reverse absolute rounded-xl w-2/3 justify-around top-1/3 -translate-y-1/2 -translate-x-1/2 left-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 bg-opacity-40 backdrop-blur-md">
              <Button
                variant="outline"
                className=" text-white"
                disabled={!deckCard}
                onClick={handleClickIncrementQuantity}
              >
                <PlusIcon className="w-7" />
              </Button>
              <Button
                variant="outline"
                className=" text-white"
                disabled={!deckCard}
                onClick={handleClickDecrementQuantity}
              >
                <MinusIcon className="w-7" />
              </Button>
            </div>
          )}
        </>
      </div>

      <section className="p-2">
        <h2 className="font-semibold">{product.data?.title ?? <Skeleton />}</h2>
      </section>
    </div>
  );
}

type EmptyStateProps = {
  deck?: Deck | null;
  editable: boolean;
};

export function EmptySearchState() {
  return (
    <div className="flex gap-y-4 py-10 px-10 w-full h-full flex-col justify-center items-center">
      <h1 className="text-center text-gray-500">
        The Master looked far and wide to enlist powerful forces.
      </h1>
      <h1 className="">Searched cards will appear here!</h1>
    </div>
  );
}

export function EmptyDeckState({ deck, editable }: EmptyStateProps) {
  const { modals } = useModalStore();

  return (
    <div>
      <div className="flex gap-y-4 py-10 px-10 w-full h-full flex-col justify-center items-center">
        <h1 className="text-center text-gray-500">
          The Master arrived in a still and empty world... and from its
          nothingness, the Master began to build.
        </h1>
        {iff(
          editable,
          [<p className="">Cards added to your deck will appear here!</p>],
          [<p className="">No cards have been added yet to this deck.</p>]
        )}
        <Button
          className="flex gap-x-2 items-center lg:hidden"
          variant="primary"
          onClick={() =>
            modals.show("/decks/add-to-deck-search-modal", { deck })
          }
        >
          Add Cards <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export type SearchResultCardProps = {
  card?: Product.Card.MtgCard;
  onHover?: (card: Product.Card.MtgCard) => void;
};

export function SearchResultCard({ card, onHover }: SearchResultCardProps) {
  const router = useRouter();
  const { "deck-id": deckId } = router.query as Query;
  const addProductToDeckGroup = useAddProductToDeckGroup();

  const handleClickAddCardToDeck = async () => {
    addProductToDeckGroup({
      deckId,
      product: card!,
      group: parseCardGroup(card!.traits.type_line),
    });
  };

  const handleClickAddCardToSidedeck = async () => {
    addProductToDeckGroup({
      deckId,
      product: card!,
      group: "sidedeck",
    });
  };

  return (
    <div
      data-name="search-result-card"
      className="group relative"
      onMouseEnter={() => onHover?.(card as Product.Card.MtgCard)}
    >
      <Img
        alt="Card Image"
        containerClassName="rounded-lg aspect-card"
        className="object-contain hover:cursor-pointer"
        src={card?.photos?.entities?.[0].url}
        fill
        bgColor="bg-gray-200"
      />

      {iff(
        !!card,
        <div className="flex flex-col items-end absolute rounded-xl inset-0 my-2">
          <Button
            variant="none"
            className="h-1/3 w-1/3 opacity-100 bg-opacity-100 group-hover:backdrop-blur-md hover:text-gray-100 hover:bg-opacity-60 active:text-gray-200 active:bg-opacity-70 bg-gray-700 transition-opacity px-0 text-white text-sm flex flex-col justify-center items-center whitespace-nowrap border-b rounded-b-none"
            disabled={!card}
            onClick={handleClickAddCardToDeck}
            title="Add to Main Deck"
          >
            <ArrowRightEndOnRectangleIcon className="w-8" />
          </Button>
          <Button
            variant="none"
            className="h-1/3 w-1/3 opacity-100 bg-opacity-100 group-hover:backdrop-blur-md hover:text-gray-100 hover:bg-opacity-60 active:text-gray-200 active:bg-opacity-70 bg-gray-700 transition-opacity px-0 text-white text-sm flex flex-col justify-center items-center whitespace-nowrap rounded-t-none"
            disabled={!card}
            onClick={handleClickAddCardToSidedeck}
            title="Add to Side Deck"
          >
            <ArrowRightOnRectangleIcon className="w-8" />
          </Button>
        </div>
      )}
    </div>
  );
}

type CardPreviewProps = {
  deckCardId?: Deck.Card.Mtg["id"] | undefined;
  product?: Product.Card.MtgCard | null | undefined;
  type: "deck-card" | "product";
  deck: UseQueryResult<Deck | null>;
  editable: boolean;
};
export function CardPreview({
  deckCardId,
  product,
  type,
  deck,
  editable,
}: CardPreviewProps) {
  const router = useRouter();
  const { modals } = useModalStore();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const addProductToDeckGroup = useAddProductToDeckGroup();
  const [legalities, setLegalities] = useState<legalities | {}>({});
  const deckCard = hooks.decks.useDeckCard<Deck.Card.Mtg>(
    deck.data?.id,
    deckCardId
  );
  const deckCardProduct = hooks.products.useProduct<Product.Card.MtgCard>(
    deckCard.data?.product.id
  );
  const [displayProduct, setDisplayProduct] = useState<
    Product.Card.MtgCard | null | undefined
  >(undefined);

  useEffect(() => {
    setLegalities({
      commander: displayProduct?.traits.legalities.commander,
      standard: displayProduct?.traits.legalities.standard,
      pioneer: displayProduct?.traits.legalities.pioneer,
      modern: displayProduct?.traits.legalities.modern,
      legacy: displayProduct?.traits.legalities.legacy,
      vintage: displayProduct?.traits.legalities.vintage,
      pauper: displayProduct?.traits.legalities.pauper,
      "pauper commander": displayProduct?.traits.legalities.paupercommander,
      oldschool: displayProduct?.traits.legalities.oldschool,
      alchemy: displayProduct?.traits.legalities.alchemy,
      historic: displayProduct?.traits.legalities.commander,
      "historic brawl": displayProduct?.traits.legalities.historicbrawl,
    });
  }, [displayProduct]);

  useEffect(() => {
    if (type === "product") setDisplayProduct(product);
    else if (type === "deck-card") setDisplayProduct(deckCardProduct.data);
  }, [deckCardProduct.data, product, type]);

  const handleClickSetCommander = async () => {
    mixpanel.actions.deck.setAsCommander(displayProduct);
    addProductToDeckGroup({
      deckId: deck.data!.id,
      product: displayProduct!,
      group: "commander",
    });
  };

  const handleClickSellOneButton = async (product: any) => {
    if (!user) return modals.show("/auth/sign-in-modal");
    if (!product) return;
    let listing = db.Listing.new<Listing.Product>({
      for: "product",
      product: {
        id: product.id,
      },
    });
    listing.photos = entityManager.create([
      { url: product!.photos.entities[0].url },
    ]);
    listing.price = parseFloat(product.traits.prices.usd ?? "0.00");
    listing.title = product!.title;
    listing.user = {
      id: user.id,
      storefront: user.storefront,
      stripe: { id: user.stripe!.id },
    };
    await db.Listing.save(listing);
    queryClient.setQueryData(["listings", listing.id], listing);
    router.push(routes.listings.edit(listing.id));
  };

  return iff(
    !!displayProduct,
    <div className="overflow-y-auto flex flex-col gap-y-4 px-2 w-full">
      <div
        data-name="card-preview:image-container"
        className="w-full"
        style={{ perspective: "1000px" }}
      >
        <Link
          href={routes.products(displayProduct?.id)}
          data-name="card-preview:flip-inner"
          className={twMerge(
            "relative transition duration-500 aspect-card w-full h-full rounded-lg block shadow-md",
            displayProduct?.traits.layout === "transform" &&
              "hover:[transform:rotateY(180deg)]"
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <Img
            alt="Card Image"
            containerClassName="object-contain hover:cursor-pointer rounded-lg absolute top-0 bottom-0 left-0 right-0 backface-hidden"
            src={displayProduct?.photos?.entities?.[0]?.url}
            fill
            bgColor="bg-gray-200"
          />

          <Img
            alt="Card Image Back"
            className="object-contain hover:cursor-pointer rounded-lg"
            containerClassName="absolute top-0 bottom-0 left-0 right-0 [transform:rotateY(180deg)] backface-hidden"
            src={displayProduct?.traits.card_faces?.[1]?.image_uris?.normal}
            fill
          />
        </Link>
        {iff(
          type == "deck-card" && deckCard.data?.traits.finish === "foil",
          <FoilOverlay />
        )}
      </div>

      {iff(
        (deck.data?.format === "commander" ||
          deck.data?.format === "pauper-commander") &&
          editable,
        <div className="rounded-xl flex w-full">
          <Button
            variant="primary"
            className="text-sm w-full"
            onClick={handleClickSetCommander}
          >
            Set as Commander
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-y-4">
        {/* Oracle Text */}
        <section className="w-full flex flex-col gap-y-4 text-start bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
          <div>
            {renderOracleText(displayProduct?.traits?.oracle_text ?? "")}
          </div>
          <div className="text-xs">
            <span className="font-semibold ">Illustrated by: </span>
            {displayProduct?.traits.artist}
          </div>
        </section>

        {/* Flavor Text */}
        {displayProduct?.traits.flavor_text ? (
          <section className="italic p-4 bg-violet-100 text-violet-900 rounded-lg text-sm">
            {displayProduct?.traits.flavor_text}
          </section>
        ) : null}

        {/* Legality Information; need to turn into accordion */}
        <Accordion label="Card Legality" error={undefined}>
          <section className="flex flex-wrap gap-y-2 w-full text-start p-0 rounded-lg text-sm">
            {Object.entries(legalities ?? []).map(([key, value]) => {
              const badgeColors = {
                legal: "bg-green-500",
                not_legal: "bg-gray-500",
                restricted: "bg-yellow-500",
                banned: "bg-red-500",
              };
              const color = badgeColors[value as LegalStatus];
              return (
                <div className="flex w-1/2 items-center" key={key}>
                  <figure
                    className={twMerge(
                      "p-2 rounded-md w-1/2 sm:1/3 text-center text-xs uppercase tracking-tight whitespace-nowrap text-white",
                      color
                    )}
                  >
                    {startCase(value)}
                  </figure>
                  <label className="ml-2 w-1/2 text-ellipsis whitespace-nowrap overflow-clip tracking-tight">
                    {startCase(key)}
                  </label>
                </div>
              );
            })}
          </section>
        </Accordion>

        {/* Buy and Sell Buttons */}
        <div
          data-name="card-preview:buy-sell-buttons"
          className="rounded-xl w-full flex justify-around 3xl:px- mb-6"
        >
          <Button
            variant="primary"
            className="p-2 flex flex-col items-center justify-center w-full rounded-r-none"
            onClick={handleClickSellOneButton}
          >
            <BoltIcon className="w-6" />
            <h5 className="text-xs">Sell</h5>
          </Button>
          <Button
            as="Link"
            href={routes.products(displayProduct?.id)}
            variant="primary"
            className="p-2 flex flex-col items-center justify-center w-full rounded-l-none border-l border-orange-200"
          >
            <h2 className="w-full flex flex-col items-center justify-center gap-y-4 h-7">
              {iff(
                !!displayProduct?.traits?.prices?.usd,
                <p className="text-xl ">
                  {numeral(displayProduct?.traits?.prices?.usd).format()}
                </p>,
                <p className="text-sm flex items-center leading-3 text-center mb-0">
                  No Listings
                </p>
              )}
            </h2>
            <h5 className="text-xs">Buy</h5>
          </Button>
        </div>
      </div>
    </div>,
    <div data-name="card-preview:placeholder" className="w-full px-2">
      <div
        data-name="card-preview:placeholder:image-container"
        className="w-full aspect-card bg-gray-200 rounded-xl flex items-center justify-center"
      >
        <Image
          priority
          src={logoNoText}
          alt="listr"
          className="rounded-lg opacity-80 filter grayscale"
          width={72}
        />
      </div>
      <div className="flex justify-center w-full italic">
        Hover over a card!
      </div>
    </div>
  );
}

export function useAddProductToDeckGroup() {
  const queryClient = useQueryClient();
  const count = useRef(0); // number of times the function is called in a given time period

  type AddProductToDeckGroupParams = {
    deckId: string;
    product: Product.Card.MtgCard;
    group: string;
  };

  type AddProductToDeckGroupMutationParams = AddProductToDeckGroupParams & {
    count: number;
  };

  const { mutate } = useMutation({
    mutationFn: async ({
      deckId,
      product,
      group,
      count,
    }: AddProductToDeckGroupMutationParams) => {
      if (!deckId || !product) return;
      const deckCard = await db.Deck.card.findOneOrCreate<Deck.Card.Mtg>(
        deckId,
        { "product.id": product.id, group },
        {
          deck: { id: deckId },
          quantity: 0,
          product: { id: product.id, line: product.line },
          traits: {
            finish: iff(
              product.traits.finishes.includes("nonfoil"),
              "nonfoil",
              product.traits.finishes[0] ?? "nonfoil"
            ),
          },
        }
      );
      await db.Deck.card.update(deckId, deckCard.id, {
        quantity: increment(count),
      });

      const deck = await db.Deck.findById<Deck.Mtg>(deckId);
      if (!deck) return;

      // update deck photo if it's the default photo
      if (deck.photoUrl === DefaultDeckPhotoUrl)
        deck.photoUrl =
          product.traits.image_uris?.art_crop ?? DefaultDeckPhotoUrl;

      // update deck colors
      product?.traits.color_identity?.forEach(
        (color) => (deck.traits.colors[color] += 1)
      );

      deck.updatedAt = currentTimestamp();
      await db.Deck.save(deck);
      return deckCard;
    },

    onSuccess: (deckCard, { deckId }) => {
      count.current = 0;
      // re-fetch deck cards and re-calculate deck cost & quantity
      queryClient.invalidateQueries({ queryKey: queryKey.deckCards(deckId) });
      // re-fetch deck card for updated quantity
      queryClient.invalidateQueries({
        queryKey: queryKey.deckCard(deckId, deckCard?.id),
      });
      // re-fetch deck for updated photo
      queryClient.invalidateQueries({
        queryKey: queryKey.deck(deckId),
      });
    },
  });

  const updateQueryData = ({
    deckCard,
    quantity,
  }: {
    deckCard: Deck.Card.Mtg;
    quantity: number;
  }) => {
    queryClient.setQueryData(
      queryKey.deckCard(deckCard.deck.id, deckCard.id),
      (old: Deck.Card.Mtg) => {
        const copy = { ...old };
        copy.quantity = Math.max(quantity, 0);
        return copy;
      }
    );
  };

  const debouncedMutate = useCallback(
    debounce(({ deckId, product, group }: AddProductToDeckGroupParams) => {
      mutate({ deckId, product, group, count: count.current });
    }, 500),
    []
  );

  const addProductToDeckGroup = ({
    deckId,
    product,
    group,
  }: AddProductToDeckGroupParams) => {
    count.current++;
    debouncedMutate({ deckId, product, group });
  };

  return addProductToDeckGroup;
}

export function useMoveCardToDeckGroup() {
  const queryClient = useQueryClient();
  const count = useRef(0); // number of times the function is called in a given time period

  type MoveCardToDeckGroupParams = {
    deckCard: Deck.Card.Mtg;
    group: string;
  };
  const { mutate } = useMutation({
    mutationFn: async ({ deckCard, group }: MoveCardToDeckGroupParams) => {
      // decrement deck card quantity
      if (deckCard.quantity > 1)
        await db.Deck.card.update(deckCard.deck.id, deckCard.id, {
          quantity: deckCard.quantity - 1,
        });
      else await db.Deck.card.delete(deckCard.deck.id, deckCard.id);

      // increment deck card quantity in new group
      const otherDeckCard = await db.Deck.card.findOneOrCreate<Deck.Card.Mtg>(
        deckCard.deck.id,
        { "product.id": deckCard.product.id, group },
        {
          deck: { id: deckCard.deck.id },
          quantity: 0,
          product: {
            id: deckCard.product.id,
            line: deckCard.product.line,
          },
          traits: {
            finish: "nonfoil",
          },
        }
      );
      await db.Deck.card.update(deckCard.deck.id, otherDeckCard.id, {
        quantity: increment(count.current),
      });

      return otherDeckCard;
    },

    onMutate: async ({ deckCard, group }) => {
      await queryClient.cancelQueries({
        queryKey: queryKey.deckCard(deckCard.deck.id, deckCard.id),
      });

      const previousDeckCard = queryClient.getQueryData(
        queryKey.deckCard(deckCard.deck.id, deckCard.id)
      );

      updateQueryData({ deckCard, group });

      return { previousDeckCard };
    },
    onError: (err, { deckCard, group }, context) => {
      queryClient.setQueryData(
        queryKey.deckCard(deckCard.deck.id, deckCard.id),
        context?.previousDeckCard
      );
    },
    onSettled: async (data, err, { deckCard, group }, context) => {
      // re-fetch deck card for updated quantity
      return await queryClient.invalidateQueries({
        queryKey: queryKey.deckCard(deckCard.deck.id, deckCard.id),
      });
    },
    onSuccess: (otherDeckCard, { deckCard }) => {
      count.current = 0;
      // re-fetch deck cards and re-calculate deck cost & quantity
      queryClient.invalidateQueries({
        queryKey: queryKey.deckCards(deckCard.deck.id),
      });
      // re-fetch other deck card for updated quantity
      queryClient.invalidateQueries({
        queryKey: queryKey.deckCard(deckCard.deck.id, otherDeckCard.id),
      });
    },
  });

  const updateQueryData = ({ deckCard, group }: MoveCardToDeckGroupParams) => {
    queryClient.setQueryData(
      queryKey.deckCard(deckCard.deck.id, deckCard.id),
      (old: Deck.Card) => {
        const copy = { ...old };
        copy.quantity = Math.max(deckCard.quantity - 1, 0);
        return copy;
      }
    );
  };

  const debouncedMutate = useCallback(
    debounce(({ deckCard, group }: MoveCardToDeckGroupParams) => {
      mutate({ deckCard, group });
    }, 500),
    []
  );

  const moveCardToDeckGroup = ({
    deckCard,
    group,
  }: MoveCardToDeckGroupParams) => {
    count.current++;
    updateQueryData({ deckCard, group });
    debouncedMutate({ deckCard, group });
  };

  return moveCardToDeckGroup;
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  type UpdateQuantityParams = {
    deckId: Deck["id"] | undefined;
    deckCardId: Deck.Card["id"] | undefined;
    quantity: number;
    onSettled?: () => void;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      deckId,
      deckCardId,
      quantity,
    }: UpdateQuantityParams) => {
      if (!deckId || !deckCardId) return;
      if (quantity <= 0) {
        // update deck colors
        const deck = await db.Deck.findById<Deck.Mtg>(deckId);
        if (!deck) return;
        const deckCard = await db.Deck.card.findById<Deck.Card.Mtg>(
          deckId,
          deckCardId
        );
        const product = await db.Product.findById<Product.Card.MtgCard>(
          deckCard?.product.id
        );
        product?.traits.color_identity?.forEach(
          (color) =>
            (deck.traits.colors[color] = Math.max(
              deck.traits.colors[color] - 1,
              0
            ))
        );

        await db.Deck.save(deck);
        await db.Deck.card.delete(deckId, deckCardId);
      } else {
        await db.Deck.card.update(deckId, deckCardId, {
          quantity,
        });
      }
    },
    onMutate: async ({ deckId, deckCardId, quantity }) => {
      await queryClient.cancelQueries({
        queryKey: queryKey.deckCard(deckId, deckCardId),
      });

      const previousDeckCard = queryClient.getQueryData(
        queryKey.deckCard(deckId, deckCardId)
      );

      updateQueryData({ deckId, deckCardId, quantity });

      return { previousDeckCard };
    },
    onError: (err, { deckId, deckCardId }, context) => {
      debug("Error updating deck card quantity", err);
      queryClient.setQueryData(
        queryKey.deckCard(deckId, deckCardId),
        context?.previousDeckCard
      );
      queryClient
        .getDefaultOptions()
        .mutations?.onError?.(err, { deckId, deckCardId }, context);
    },
    onSettled: async (
      data,
      err,
      { deckId, deckCardId, quantity, onSettled },
      context
    ) => {
      if (quantity == 0)
        await queryClient.invalidateQueries({
          queryKey: queryKey.deckCards(deckId),
        });
      else
        await queryClient.invalidateQueries({
          queryKey: queryKey.deckCard(deckId, deckCardId),
        });

      onSettled?.();
    },
    onSuccess: async (data, { deckId }) => {
      // re-fetch deck cards and re-calculate deck cost & quantity
      await queryClient.invalidateQueries({
        queryKey: queryKey.deckCards(deckId),
      });

      const deckCards = queryClient.getQueryData<Deck.Card[]>(
        queryKey.deckCards(deckId)
      );
      if (isEmpty(deckCards))
        db.Deck.update(deckId!, {
          updatedAt: currentTimestamp(),
          photoUrl: DefaultDeckPhotoUrl,
        });

      queryClient.invalidateQueries({
        queryKey: queryKey.deck(deckId),
      });
    },
  });

  const updateQueryData = ({
    deckId,
    deckCardId,
    quantity,
  }: UpdateQuantityParams) => {
    queryClient.setQueryData(
      queryKey.deckCard(deckId, deckCardId),
      (old: Deck.Card) => {
        const copy = { ...old };
        copy.quantity = Math.max(quantity, 0);

        return copy;
      }
    );
  };

  const debouncedMutate = useCallback(
    debounce((params: UpdateQuantityParams) => {
      mutate(params);
    }, 500),
    []
  );

  const updateQuantity = ({
    deckId,
    deckCardId,
    quantity,
    onSettled,
  }: UpdateQuantityParams) => {
    updateQueryData({ deckId, deckCardId, quantity });
    debouncedMutate({ deckId, deckCardId, quantity, onSettled });
  };

  return { mutate: updateQuantity, isPending };
}

/**
 * Populate deck cards with product data. Creates a new array of populated deck cards.
 */
export function useMemoizedPopulatedDeckCards(
  deckCards: UseQueryResult<Deck.Card[]>,
  deckCardsProducts: UseQueriesResult<Product | null>
) {
  const queryClient = useQueryClient();
  const prevValue = useRef<PopulatedDeckCard[] | undefined>(undefined);

  const populatedDeckCards = useMemo(() => {
    if (
      deckCardsProducts.isPending ||
      deckCards.isPending ||
      deckCards.isFetching
    )
      return prevValue.current;
    const populatedDeckCards = deckCards.data?.reduce((acc, deckCard) => {
      const product = queryClient.getQueryData<Product>(
        queryKey.product(deckCard.product.id)
      );
      if (product)
        acc.push({
          ...deckCard,
          product: product as Product.Card.MtgCard,
        });

      return acc;
    }, [] as PopulatedDeckCard[]);
    prevValue.current = populatedDeckCards;
    return populatedDeckCards;
  }, [deckCardsProducts.isPending, deckCards.isPending, deckCards.isFetching]);

  return populatedDeckCards;
}

export function useMemoizedCost(
  populatedDeckCards: PopulatedDeckCard[] | undefined
) {
  const cost = useMemo(() => {
    if (!populatedDeckCards) return undefined;
    return populatedDeckCards.reduce((acc, populatedDeckCard) => {
      const price =
        numeral(populatedDeckCard.product.traits.prices.usd).value() ?? 0;
      return acc + price * populatedDeckCard.quantity;
    }, 0);
  }, [populatedDeckCards]);

  return cost;
}

export function useMemoizedQuantity(deckCards: UseQueryResult<Deck.Card[]>) {
  const prevQuantity = useRef<number | undefined>(undefined);
  const quantity = useMemo(() => {
    if (!deckCards.data || deckCards.isFetching) return prevQuantity.current;
    return deckCards.data.reduce((accumulator, deckCard) => {
      return accumulator + deckCard.quantity;
    }, 0);
  }, [deckCards.isFetching]);

  useEffect(() => {
    prevQuantity.current = quantity;
  }, [quantity]);

  return quantity;
}

type UseQueriesResult<T> = {
  data: (T | undefined)[];
  isPending: boolean;
};

export function useDeckCardsProducts<T extends Product>(
  deckCards: UseQueryResult<Deck.Card[]>
) {
  const deckCardsProducts: UseQueriesResult<T | null> = useQueries({
    queries:
      deckCards.data?.map((deckCard) => ({
        queryKey: queryKey.product(deckCard.product.id),
        queryFn: () => db.Product.findById<T>(deckCard.product.id),
      })) ?? [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isPending:
          !deckCards.data || results.some((result) => result.isPending),
      };
    },
  });

  return deckCardsProducts;
}

export function DeckHeader({
  deckId,
  editable,
}: {
  deckId: string;
  editable: boolean;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUserStore();
  const deck = hooks.decks.useDeck(deckId);
  const deckUser = hooks.users.useUser(deck.data?.user.id);
  const deckCards = hooks.decks.useDeckCards<Deck.Card.Mtg>({ deckId });
  const deckCardsProducts =
    useDeckCardsProducts<Product.Card.MtgCard>(deckCards);
  const populatedDeckCards = useMemoizedPopulatedDeckCards(
    deckCards,
    deckCardsProducts
  );
  const quantity = useMemoizedQuantity(deckCards);
  const cost = useMemoizedCost(populatedDeckCards);
  const { modals } = useModalStore();
  const [copied, setCopied] = useState(false);

  const deleteDeck = useMutation({
    mutationFn: async () => {
      await db.Deck.card.deleteMany(deckId);
      return await db.Deck.delete(deckId);
    },
    onSuccess: () => {
      router.push(routes.myCards.decks.home);
      queryClient.invalidateQueries({ queryKey: queryKey.deck(deckId) });
      queryClient.invalidateQueries({
        queryKey: queryKey.decks({ "user.id": user?.id }),
      });
    },
  });

  const handleClickDeleteDeck = async () => {
    modals.show("/general/message-modal", {
      heading: "Delete Deck",
      body: (
        <>
          Are you sure you want to delete the deck:{" "}
          <span className="font-medium">{deck.data!.name}</span>?
        </>
      ),
      leftButton: "Cancel",
      rightButton: "Delete",
      onClickRightButton: async () => await deleteDeck.mutateAsync(),
      loadingText: "Deleting...",
    });
  };

  const handleClickEditDeck = async () => {
    if (!deck.data) return;
    modals.show("/decks/edit-deck-modal", {
      deck: deck.data!,
    });
  };

  const handleClickImportDeck = async () => {
    if (!deck.data) return;
    modals.show("/decks/card-list-import-modal", {
      deck: deck.data,
    });
  };

  const handleClickExportDeck = async () => {
    modals.show("/decks/card-list-export-modal", {
      deckCards: deckCards.data,
      deck: deck.data,
    });
  };

  const handleClickPrecons = async () => {
    if (!deck.data) return;
    modals.show("/decks/precons-modal", {
      targetDeck: deck.data,
    });
  };
  const handleClickUsername = async (userHandle: string | undefined) => {
    mixpanel.actions.deck.userHandleClicked(userHandle);
    router.push(routes.storefront.decks(userHandle));
  };

  const handleClickShare = () => {
    let url = window.location.href;
    if (url.includes("/my-cards")) url = url.replace("/my-cards", "");

    navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <header className="text-xl lg:text-2xl bg-gray-100 rounded-xl font-medium flex-col relative text-white">
      <div className="relative flex w-full h-full z-[1] bg-gradient-to-r from-black/85 via-black/70 to-transparent/0 flex-col items-start border rounded-xl justify-between p-4">
        <h4 className="text-sm text-gray-400">
          {iff(
            !!deck.data,
            startCase(deck.data?.format),
            <Skeleton width={40} />
          )}
        </h4>
        <h3 className="text-2xl sm:text-3xl whitespace-break-spaces mb-2">
          {deck?.data?.name ?? <Skeleton width={56} />}
        </h3>
        <div className="flex flex-wrap text-sm text-gray-400 mb-1">
          {quantity ?? <Skeleton width={20} />}
          &nbsp;cards&nbsp;•&nbsp;
          {iff(isNumber(cost), numeral(cost).format(), <Skeleton width={20} />)}
          &nbsp;•&nbsp;
          <Button
            onClick={() =>
              handleClickUsername(deckUser.data?.storefront.handle)
            }
            variant="outline"
            className="p-0"
          >
            @{deckUser.data?.storefront.handle ?? <Skeleton width={40} />}
          </Button>
        </div>

        <div className="flex items-center text-xs text-gray-400 font-normal">
          <ClockIcon className="inline-block size-4 mr-1" />
          Updated{" "}
          {iff(
            !!deck.data,
            formatDistanceToNowStrict(new Date(deck.data?.updatedAt ?? 0)) +
              " ago",
            <Skeleton width={50} />
          )}
        </div>
      </div>
      <div className="absolute z-[5] top-2 right-2 sm:top-4 sm:right-4 flex gap-x-2">
        {iff(
          editable,
          <Button
            variant="none"
            className="flex-col items-center lg:hidden text-xs backdrop-blur-md justify-center p-1 sm:p-2 text-white hover:bg-orange-500"
            disabled={!deck.data}
            onClick={() =>
              modals.show("/decks/add-to-deck-search-modal", {
                deck: deck.data!,
              })
            }
          >
            <PlusCircleIcon className="size-6 block" />
          </Button>
        )}

        <Button
          variant="none"
          className="flex-none flex items-center justify-center backdrop-blur-md bg-black/10 hover:bg-black/30 transition-colors rounded-lg text-sm px-2"
          onClick={handleClickShare}
        >
          {copied ? "Link Copied!" : <ShareIcon className="size-5" />}
        </Button>
        <GenericActionMenu
          autoPlacement={false}
          className="flex-none flex items-center justify-center backdrop-blur-md bg-black/10 hover:bg-black/30 transition-colors rounded-lg"
          button={<EllipsisVerticalIcon className="size-6 text-white" />}
          items={iff(
            !editable,
            [
              {
                label: "Export Deck",
                onClick: handleClickExportDeck,
                icon: <ArrowLongUpIcon className="w-5" />,
              },
            ],
            [
              {
                label: "Edit Deck",
                onClick: handleClickEditDeck,
                icon: <PencilIcon className="w-5" />,
              },
              {
                label: "Import Deck",
                onClick: handleClickImportDeck,
                icon: <ArrowLongDownIcon className="w-5" />,
              },
              {
                label: "Export Deck",
                onClick: handleClickExportDeck,
                icon: <ArrowLongUpIcon className="w-5" />,
              },
              {
                label: "Delete Deck",
                onClick: handleClickDeleteDeck,
                icon: <TrashIcon className="w-5" />,
              },
              {
                label: "Preconstructed Decks",
                onClick: handleClickPrecons,
                icon: <DocumentPlusIcon className="w-5" />,
              },
            ]
          )}
        />
      </div>
      {is.deck.mtg(deck.data) && (
        <DeckColors
          size={20}
          colors={deck.data?.traits.colors}
          className="absolute bottom-2 right-4 z-[2]"
        />
      )}
      <div
        className="absolute inset-0 rounded-xl z-0 bg-gray-200"
        style={{
          backgroundImage: `url(${deck.data?.photoUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </header>
  );
}

export function DeckPane({
  deckId,
  onHoverDeckCard,
  editable,
  className,
}: {
  deckId: Deck["id"];
  onHoverDeckCard: (deckCard: Deck.Card.Mtg | null | undefined) => void;
  editable: boolean;
  className?: string;
}) {
  const { user } = useUserStore();
  const [viewAs, setViewAs] = useState<"Grid" | "Text">("Text");
  const [groupBy, setGroupBy] = useState<
    "Types" | "Categories" | "Mana Value" | "Color"
  >("Categories");
  const deck = hooks.decks.useDeck(deckId);
  const deckCards = hooks.decks.useDeckCards<Deck.Card.Mtg>({ deckId });
  const deckCardsProducts = useDeckCardsProducts(deckCards);
  const populatedDeckCards = useMemoizedPopulatedDeckCards(
    deckCards,
    deckCardsProducts
  );

  // Card Views
  const Views = {
    Grid: (
      <ViewAsGrid
        populatedDeckCards={populatedDeckCards}
        onHover={onHoverDeckCard}
        editable={editable}
      />
    ),
    Text: (
      <ViewAsText
        populatedDeckCards={populatedDeckCards}
        onHover={onHoverDeckCard}
        editable={editable}
      />
    ),
  };

  return (
    <section
      data-name="cards"
      className={twMerge(
        "flex flex-col p-4 overflow-y-auto gap-y-4 w-full h-full",
        className
      )}
    >
      {/* Header */}
      <DeckHeader deckId={deckId} editable={editable} />

      <div>
        {deckCards.isSuccess && isEmpty(deckCards.data) ? (
          <EmptyDeckState deck={deck.data} editable={editable} />
        ) : (
          <>
            <div
              data-name="deck-pane:view-options"
              className="flex flex-wrap justify-start gap-4 mb-1"
            >
              <div className="flex flex-col gap-y-1">
                <label className="flex items-center gap-x-1 text-sm text-gray-500">
                  <EyeIcon className="size-4 inline-block" />
                  View as
                </label>
                <DropdownComponent
                  options={["Grid", "Text"]}
                  onClickOption={setViewAs}
                  initialOption={viewAs}
                  className="w-40 text-sm"
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <label className="flex items-center gap-x-1 text-sm text-gray-500">
                  <RectangleGroupIcon className="size-4 inline-block" />
                  Group by
                </label>
                <DropdownComponent
                  // options={["Types", "Categories", "Mana Value", "Color"]}
                  options={["Categories"]}
                  onClickOption={setGroupBy}
                  initialOption={groupBy}
                  className="w-40 text-sm"
                />
              </div>
            </div>

            <div
              data-name="deck-pane:cards"
              className="sm:px-2 pb-14 @container z-[2] flex flex-col gap-y-16 w-full h-full"
            >
              {Views[viewAs]}

              <hr className="my-2" />

              <LoadOnScroll>
                <DeckDataVisualizer populatedDeckCards={populatedDeckCards} />
              </LoadOnScroll>

              <hr className="my-2" />

              <LoadOnScroll>
                <TestHand
                  populatedDeckCards={populatedDeckCards}
                  editable={editable}
                />
              </LoadOnScroll>

              {iff(!user, <Banner />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type DeckDataVisualizerProps = {
  populatedDeckCards: PopulatedDeckCard[] | undefined;
};

function DeckDataVisualizer({ populatedDeckCards }: DeckDataVisualizerProps) {
  let manaCostGroups: any = Array(10)
    .fill(0)
    .map(() => ({ cards: [], colorGroupings: {} })); // Initialize colorGroupings as an empty object

  populatedDeckCards?.forEach((card: PopulatedDeckCard) => {
    const manaCost = card.product.traits.cmc;

    if (manaCost >= 1 && manaCost <= 10) {
      const index = manaCost - 1;
      manaCostGroups[index].cards.push(card);
    }
  });

  // Define a mapping of color identities to colors with hex, value, and label
  const colorMapping: {
    [key: string]: { hex: string; value: string; label: string };
  } = {
    U: { hex: "#0000FF", value: "U", label: "Blue" },
    B: { hex: "#000000", value: "B", label: "Black" },
    R: { hex: "#DC143C", value: "R", label: "Red" },
    W: { hex: "#FFFFFF", value: "W", label: "White" },
    G: { hex: "#008000", value: "G", label: "Green" },
    multi: { hex: "#FFA500", value: "multi", label: "Multi-Colored" },
    colorless: { hex: "#CBC3E3", value: "colorless", label: "Colorless" },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* <button onClick={() => console.log(data)}>log data</button> */}
      <h1 className="w-full text-center">Mana Curve</h1>
      <div
        data-name="deck-stats:chart:container"
        className="w-full sm:w-3/4 mx-auto h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="" />
            <XAxis dataKey="manaCost" />
            <YAxis />
            <Tooltip />
            <Legend />

            {
              //@ts-ignore
              colorKeys.map((colorKey) => (
                <Bar
                  key={colorMapping[colorKey].value}
                  dataKey={colorMapping[colorKey].value}
                  name={colorMapping[colorKey].label}
                  stackId="a"
                  fill={colorMapping[colorKey].hex} // Use the color mapping for fill
                  onClick={() => console.log(colorMapping[colorKey])}
                />
              ))
            }
            {/* <Bar dataKey="total" fill="#808080" stackId="a" name="Total" /> */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Banner() {
  const { modals } = useModalStore();

  return (
    <footer className="text-start p-5 flex flex-col justify-center items-center bg-gray-200 rounded-xl mt-auto">
      <h2 className="text-xl mb-2 font-bold">
        Unleash Your Inner Planeswalker!
      </h2>
      <div>Sign up for $5 credit to use when our marketplace goes live!</div>
      <Button
        variant="primary"
        className="mt-2"
        onClick={() => {
          mixpanel.pages.decks.sign_up();
          modals.show("/auth/sign-up-modal");
        }}
      >
        Sign Up
      </Button>
    </footer>
  );
}

type TestHandProps = {
  populatedDeckCards: PopulatedDeckCard[] | undefined;
  editable: boolean;
};

function TestHand({ populatedDeckCards, editable }: TestHandProps) {
  const { modals } = useModalStore();
  const [handSize, setHandSize] = useState(7);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [shuffledCards, setShuffledCards] = useState<PopulatedDeckCard[]>([]);
  const [ref, { width }] = useMeasure<HTMLDivElement>();

  const shuffleCards = () => {
    const cards: PopulatedDeckCard[] | undefined = populatedDeckCards?.flatMap(
      (card, index) =>
        Array.from({ length: card.quantity }, () => ({ ...card, index }))
    );

    setShuffledCards(shuffle(cards ?? []));
  };

  useEffect(() => shuffleCards(), [populatedDeckCards]);

  const handleClickCard = (index: number, card: PopulatedDeckCard) => {
    if (index === focusedCardIndex || width >= parseInt(tw.theme.screens.sm)) {
      modals.show("/decks/card-details-modal", {
        deckId: card.deck.id,
        deckCardId: card.id,
        editable,
      });
    } else {
      setFocusedCardIndex(index);
    }
  };

  const handleClickRedrawHand = () => {
    setHandSize(7);
    shuffleCards();
  };

  const handleClickDrawCard = () => {
    setHandSize(handSize + 1);
    setFocusedCardIndex(null);
  };

  return iff(
    gt(populatedDeckCards?.length, 6),
    <div
      data-name="test-cards:container"
      ref={ref}
      className="flex flex-col items-center gap-y-4 w-full"
    >
      <div className="w-full flex flex-col sm:flex-row justify-center items-center pt-2 min-h-80 sm:h-80">
        {shuffledCards.slice(0, handSize).map((card, index) => (
          <Img
            tabIndex={0}
            alt="Card Image"
            onClick={() => handleClickCard(index, card)}
            containerClassName={twMerge(
              "first:m-0 sm:[&:hover+div]:!ml-0 w-60 sm:px-1 max-sm:mt-[-300px] sm:ml-[max(calc(var(--hand-size)*-5px+var(--min-overlap)),var(--max-overlap))] max-sm:[&:+div]:!mt-2",
              index === focusedCardIndex && "max-sm:[&+div]:!mt-2"
            )}
            containerStyle={{
              "--hand-size": handSize,
              "--min-overlap": "-50px",
              "--max-overlap": "-180px",
              transition: "margin 0.3s ease-in-out",
            }}
            className="object-contain hover:cursor-pointer"
            src={card?.product.photos?.entities?.[0]?.url}
            width={190}
            height={265}
            bgColor="bg-gray-200"
          />
        ))}
      </div>

      <div className="flex gap-x-2">
        <Button
          variant="primary"
          className="text-sm"
          onClick={handleClickRedrawHand}
        >
          Re-Draw Hand
        </Button>
        <Button
          variant="secondary"
          className="text-sm"
          onClick={handleClickDrawCard}
        >
          Draw Card
        </Button>
      </div>
    </div>
  );
}
