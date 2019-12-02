const { functions, db } = require("../plugins/firebase");

exports.createNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onCreate((snapshot, context) => {
    const newMember = snapshot.data();
    if (newMember.status === "invitation") {
      // 초대 알림
    }
  });
