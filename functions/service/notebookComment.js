const { functions, db } = require("../plugins/firebase");
const {
  getMembersColRef,
  getUsersDocRef,
  getNotificationColRef
} = require("../plugins/util");
const moment = require("moment");

exports.createNotebookComment = functions.firestore
  .document("notebooks/{notebookId}/comments/{commentId}")
  .onCreate(async (snapshot, context) => {
    const newComment = snapshot.data();
    const memberQuery = await getMembersColRef(context.params.notebookId).get();
    const members = [];
    memberQuery.forEach(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data.status === "accept" && newComment.uid !== data.uid) {
          members.push(doc.data());
        }
      }
    });

    if (members.length !== 0) {
      const batch = db.batch();
      const fromDoc = await getUsersDocRef(newComment.uid).get();
      const fromData = fromDoc.data();
      for (const member of members) {
        batch.set(getNotificationColRef(member.uid).doc(), {
          message: `${fromData.email} left a comment`,
          action: "comment",
          read: false,
          key: context.params.notebookId,
          createdAt: moment().unix()
        });
        const toDoc = await getUsersDocRef(member.uid).get();
        const toData = toDoc.data();
        batch.update(toDoc.ref, {
          notification: toData.notification + 1
        });
      }
      batch.commit();
    }
  });
