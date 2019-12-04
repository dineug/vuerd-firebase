const { functions, db } = require("../plugins/firebase");
const {
  getUsersDocRef,
  getConfigDocRef,
  getInvitationDocRef
} = require("../plugins/util");

exports.createUser = functions.auth.user().onCreate((user, context) => {
  const batch = db.batch();
  batch.set(getUsersDocRef(user.uid), {
    email: user.email,
    name: user.displayName,
    nickname: user.displayName,
    notification: 0,
    image: user.photoURL ? user.photoURL : null,
    language: "en",
    published: false
  });
  batch.set(getConfigDocRef(user.uid, "editor"), {
    themeName: "VSCode"
  });
  batch.commit();
});

exports.deleteUser = functions.auth.user().onDelete((user, context) => {
  getUsersDocRef(user.uid).delete();
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
