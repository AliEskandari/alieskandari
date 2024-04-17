import { Firestore } from "firebase/firestore";
import { Clauses, Options, findWithCollectionPath } from "./find";

export type FindOneFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => FindOneFunction<T> | FindOneFunctionWithArg<T>;

export type FindOneFunction<T> = <S extends T = T>(
  clauses?: Clauses<S>,
  options?: Options<S>
) => Promise<S | null>;

export type FindOneFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  clauses?: Clauses<S>,
  options?: Options<S>
) => Promise<S | null>;

export const findOne: FindOneFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath === "function") {
    const findOneFn: FindOneFunctionWithArg<T> = async <S extends T = T>(
      parentId: string,
      clauses?: Clauses<S>,
      options?: Options<S>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return findOneWithCollectionPath<S>(
        db,
        _collectionPath,
        clauses,
        options
      );
    };

    return findOneFn;
  } else {
    const findOneFn: FindOneFunction<T> = async <S extends T = T>(
      clauses?: Clauses<S>,
      options?: Options<S>
    ) => {
      return findOneWithCollectionPath<S>(db, collectionPath, clauses, options);
    };

    return findOneFn;
  }
};

const findOneWithCollectionPath = async <S>(
  db: Firestore,
  collectionPath: string,
  clauses?: Clauses<S>,
  options?: Options<S>
) => {
  const results = await findWithCollectionPath<S>(
    db,
    collectionPath,
    clauses,
    options
  );
  if (results.length > 0) return results[0];
  else return null;
};
