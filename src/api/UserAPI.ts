import {
  db,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot
} from "@/plugins/firebase";
import store from "@/store";

export interface User {
  name: string | null;
  nickname: string | null;
  email: string | null;
}

export function getUsersColRef(): CollectionReference {
  return db.collection("users");
}

export function getUsersDocRef(uid: string): DocumentReference {
  return getUsersColRef().doc(uid);
}

export function getConfigColRef(uid: string): CollectionReference {
  return getUsersDocRef(uid).collection("config");
}

export function getConfigDocRef(uid: string, id: string): DocumentReference {
  return getConfigColRef(uid).doc(id);
}

export interface Editor {
  themeName: string;
}

export function saveEditor(editor: Editor): Promise<void> {
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

export function saveUser(user: User): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return getUsersDocRef(store.state.user.uid).set(user);
}
