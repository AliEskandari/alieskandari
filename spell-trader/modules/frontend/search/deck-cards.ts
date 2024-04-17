import { Card } from "@/types/App/Deck/Card";
import {
  SearchParams,
  SearchResponse,
} from "typesense/lib/Typesense/Documents";
import client from "./client";
import debug from "./debug";
import { SearchResponseWithGroups } from "./products";

export async function deckCards<T extends Card>(
  searchParams: SearchParams
): Promise<SearchResponse<T> | SearchResponseWithGroups<T>> {
  debug("Searching for deckCards with params %O", searchParams);
  const resp = await client
    .collections<T>("deckCards")
    .documents()
    .search(searchParams, {});

  debug("Found %d deckCards", resp.found);
  if (searchParams.group_by) return resp as SearchResponseWithGroups<T>;
  else return resp as SearchResponse<T>;
}
