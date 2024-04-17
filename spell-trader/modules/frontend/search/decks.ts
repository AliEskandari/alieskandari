import { Deck } from "@/types/App/Deck";
import {
  SearchParams,
  SearchResponse,
} from "typesense/lib/Typesense/Documents";
import client from "./client";
import debug from "./debug";
import { SearchResponseWithGroups } from "./products";

export async function decks<T extends Deck>(
  searchParams: SearchParams
): Promise<SearchResponse<T> | SearchResponseWithGroups<T>> {
  debug("Searching for decks with params %O", searchParams);
  const resp = await client
    .collections<T>("decks")
    .documents()
    .search(searchParams, {});

  debug("Found %d decks", resp.found);
  if (searchParams.group_by) return resp as SearchResponseWithGroups<T>;
  else return resp as SearchResponse<T>;
}
