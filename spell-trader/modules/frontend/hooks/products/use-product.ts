import db from "@/modules/db";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import queryKey from "@/modules/frontend/query-key";
import { Product } from "@/types/App/Product";

export function useProduct<S extends Product = Product>(
  productId: string | undefined,
  queryOptions: Partial<UseQueryOptions<S | null>> = {}
) {
  const product = useQuery({
    queryKey: queryKey.product(productId),
    queryFn: () => db.Product.findById<S>(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...queryOptions,
  });

  return product;
}
