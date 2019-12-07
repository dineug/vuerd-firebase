const { functions, db } = require("../plugins/firebase");
const {
  getUsersDocRef,
  getConfigDocRef,
  getInvitationDocRef
} = require("../plugins/util");

exports.deleteUser = functions.auth.user().onDelete((user, context) => {
  const batch = db.batch();
  batch.delete(getConfigDocRef(user.uid, "editor"));
  batch.delete(getInvitationDocRef(user.uid));
  batch.delete(getUsersDocRef(user.uid));
  batch.commit();
});

exports.updateUser = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const batch = db.batch();
    const afterData = change.after.data();
    const user = {
      email: afterData.email,
      name: afterData.name,
      nickname: afterData.nickname,
      image: afterData.image
    };
    if (afterData.published) {
      batch.set(getInvitationDocRef(context.params.userId), user);
    } else {
      batch.delete(getInvitationDocRef(context.params.userId));
    }
    const querySnapshot = await db
      .collectionGroup("members")
      .where("email", "==", afterData.email)
      .get();
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, user);
    });
    batch.commit();
  });
