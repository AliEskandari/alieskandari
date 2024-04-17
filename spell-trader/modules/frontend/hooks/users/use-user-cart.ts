import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import queryKey from "@/modules/frontend/query-key";
import { Cart } from "@/types/App/Cart";
import { Deck } from "@/types/App/Deck";
import { User } from "@/types/App/User";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useUserCart({
  userId,
  queryOptions = {},
}: {
  userId: User["id"] | undefined;
  queryOptions?: Partial<UseQueryOptions<Cart.Item[]>>;
}) {
  const cart = useQuery({
    queryKey: queryKey.usersCart(userId),
    queryFn: () => db.User.cart.find(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: true,
    ...queryOptions,
  });

  return cart;
}
