import {
  Firestore,
  QueryConstraint,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import dbDebug from "../debug";
import { Data, DotNotation, Primitive } from "@/types/utilities";
import { Identifiable } from "@/types/Utility/Identifiable";
import { isArguments, isEmpty, isNull } from "lodash";

export type FindFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => FindFunction<T> | FindFunctionWithArg<T>;

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

export type FindFunction<T> = <S extends T = T>(
  clauses?: Clauses<S>,
  options?: Options<S>
) => Promise<S[]>;

export type FindFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  clauses?: Clauses<S>,
  options?: Options<S>
) => Promise<S[]>;

export const find: FindFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath === "function") {
    const findFn: FindFunctionWithArg<T> = async <S extends T = T>(
      parentId: string,
      clauses?: Clauses<S>,
      options?: Options<S>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return findWithCollectionPath<S>(db, _collectionPath, clauses, options);
    };

    return findFn;
  } else {
    const findFn: FindFunction<T> = async <S extends T = T>(
      clauses?: Clauses<S>,
      options?: Options<S>
    ) => {
      return findWithCollectionPath<S>(db, collectionPath, clauses, options);
    };

    return findFn;
  }
};

export const findWithCollectionPath = async <S>(
  db: Firestore,
  collectionPath: string,
  clauses?: Clauses<S>,
  options?: Options<S>
) => {
  const debug = dbDebug.extend(collectionPath);
  debug("Finding docs with constraints... %O", clauses);
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

  const q = query(collection(db, collectionPath), ...queryContstraints);

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as S);
};
