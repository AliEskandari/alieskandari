import debug from "@/modules/db/debug";
import DeepPartial from "@/types/DeepPartial";
import { Identifiable } from "@/types/Utility/Identifiable";
import { OverriddenProperties, UniqueTo } from "@/types/utilities";
import { Firestore, collection, doc, setDoc } from "firebase/firestore";
import { merge } from "lodash";
import { newWithCollectionPath } from "./new";
export type CreateFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T,
  options?: { debug: boolean }
) => CreateFunctionWithArg<T> | CreateFunction<T>;

export type CreateFunction<T> = <S extends T = T>(
  values: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>
) => Promise<S>;

export type CreateFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  values: Omit<T, keyof Identifiable> &
    Partial<Identifiable> &
    UniqueTo<S, T> &
    OverriddenProperties<S, T>
) => Promise<S>;

export const create: CreateFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string),
  _default?: T,
  options?: { debug: boolean }
) => {
  if (typeof collectionPath === "function") {
    const createFn: CreateFunctionWithArg<T> = async <S extends T = T>(
      parentId: string,
      values: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return createWithCollectionPath<S, T>(
        db,
        _collectionPath,
        values,
        _default,
        options
      );
    };

    return createFn;
  } else {
    const createFn: CreateFunction<T> = async <S extends T = T>(
      values: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>
    ) => {
      return createWithCollectionPath<S, T>(
        db,
        collectionPath,
        values,
        _default,
        options
      );
    };

    return createFn;
  }
};

/**
 * Creates a document in the given collection. If the values contain an id, it will be used. Otherwise, a new id
 * will be generated. If the values contain a createdAt or updatedAt field, it will be overwritten. Otherwise,
 * the current time will be used. Values are merged with the default values.
 *
 * @param db The Firestore instance
 * @param collectionPath The path to the collection
 * @param values The values to create the document with
 * @param _default The default values to use if the values don't contain an id
 * @param options Options
 * @returns The created document
 */
export const createWithCollectionPath = async <
  S extends T,
  T extends Identifiable
>(
  db: Firestore,
  collectionPath: string,
  values: DeepPartial<T> & UniqueTo<S, T> & OverriddenProperties<S, T>,
  _default?: T,
  options?: { debug: boolean }
) => {
  if (options?.debug) debug("Creating document in %s", collectionPath);
  const newDoc = newWithCollectionPath(db, collectionPath, undefined, _default);
  if (values.id?.length == 0) delete values.id;
  delete values.createdAt;
  const _values = merge(newDoc, values) as S;
  _values.createdAt = new Date().toISOString();
  _values.updatedAt = new Date().toISOString();
  const docRef = doc(collection(db, collectionPath), _values.id);
  await setDoc(docRef, _values);
  return _values;
};
