const { functions, db } = require("../plugins/firebase");
const {
  getNotificationColRef,
  getUsersDocRef,
  getNotebooksDocRef
} = require("../plugins/util");
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

exports.updateNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onUpdate(async (change, context) => {
    const afterMember = change.after.data();
    const beforeMember = change.before.data();
    if (
      beforeMember.status === "invitation" &&
      afterMember.status === "accept"
    ) {
      const notebookDoc = await getNotebooksDocRef(
        context.params.notebookId
      ).get();
      const notebook = notebookDoc.data();
      if (notebook.members.indexOf(context.params.memberId) === -1) {
        const members = notebook.members;
        const roles = notebook.roles;
        members.push(context.params.memberId);
        roles[context.params.memberId] = beforeMember.role;
        notebookDoc.ref.update({
          members,
          roles
        });
      }
    }
  });

exports.deleteNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onDelete(async (snapshot, context) => {
    const notebookDoc = await getNotebooksDocRef(
      context.params.notebookId
    ).get();
    const notebook = notebookDoc.data();
    const members = notebook.members;
    const roles = notebook.roles;
    delete roles[context.params.memberId];
    notebookDoc.ref.update({
      members: members.filter(member => member !== context.params.memberId),
      roles
    });
  });
