const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

function getTagsDocRef(tag) {
  return db.doc(`tags/${tag}`);
}

exports.createNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onCreate(async (snapshot, context) => {
    const newNoteBook = snapshot.data();
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
    batch.commit();
  });

exports.updateNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onUpdate(async (change, context) => {
    const afterNoteBook = change.after.data();
    const beforeNoteBook = change.before.data();
    const batch = db.batch();
    const minus = [];
    const plus = [];
    afterNoteBook.tags.forEach(after => {
      if (!beforeNoteBook.tags.some(before => after === before)) {
        minus.push(after);
      }
    });
    beforeNoteBook.tags.forEach(before => {
      if (!afterNoteBook.tags.some(after => after === before)) {
        plus.push(before);
      }
    });
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
    batch.commit();
  });

exports.deleteNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onDelete(async (snapshot, context) => {
    const noteBook = snapshot.data();
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
    batch.commit();
  });
