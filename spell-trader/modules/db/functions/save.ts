import { Identifiable } from "@/types/Utility/Identifiable";
import { DocumentData, Firestore, doc, setDoc } from "firebase/firestore";
import dbDebug from "../debug";

export type SaveFunctionGenerator = <T extends DocumentData & Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => SaveFunction<T> | SaveFunctionWithArg<T>;

export type SaveFunction<T> = <S extends T = T>(
  data: S
) => Promise<DocumentData>;

export type SaveFunctionWithArg<T> = <S extends T = T>(
  parentId: string,
  data: S
) => Promise<DocumentData>;

export const save: SaveFunctionGenerator = <
  T extends DocumentData & Identifiable
>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath === "function") {
    const saveFn: SaveFunctionWithArg<T> = async <S extends T = T>(
      parentId: string,
      data: S
    ) => {
      const _collectionPath = collectionPath(parentId);
      return saveWithCollectionPath<T>(db, _collectionPath, data);
    };

    return saveFn;
  } else {
    const saveFn: SaveFunction<T> = async <S extends T = T>(data: S) => {
      return saveWithCollectionPath<T>(db, collectionPath, data);
    };

    return saveFn;
  }
};

export const saveWithCollectionPath = async <
  T extends DocumentData & Identifiable
>(
  db: Firestore,
  collectionPath: string,
  data: T
) => {
  const debug = dbDebug.extend(`${collectionPath}/${data.id}`);
  debug("Saving with data %O...", data);

  const docRef = doc(db, collectionPath, data.id);
  const savedData = { ...data, updatedAt: new Date().toISOString() };
  await setDoc(docRef, savedData);
  return savedData;
};
