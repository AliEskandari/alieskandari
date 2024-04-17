import debug from "@/modules/db/debug";
import { Identifiable } from "@/types/Utility/Identifiable";
import { OverriddenProperties, UniqueTo } from "@/types/utilities";
import { Firestore, collection, doc } from "firebase/firestore";
export type NewFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T,
  options?: { debug: boolean }
) => NewFunction<T> | NewFunctionWithArg<T>;

export type NewFunction<T> = {
  (data?: Partial<T>): T;
  <S extends T>(
    data: Partial<S> & UniqueTo<S, T> & OverriddenProperties<S, T>
  ): S;
};
export type NewFunctionWithArg<T> = {
  (parentId: string, data?: Partial<T>): T;
  <S extends T>(
    parentId: string,
    data: Partial<S> & UniqueTo<S, T> & OverriddenProperties<S, T>
  ): S;
};

export const _new: NewFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T
) => {
  if (typeof collectionPath === "function") {
    const newFn: NewFunctionWithArg<T> = <S extends T = T>(
      parentId: string,
      data:
        | Partial<T>
        | undefined
        | (Partial<S> & UniqueTo<S, T> & OverriddenProperties<S, T>)
    ) => {
      const _collectionPath = collectionPath(parentId);
      return newWithCollectionPath<S, T>(db, _collectionPath, data, _default);
    };

    return newFn;
  } else {
    const newFn: NewFunction<T> = <S extends T = T>(
      data:
        | Partial<T>
        | undefined
        | (Partial<S> & UniqueTo<S, T> & OverriddenProperties<S, T>)
    ): S | T => {
      return newWithCollectionPath<S, T>(db, collectionPath, data, _default);
    };

    return newFn;
  }
};

/**
 *
 * @param db The Firestore instance
 * @param collectionPath The path to the collection
 * @param data The data to use for the new document (optional)
 * @param _default The default values to use for the new document (optional)
 * @param options Options for the function (optional)
 * @returns
 */
export const newWithCollectionPath = <S extends T, T extends Identifiable>(
  db: Firestore,
  collectionPath: string,
  data:
    | Partial<T>
    | undefined
    | (Partial<S> & UniqueTo<S, T> & OverriddenProperties<S, T>),
  _default?: T,
  options?: { debug: boolean }
) => {
  if (options?.debug) debug("New doc in %s...", collectionPath);
  const docRef = doc(collection(db, collectionPath));
  const newDoc = { ...structuredClone(_default ?? ({ id: "" } as T)), ...data };
  newDoc.createdAt = new Date().toISOString();
  newDoc.updatedAt = new Date().toISOString();
  newDoc.id = docRef.id;
  return newDoc;
};
