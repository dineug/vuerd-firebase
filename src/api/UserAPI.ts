import {
  db,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot
} from "@/plugins/firebase";
import store from "@/store";

export function getUsersColRef(): CollectionReference {
  return db.collection("users");
}

export function getUsersDocRef(uid: string): DocumentReference {
  return getUsersColRef().doc(uid);
}

export function getConfigDocRef(uid: string, id: string): DocumentReference {
  return getUsersDocRef(uid)
    .collection("config")
    .doc(id);
}

export function getNotificationColRef(uid: string) {
  return getUsersDocRef(uid).collection("notification");
}

export type Action = "invitation" | "notification";
export type Language = "ko" | "en";

export interface User {
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  notification: number;
  language: Language;
  published: boolean;
}

export interface UserModify {
  name: string;
  nickname: string;
  image: string | null;
  language: Language;
  published: boolean;
}

export interface Editor {
  themeName: string;
}

export interface Notification {
  message: string;
  action: Action;
  read: boolean;
  key: string | null;
  createdAt: number;
}

export function editorSave(editor: Editor): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getConfigDocRef(store.state.user.uid, "editor").set(editor);
}

export function findEditorBy(): Promise<DocumentSnapshot> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getConfigDocRef(store.state.user.uid, "editor").get();
}

export function findUserBy(): Promise<DocumentSnapshot> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getUsersDocRef(store.state.user.uid).get();
}

export function userSave(user: User): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getUsersDocRef(store.state.user.uid).set(user);
}

export function userUpdate(userModify: UserModify): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getUsersDocRef(store.state.user.uid).update(userModify);
}
