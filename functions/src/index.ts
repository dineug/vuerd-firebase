import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

type Role = "owner" | "writer" | "reader";
interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  image?: string;
  hashTags: string[];
  updatedAt: number;
  createdAt: number;
}

interface HashTag {
  count: number;
}

export const createNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onCreate((snapshot, context) => {
    const newNoteBook = snapshot.data() as Notebook;
    const batch = db.batch();
    newNoteBook.hashTags.forEach(hashTag => {
      db.collection("hashTags")
        .doc(hashTag)
        .get()
        .then(doc => {
          const hashTag = doc.data() as HashTag;
          if (hashTag) {
            batch.update(doc.ref, {
              count: hashTag.count + 1
            });
          } else {
            batch.set(doc.ref, {
              count: 1
            } as HashTag);
          }
        });
    });
    batch.commit();
  });

export const updateNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onUpdate((change, context) => {
    const afterNoteBook = change.after.data() as Notebook;
    const beforeNoteBook = change.before.data() as Notebook;
    const batch = db.batch();
    const minus: string[] = [];
    const plus: string[] = [];
    afterNoteBook.hashTags.forEach(after => {
      if (!beforeNoteBook.hashTags.some(before => after === before)) {
        minus.push(after);
      }
    });
    beforeNoteBook.hashTags.forEach(before => {
      if (!afterNoteBook.hashTags.some(after => after === before)) {
        plus.push(before);
      }
    });
    minus.forEach(hashTag => {
      db.collection("hashTags")
        .doc(hashTag)
        .get()
        .then(doc => {
          const hashTag = doc.data() as HashTag;
          if (hashTag) {
            if (hashTag.count <= 1) {
              batch.delete(doc.ref);
            } else {
              batch.update(doc.ref, {
                count: hashTag.count - 1
              });
            }
          }
        });
    });
    plus.forEach(hashTag => {
      db.collection("hashTags")
        .doc(hashTag)
        .get()
        .then(doc => {
          const hashTag = doc.data() as HashTag;
          if (hashTag) {
            batch.update(doc.ref, {
              count: hashTag.count + 1
            });
          } else {
            batch.set(doc.ref, {
              count: 1
            } as HashTag);
          }
        });
    });
    batch.commit();
  });

export const deleteNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onDelete((snapshot, context) => {
    const noteBook = snapshot.data() as Notebook;
    const batch = db.batch();
    noteBook.hashTags.forEach(hashTag => {
      db.collection("hashTags")
        .doc(hashTag)
        .get()
        .then(doc => {
          const hashTag = doc.data() as HashTag;
          if (hashTag) {
            if (hashTag.count <= 1) {
              batch.delete(doc.ref);
            } else {
              batch.update(doc.ref, {
                count: hashTag.count - 1
              });
            }
          }
        });
    });
    batch.commit();
  });
