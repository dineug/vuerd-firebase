import { NotificationModel, NotificationPaging } from "./NotificationModel";
import { QuerySnapshot } from "@/plugins/firebase";
import store from "@/store";
import { getUsersDocRef } from "@/api/UserAPI";

export function getNotificationColRef(uid: string) {
  return getUsersDocRef(uid).collection("notification");
}

export function getNotificationDocRef(uid: string, id: string) {
  return getNotificationColRef(uid).doc(id);
}

export function notificationPaging(
  paging: NotificationPaging
): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  if (!paging.limit) {
    paging.limit = 20;
  }
  if (!paging.orderBy) {
    paging.orderBy = "createdAt";
  }
  if (!paging.sort) {
    paging.sort = "desc";
  }
  let ref = getNotificationColRef(store.state.user.uid)
    .orderBy(paging.orderBy, paging.sort)
    .limit(paging.limit);
  if (paging.read !== undefined) {
    ref = ref.where("read", "==", paging.read);
  }
  if (paging.last) {
    ref = ref.startAfter(paging.last);
  }
  return ref.get();
}

export async function notificationReadModify(
  notification: NotificationModel
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  await getNotificationDocRef(store.state.user.uid, notification.id).update({
    read: true
  });
  const querySnapshot = await getNotificationColRef(store.state.user.uid)
    .where("read", "==", false)
    .get();
  return getUsersDocRef(store.state.user.uid).update({
    notification: querySnapshot.size
  });
}
