import db from "@/modules/db";
import { Clauses, Options } from "@/modules/db/functions/find";
import { User } from "@/types/App/User";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import queryKey from "../../query-key";

type FindParams = {
  filters?: Clauses<User>;
  options?: Options<User>;
  queryOptions?: Partial<UseQueryOptions<User | null>>;
};

export function useUser(userIdOrFindParams: string | undefined | FindParams) {
  let _queryKey, queryFn, _queryOptions;
  if (typeof userIdOrFindParams === "string" || !userIdOrFindParams) {
    const userId = userIdOrFindParams;
    _queryKey = queryKey.user(userId);
    queryFn = () => db.User.findById(userId);
    _queryOptions = {
      enabled: !!userId,
    };
  } else {
    const { filters, options, queryOptions } = userIdOrFindParams;
    _queryKey = queryKey.user({ filters, options });
    queryFn = async () => db.User.findOne(filters, options);
    _queryOptions = {
      ...queryOptions,
    };
  }
  const user = useQuery({
    queryKey: _queryKey,
    queryFn,
    ..._queryOptions,
  });

  return user;
}
