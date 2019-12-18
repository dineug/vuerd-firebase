import { functions } from "../plugins/firebase";
import { getNotebooksDocRef } from "../plugins/util";
import { Notebook } from "./NotebookModel";

export const createNotebookHeart = functions.firestore
  .document("notebooks/{notebookId}/hearts/{userId}")
  .onCreate(async (snapshot, context) => {
    const doc = await getNotebooksDocRef(context.params.notebookId).get();
    if (doc.exists) {
      const notebook = doc.data() as Notebook;
      await doc.ref.update({
        heartCount: notebook.heartCount + 1
      });
    }
  });

export const deleteNotebookHeart = functions.firestore
  .document("notebooks/{notebookId}/hearts/{userId}")
  .onDelete(async (snapshot, context) => {
    const doc = await getNotebooksDocRef(context.params.notebookId).get();
    if (doc.exists) {
      const notebook = doc.data() as Notebook;
      await doc.ref.update({
        heartCount: notebook.heartCount - 1
      });
    }
  });
