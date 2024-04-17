import DeepPartial from "@/types/DeepPartial";
import { Identifiable } from "@/types/Utility/Identifiable";
import { OverriddenProperties, UniqueTo } from "@/types/utilities";
import { Firestore } from "firebase/firestore";
import { set } from "lodash";
import dbDebug from "../debug";
import { createWithCollectionPath } from "./create";
import { Clauses, Options, findWithCollectionPath } from "./find";

export type FindOneOrCreateFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T,
  options?: { debug: boolean }
) => FindOneOrCreateFunction<T> | FindOneOrCreateFunctionWithArg<T>;

export type FindOneOrCreateFunction<T> = <S extends T = T>(
  clauses: Clauses<S>,
  data: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
  options?: Options<S>
) => Promise<S>;

export type FindOneOrCreateFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  clauses: Clauses<S>,
  data: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
  options?: Options<S>
) => Promise<S>;

export const findOneOrCreate: FindOneOrCreateFunctionGenerator = <
  T extends Identifiable
>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T,
  options?: { debug: boolean }
) => {
  if (typeof collectionPath === "function") {
    const findOneOrCreateFn: FindOneOrCreateFunctionWithArg<T> = async <
      S extends T = T
    >(
      parentId: string,
      clauses: Clauses<S>,
      data: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
      options?: Options<S>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return findOneOrCreateWithCollectionPath<S, T>(
        db,
        _collectionPath,
        clauses,
        data,
        _default,
        options
      );
    };

    return findOneOrCreateFn;
  } else {
    const findOneOrCreateFn: FindOneOrCreateFunction<T> = async <
      S extends T = T
    >(
      clauses: Clauses<S>,
      data: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
      options?: Options<S>
    ) => {
      return findOneOrCreateWithCollectionPath<S, T>(
        db,
        collectionPath,
        clauses,
        data,
        _default,
        options
      );
    };

    return findOneOrCreateFn;
  }
};

const findOneOrCreateWithCollectionPath = async <
  S extends T,
  T extends Identifiable
>(
  db: Firestore,
  collectionPath: string,
  clauses: Clauses<S>,
  data: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
  _default?: T,
  findOptions?: Options<S>,
  options?: {
    strict: boolean;
  }
) => {
  const debug = dbDebug.extend(collectionPath);
  debug(
    "Finding one and creating with constraints... %O and data ... %O",
    clauses,
    data
  );
  const results = await findWithCollectionPath<S>(
    db,
    collectionPath,
    clauses,
    findOptions
  );
  let one: S;

  if (results.length > 0) {
    debug("Found results, updating doc");
    one = results[0];
  } else {
    debug("No results found, creating new doc");
    Object.entries(clauses).forEach(([key, value]) => {
      set(data, key, value);
    });
    one = await createWithCollectionPath<S, T>(
      db,
      collectionPath,
      data,
      _default
    );
  }

  return one;
};
