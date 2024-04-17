import {
  DocumentData,
  Firestore,
  SetOptions,
  UpdateData,
  doc,
  updateDoc,
} from "firebase/firestore";
import dbDebug from "../debug";

export type UpdateFunctionGenerator = <T extends DocumentData>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => UpdateFunction<T> | UpdateFunctionWithArg<T>;

export type UpdateFunction<T> = <S extends T = T>(
  id: string,
  data: UpdateData<S>
) => Promise<DocumentData>;

export type UpdateFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  id: string,
  data: UpdateData<S>
) => Promise<DocumentData>;

export const update: UpdateFunctionGenerator = <T extends DocumentData>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath === "function") {
    const updateFn: UpdateFunctionWithArg<T> = async (
      parentId: string,
      id: string,
      data: UpdateData<T>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return updateWithCollectionPath<T>(db, _collectionPath, id, data);
    };

    return updateFn;
  } else {
    const updateFn: UpdateFunction<T> = async (
      id: string,
      data: UpdateData<T>,
      options?: SetOptions
    ) => {
      return updateWithCollectionPath<T>(db, collectionPath, id, data);
    };

    return updateFn;
  }
};

/**
 * Update a document in a collection.  This function will throw
 * an error if the document does not exist.
 * @param id The id of the document to update
 * @param data The data to update the document with
 * An object containing the fields and values with which to update the
 * document. Fields can contain dots to reference nested fields within
 * the document.
 * @returns A Promise resolved with the updated doc once the data has been
 * successfully written to the backend (note that it won't resolve
 * while you're offline).
 * @throws If the document does not exist
 */
export const updateWithCollectionPath = async <T extends DocumentData>(
  db: Firestore,
  collectionPath: string,
  id: string,
  data: UpdateData<T>
) => {
  const debug = dbDebug.extend(collectionPath);
  debug("Updating %s with data %O...", id, data);

  const docRef = doc(db, collectionPath, id);
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  await updateDoc(docRef, updatedData);
  return updatedData;
};
