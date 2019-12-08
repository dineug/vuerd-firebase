const { functions, db } = require("../plugins/firebase");
const { getTagsDocRef } = require("../plugins/util");

exports.createNotebookTag = functions.firestore
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

exports.updateNotebookTag = functions.firestore
  .document("notebooks/{notebookId}")
  .onUpdate(async (change, context) => {
    const afterNoteBook = change.after.data();
    const beforeNoteBook = change.before.data();
    const minus = [];
    const plus = [];
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
      batch.commit();
    }
  });

exports.deleteNotebookTag = functions.firestore
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
