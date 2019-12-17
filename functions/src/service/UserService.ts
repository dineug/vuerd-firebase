import { functions, db } from "../plugins/firebase";
import {
  getUsersDocRef,
  getConfigDocRef,
  getInvitationDocRef,
  getNotificationColRef
} from "../plugins/util";
import { User } from "./UserModel";

export const deleteUser = functions.auth
  .user()
  .onDelete(async (user, context) => {
    const batch = db.batch();
    batch.delete(getConfigDocRef(user.uid, "editor"));
    batch.delete(getInvitationDocRef(user.uid));
    batch.delete(getUsersDocRef(user.uid));
    const querySnapshotNotification = await getNotificationColRef(user.uid).get();
    querySnapshotNotification.forEach(doc => {
      if (doc.exists) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
  });

export const updateUser = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const batch = db.batch();
    const afterData = change.after.data() as User;
    const beforeData = change.before.data() as User;
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
    if (
      afterData.email !== beforeData.email ||
      afterData.name !== beforeData.name ||
      afterData.nickname !== beforeData.nickname ||
      afterData.image !== beforeData.image
    ) {
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
    }
    await batch.commit();
  });
