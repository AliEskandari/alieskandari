import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import queryKey from "@/modules/frontend/query-key";
import { User } from "@/types/App/User";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useUsers({
  filters = {},
  options = {},
  queryOptions = {},
}: {
  filters?: Clauses<User>;
  options?: Options<User>;
  queryOptions?: Partial<UseQueryOptions<User[]>>;
}) {
  const users = useQuery({
    queryKey: queryKey.users(filters, options),
    queryFn: async () => db.User.find(filters, options),
    ...queryOptions,
  });

  return users;
}
