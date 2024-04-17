import { Firestore, doc, deleteDoc, writeBatch } from "firebase/firestore";
import debug from "@/modules/db/debug";
import { Clauses, Options, findWithCollectionPath } from "./find";
import { Identifiable } from "@/types/Utility/Identifiable";

export type DeleteManyFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => DeleteManyFunctionWithArg<T> | DeleteManyFunction<T>;

export type DeleteManyFunction<T> = (
  clauses?: Clauses<T>,
  options?: Options<T>
) => Promise<void>;

export type DeleteManyFunctionWithArg<T> = (
  parentId: string,
  clauses?: Clauses<T>,
  options?: Options<T>
) => Promise<void>;

export const deleteMany: DeleteManyFunctionGenerator = <T extends Identifiable>(
  db: Firestore,
  collectionPath: string | ((id: string) => string)
) => {
  if (typeof collectionPath == "function") {
    const deleteManyFn: DeleteManyFunctionWithArg<T> = async (
      parentId: string,
      clauses?: Clauses<T>,
      options?: Options<T>
    ) => {
      const _collectionPath = collectionPath(parentId);
      return deleteManyWithCollectionPath<T>(
        db,
        _collectionPath,
        clauses,
        options
      );
    };

    return deleteManyFn;
  } else {
    const deleteManyFn: DeleteManyFunction<T> = async (
      clauses?: Clauses<T>,
      options?: Options<T>
    ) => {
      return deleteManyWithCollectionPath<T>(
        db,
        collectionPath,
        clauses,
        options
      );
    };

    return deleteManyFn;
  }
};

/**
 * Delete many documents from a collection. Finds the documents first, then
 * deletes them in a batch.
 */
const deleteManyWithCollectionPath = async <T extends Identifiable>(
  db: Firestore,
  collectionPath: string,
  clauses?: Clauses<T>,
  options?: Options<T>
) => {
  debug("Deleting many from %s...", collectionPath);

  const docs = await findWithCollectionPath<T>(
    db,
    collectionPath,
    clauses,
    options
  );

  const batch = writeBatch(db);

  docs.forEach((data) => {
    const docRef = doc(db, collectionPath, data.id);
    batch.delete(docRef);
  });

  return batch.commit();
};
