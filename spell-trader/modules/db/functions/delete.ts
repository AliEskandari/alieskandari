import { Firestore, doc, deleteDoc } from "firebase/firestore";
import dbDebug from "@/modules/db/debug";

export type DeleteFunctionGenerator = <T extends { id: string }>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => DeleteFunctionWithArg<T> | DeleteFunction<T>;

export type DeleteFunction<T> = (id: string) => Promise<void>;
export type DeleteFunctionWithArg<T> = (
  parentId: string,
  id: string
) => Promise<void>;

export const _delete: DeleteFunctionGenerator = <T extends { id: string }>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath == "function") {
    const deleteFn: DeleteFunctionWithArg<T> = async (
      parentId: string,
      id: string
    ) => {
      const _collectionPath = collectionPath(parentId);
      return deleteWithCollectionPath<T>(db, _collectionPath, id);
    };

    return deleteFn;
  } else {
    const deleteFn: DeleteFunction<T> = async (id: string) => {
      return deleteWithCollectionPath<T>(db, collectionPath, id);
    };

    return deleteFn;
  }
};

const deleteWithCollectionPath = <T extends { id: string }>(
  db: Firestore,
  collectionPath: string,
  id: string
) => {
  const debug = dbDebug.extend(collectionPath);
  debug("Deleting doc with id %s", id);
  const docRef = doc(db, collectionPath, id);
  return deleteDoc(docRef);
};
