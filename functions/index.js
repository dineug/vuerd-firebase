const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

function getHashTagsDocRef(hashTag) {
  return db.doc(`hashTags/${hashTag}`);
}

exports.createNotebookHashTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onCreate(async (snapshot, context) => {
    const newNoteBook = snapshot.data();
    const batch = db.batch();
    for (const hashTag of newNoteBook.hashTags) {
      const doc = await getHashTagsDocRef(hashTag).get();
      const data = doc.data();
      if (data) {
        batch.update(doc.ref, {
          count: data.count + 1
        });
      } else {
        batch.set(doc.ref, {
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
    for (const hashTag of minus) {
      const doc = await getHashTagsDocRef(hashTag).get();
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
    for (const hashTag of plus) {
      const doc = await getHashTagsDocRef(hashTag).get();
      const data = doc.data();
      if (data) {
        batch.update(doc.ref, {
          count: data.count + 1
        });
      } else {
        batch.set(doc.ref, {
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
    for (const hashTag of noteBook.hashTags) {
      const doc = await getHashTagsDocRef(hashTag).get();
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
