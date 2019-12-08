const { functions } = require("../plugins/firebase");
const { getNotificationColRef, getUsersDocRef } = require("../plugins/util");

exports.updateUserNotification = functions.firestore
  .document("users/{userId}/notification/{notificationId}")
  .onUpdate(async (change, context) => {
    const afterNotification = change.after.data();
    if (afterNotification.read) {
      const querySnapshot = await getNotificationColRef(context.params.userId)
        .where("read", "==", false)
        .get();
      getUsersDocRef(context.params.userId).update({
        notification: querySnapshot.size
      });
    }
  });
