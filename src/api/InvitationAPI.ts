import { db, QuerySnapshot, CollectionReference } from "@/plugins/firebase";
import store from "@/store";
import { getNotificationDocRef } from "@/api/NotificationAPI";
import { NotificationModel } from "@/api/NotificationModel";
import { getMembersDocRef } from "@/api/NotebookAPI";

export function getInvitationColRef(): CollectionReference {
  return db.collection("invitation");
}

export function autocomplete(keyword: string): Promise<QuerySnapshot> {
  return getInvitationColRef()
    .where("email", ">=", keyword)
    .limit(6)
    .get();
}

export function invitationAccept(
  notification: NotificationModel
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  } else if (!notification.key) {
    throw new Error("not found key");
  }
  const batch = db.batch();
  batch.update(getNotificationDocRef(store.state.user.uid, notification.id), {
    read: true
  });
  batch.update(getMembersDocRef(notification.key, store.state.user.uid), {
    status: "accept"
  });
  return batch.commit();
}

export function invitationCancel(
  notification: NotificationModel
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  } else if (!notification.key) {
    throw new Error("not found key");
  }
  const batch = db.batch();
  batch.update(getNotificationDocRef(store.state.user.uid, notification.id), {
    read: true
  });
  batch.delete(getMembersDocRef(notification.key, store.state.user.uid));
  return batch.commit();
}
