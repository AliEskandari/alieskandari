import { Product } from "@/types/App/Product";
import client from "./client";
import debug from "./debug";
import {
  DocumentSchema,
  SearchParams,
  SearchResponse,
} from "typesense/lib/Typesense/Documents";

type SearchParamsWithGroups = SearchParams &
  Required<Pick<SearchParams, "group_by">>;

export type SearchResponseWithGroups<T extends DocumentSchema> = Omit<
  SearchResponse<T>,
  "hits" | "found_docs"
>;

export async function products<T extends Product>(
  searchParams: SearchParamsWithGroups
): Promise<SearchResponseWithGroups<T>>;

export async function products<T extends Product>(
  searchParams: SearchParams
): Promise<SearchResponse<T>>;

export async function products<T extends Product>(
  searchParams: SearchParams
): Promise<SearchResponse<T> | SearchResponseWithGroups<T>> {
  debug("Searching for products with params %O", searchParams);
  const resp = await client
    .collections<T>("products")
    .documents()
    .search(searchParams, {});

  debug("Found %d products", resp.found);
  if (searchParams.group_by) return resp as SearchResponseWithGroups<T>;
  else return resp as SearchResponse<T>;
}
