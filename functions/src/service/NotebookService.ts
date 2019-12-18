import { functions, db } from "../plugins/firebase";
import {
  getTagsDocRef,
  getTreesColRef,
  getMembersColRef,
  getCommentsColRef
} from "../plugins/util";
import { Notebook } from "./NotebookModel";

export const createNotebook = functions.firestore
  .document("notebooks/{notebookId}")
  .onCreate(async (snapshot, context) => {
    const newNoteBook = snapshot.data() as Notebook;
    const batch = db.batch();
    for (const tag of newNoteBook.tags) {
      const doc = await getTagsDocRef(tag).get();
      const data = doc.data();
      if (data) {
        batch.update(doc.ref, {
          count: data.count + 1
        });
      } else {
        batch.set(doc.ref, {
          name: tag,
          count: 1
        });
      }
    }
    await batch.commit();
  });

export const updateNotebook = functions.firestore
  .document("notebooks/{notebookId}")
  .onUpdate(async (change, context) => {
    const afterNoteBook = change.after.data() as Notebook;
    const beforeNoteBook = change.before.data() as Notebook;
    const minus: string[] = [];
    const plus: string[] = [];
    afterNoteBook.tags.forEach(after => {
      if (!beforeNoteBook.tags.some(before => after === before)) {
        plus.push(after);
      }
    });
    beforeNoteBook.tags.forEach(before => {
      if (!afterNoteBook.tags.some(after => after === before)) {
        minus.push(before);
      }
    });
    if (minus.length !== 0 || plus.length !== 0) {
      const batch = db.batch();
      for (const tag of minus) {
        const doc = await getTagsDocRef(tag).get();
        const data = doc.data();
        if (data) {
          if (data.count <= 1) {
            batch.delete(doc.ref);
          } else {
            batch.update(doc.ref, {
              count: data.count - 1
            });
          }
        }
      }
      for (const tag of plus) {
        const doc = await getTagsDocRef(tag).get();
        const data = doc.data();
        if (data) {
          batch.update(doc.ref, {
            count: data.count + 1
          });
        } else {
          batch.set(doc.ref, {
            name: tag,
            count: 1
          });
        }
      }
      await batch.commit();
    }
  });

export const deleteNotebook = functions.firestore
  .document("notebooks/{notebookId}")
  .onDelete(async (snapshot, context) => {
    const noteBook = snapshot.data() as Notebook;
    const batch = db.batch();
    for (const tag of noteBook.tags) {
      const doc = await getTagsDocRef(tag).get();
      const data = doc.data();
      if (data) {
        if (data.count <= 1) {
          batch.delete(doc.ref);
        } else {
          batch.update(doc.ref, {
            count: data.count - 1
          });
        }
      }
    }
    const querySnapshotMembers = await getMembersColRef(
      context.params.notebookId
    ).get();
    querySnapshotMembers.forEach(doc => {
      if (doc.exists) {
        batch.delete(doc.ref);
      }
    });
    const querySnapshotTrees = await getTreesColRef(
      context.params.notebookId
    ).get();
    querySnapshotTrees.forEach(doc => {
      if (doc.exists) {
        batch.delete(doc.ref);
      }
    });
    const querySnapshotComments = await getCommentsColRef(
      context.params.notebookId
    ).get();
    querySnapshotComments.forEach(doc => {
      if (doc.exists) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
  });
