import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import queryKey from "@/modules/frontend/query-key";
import { Listing } from "@/types/App/Listing";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useListings<T extends Listing = Listing>({
  filters = {},
  options = {},
  queryOptions = {},
}: {
  filters?: Clauses<T>;
  options?: Options<T>;
  queryOptions?: Partial<UseQueryOptions<T[]>>;
}) {
  const listings = useQuery({
    queryKey: queryKey.listings(filters, options),
    queryFn: async () => db.Listing.find<T>(filters, options),
    ...queryOptions,
  });

  return listings;
}
