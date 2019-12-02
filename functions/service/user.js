const { functions, db } = require("../plugins/firebase");
const { getUsersDocRef, getConfigDocRef } = require("../plugins/util");

exports.createUser = functions.auth.user().onCreate((user, context) => {
  const batch = db.batch();
  batch.set(getUsersDocRef(user.uid), {
    email: user.email,
    name: user.displayName,
    nickname: user.displayName
  });
  batch.set(getConfigDocRef(user.uid, "editor"), {
    themeName: "VSCode"
  });
  batch.commit();
});

exports.deleteUser = functions.auth.user().onDelete((user, context) => {
  getUsersDocRef(user.uid).delete();
});
