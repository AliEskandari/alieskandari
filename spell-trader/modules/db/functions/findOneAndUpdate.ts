import { Identifiable } from "@/types/Utility/Identifiable";
import { Firestore, UpdateData } from "firebase/firestore";
import dbDebug from "../debug";
import { Clauses, Options, findWithCollectionPath } from "./find";
import { updateWithCollectionPath } from "./update";

export type FindOneAndUpdateFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  options?: { debug: boolean }
) => FindOneAndUpdateFunction<T> | FindOneAndUpdateFunctionWithArg<T>;

export type FindOneAndUpdateFunction<T> = <S extends T = T>(
  clauses: Clauses<S>,
  data: UpdateData<S>,
  findOptions?: Options<S>
) => Promise<S | null>;

export type FindOneAndUpdateFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  clauses: Clauses<S>,
  data: UpdateData<S>,
  findOptions?: Options<S>
) => Promise<S | null>;

export const findOneAndUpdate: FindOneAndUpdateFunctionGenerator = <
  T extends Identifiable
>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  options?: { debug: boolean }
) => {
  if (typeof collectionPath === "function") {
    const findOneAndUpdateFn: FindOneAndUpdateFunctionWithArg<T> = async <
      S extends T = T
    >(
      parentId: string,
      clauses: Clauses<S>,
      data: UpdateData<S>,
      findOptions?: Options<S>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return findOneAndUpdateWithCollectionPath<S, T>(
        db,
        _collectionPath,
        clauses,
        data,
        findOptions
      );
    };

    return findOneAndUpdateFn;
  } else {
    const findOneAndUpdateFn: FindOneAndUpdateFunction<T> = async <
      S extends T = T
    >(
      clauses: Clauses<S>,
      data: UpdateData<S>,
      findOptions?: Options<S>
    ) => {
      return findOneAndUpdateWithCollectionPath<S, T>(
        db,
        collectionPath,
        clauses,
        data,
        findOptions
      );
    };

    return findOneAndUpdateFn;
  }
};

const findOneAndUpdateWithCollectionPath = async <
  S extends T,
  T extends Identifiable
>(
  db: Firestore,
  collectionPath: string,
  clauses: Clauses<S>,
  data: UpdateData<S>,
  findOptions?: Options<S>
) => {
  const debug = dbDebug.extend(collectionPath);
  debug(
    "Finding one and updating with constraints... %O and data ... %O",
    clauses,
    data
  );
  const results = await findWithCollectionPath<S>(
    db,
    collectionPath,
    clauses,
    findOptions
  );
  let one: S | null = null;

  if (results.length > 0) {
    debug("Found results, updating doc");
    one = results[0];
    await updateWithCollectionPath(db, collectionPath, one.id, data);
  } else {
    debug("No results found");
  }

  return one;
};
