const { functions, db } = require("../plugins/firebase");
const { getNotificationColRef, getUsersDocRef } = require("../plugins/util");
const moment = require("moment");

exports.createNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onCreate(async (snapshot, context) => {
    const newMember = snapshot.data();
    if (newMember.status === "invitation") {
      const batch = db.batch();
      const fromDoc = await getUsersDocRef(newMember.fromId).get();
      const fromData = fromDoc.data();
      batch.set(getNotificationColRef(context.params.memberId).doc(), {
        message: `${fromData.email} has invited you`,
        action: "invitation",
        read: false,
        key: context.params.notebookId,
        createdAt: moment().unix()
      });
      const toDoc = await getUsersDocRef(context.params.memberId).get();
      const toData = toDoc.data();
      batch.update(toDoc.ref, {
        notification: toData.notification + 1
      });
      batch.commit();
    }
  });
