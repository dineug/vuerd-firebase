const { functions, db } = require("../plugins/firebase");
const {
  getUsersDocRef,
  getConfigDocRef,
  getInvitationDocRef
} = require("../plugins/util");

exports.deleteUser = functions.auth.user().onDelete((user, context) => {
  const batch = db.batch();
  batch.delete(getConfigDocRef(user.uid, "editor"));
  batch.delete(getUsersDocRef(user.uid));
  batch.commit();
});

exports.updateUser = functions.firestore
  .document("users/{userId}")
  .onUpdate((change, context) => {
    const afterData = change.after.data();
    const beforeData = change.before.data();
    if (afterData.published !== beforeData.published) {
      if (afterData.published) {
        getInvitationDocRef(context.params.userId).set({
          email: afterData.email,
          name: afterData.name,
          nickname: afterData.nickname,
          image: afterData.image
        });
      } else {
        getInvitationDocRef(context.params.userId).delete();
      }
    }
  });
