const { functions, db } = require("../plugins/firebase");
const {
  getUsersDocRef,
  getConfigDocRef,
  getInvitationDocRef,
  getNotificationColRef
} = require("../plugins/util");

exports.deleteUser = functions.auth.user().onDelete(async (user, context) => {
  const batch = db.batch();
  batch.delete(getConfigDocRef(user.uid, "editor"));
  batch.delete(getInvitationDocRef(user.uid));
  batch.delete(getUsersDocRef(user.uid));
  const notificationQuery = await getNotificationColRef(user.uid).get();
  notificationQuery.forEach(doc => {
    if (doc.exists) {
      batch.delete(doc.ref);
    }
  });
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
      batch.set(getInvitationDocRef(context.params.userId), {
        uid: context.params.userId,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        image: user.image
      });
    } else {
      batch.delete(getInvitationDocRef(context.params.userId));
    }
    const querySnapshotMembers = await db
      .collectionGroup("members")
      .where("uid", "==", context.params.userId)
      .get();
    querySnapshotMembers.docs.forEach(doc => {
      batch.update(doc.ref, user);
    });
    const querySnapshotComment = await db
      .collectionGroup("comments")
      .where("uid", "==", context.params.userId)
      .get();
    querySnapshotComment.docs.forEach(doc => {
      batch.update(doc.ref, user);
    });
    batch.commit();
  });
