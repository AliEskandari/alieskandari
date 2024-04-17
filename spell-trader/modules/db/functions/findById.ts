import {
  Firestore,
  Unsubscribe,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import dbDebug from "../debug";

type FindByIdFunctionOptions<T> = {
  onUpdate: (data: T, unsubscribe: Unsubscribe) => void;
};

export type FindByIdFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => FindByIdFunction<T> | FindByIdFunctionWithArg<T>;

export type FindByIdFunction<T> = {
  <S extends T = T>(id?: string): Promise<S | null>;
  <S extends T = T>(id?: string, options?: FindByIdFunctionOptions<S>): Promise<
    [S | null, Unsubscribe | null]
  >;
};

export type FindByIdFunctionWithArg<T> = {
  <S extends T = T>(parentId: string, id?: string): Promise<S | null>;
  <S extends T = T>(
    parentId: string,
    id?: string,
    options?: FindByIdFunctionOptions<S>
  ): Promise<[S | null, Unsubscribe | null]>;
};

export const findById: FindByIdFunctionGenerator = <T>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath === "function") {
    const findByIdFn: FindByIdFunctionWithArg<T> = <S extends T = T>(
      parentId: string,
      id?: string,
      options?: FindByIdFunctionOptions<S>
    ): any => {
      const _collectionPath = collectionPath(parentId);
      return findByIdWithCollectionPath<S>(db, _collectionPath, id, options);
    };

    return findByIdFn;
  } else {
    const findByIdFn: FindByIdFunction<T> = <S extends T = T>(
      id?: string,
      options?: FindByIdFunctionOptions<S>
    ): any => {
      return findByIdWithCollectionPath<S>(db, collectionPath, id, options);
    };

    return findByIdFn;
  }
};

export type FindByIdWithCollectionPath = {
  <T>(db: Firestore, collectionPath: string, id?: string): Promise<T | null>;
  <T>(
    db: Firestore,
    collectionPath: string,
    id?: string,
    options?: FindByIdFunctionOptions<T>
  ): Promise<[T | null, Unsubscribe | null]>;
};

const findByIdWithCollectionPath: FindByIdWithCollectionPath = async <T>(
  db: Firestore,
  collectionPath: string,
  id?: string,
  options?: FindByIdFunctionOptions<T>
) => {
  if (!id) throw new Error("id is required");
  const debug = dbDebug.extend(`${collectionPath}:findById`);
  debug("Finding doc with id %s...", id);
  const docRef = doc(db, collectionPath, id);

  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    debug("Found doc with id %s and data %O...", id, docSnap.data());
    const data = docSnap.data();

    if (options?.onUpdate) {
      const unsub = onSnapshot(docRef, (docSnap) => {
        debug("Listening to document %s... was updated", id);
        const data = docSnap.data();
        options.onUpdate!(data as T, unsub);
      });
      return [data, unsub];
    }

    return data as T;
  } else {
    debug("Doc with id %s not found", id);
    if (!options) return null;
    else return [null, null];
  }
};
