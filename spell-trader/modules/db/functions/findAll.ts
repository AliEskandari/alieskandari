import { Data, DotNotation } from "@/types/utilities";
import {
  Firestore,
  QueryConstraint,
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import dbDebug from "../debug";

export type FindAllFunctionGenerator = <T>(
  db: Firestore,
  collectionId: string
) => FindAllFunction<T>;

export type ClauseValue = Data | Data[];
export type Clauses<T> = Partial<Record<DotNotation<T>, ClauseValue>>;

export type Options<T> = {
  /**
   * The field to sort by. Can be a path (e.g. 'auction.duration') or a simple property (e.g. 'title')
   */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  startAfter?: T[keyof T];
};

export type FindAllFunction<T> = <S extends T = T>(
  clauses?: Clauses<S>,
  options?: Options<S>
) => Promise<S[]>;

export const findAll: FindAllFunctionGenerator = <T>(
  db: Firestore,
  collectionId: string
) => {
  const findAllFn: FindAllFunction<T> = async <S extends T = T>(
    clauses?: Clauses<S>,
    options?: Options<S>
  ) => {
    return findAllWithCollectionId<S>(db, collectionId, clauses, options);
  };

  return findAllFn;
};

export const findAllWithCollectionId = async <S>(
  db: Firestore,
  collectionId: string,
  clauses?: Clauses<S>,
  options?: Options<S>
) => {
  const debug = dbDebug.extend(collectionId);
  debug(
    "Finding all docs accross all '%s' collections with contraints... %O",
    collectionId,
    clauses
  );
  const clausesArray: Array<[string, ClauseValue]> = Object.entries(
    clauses ?? {}
  );
  const queryContstraints: QueryConstraint[] = clausesArray.reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value) && !!value.length)
        acc.push(where(key, "in", value));
      else acc.push(where(key, "==", value));
      return acc;
    },
    [] as QueryConstraint[]
  );

  if (options?.sortBy)
    queryContstraints.push(
      orderBy(options.sortBy, options.sortDirection ?? "desc")
    );

  if (options?.startAfter)
    queryContstraints.push(startAfter(options.startAfter));

  if (options?.limit) queryContstraints.push(limit(options.limit));

  const q = query(collectionGroup(db, collectionId), ...queryContstraints);

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as S);
};
