import db from "@/modules/db";
import { useQuery } from "@tanstack/react-query";
import queryKey from "../../query-key";
import { Listing } from "@/types/App/Listing";

export function useListing<T extends Listing = Listing>(
  listingId: string | undefined
) {
  const listing = useQuery({
    queryKey: queryKey.listing(listingId),
    queryFn: () => db.Listing.findById<T>(listingId),
    enabled: !!listingId,
  });

  return listing;
}
