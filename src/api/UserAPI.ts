import {
  db,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot
} from "@/plugins/firebase";
import store from "@/store";
import { identicon } from "@/ts/util";
import { User, UserModify, Editor } from "./UserModel";

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

export function editorSave(editor: Editor): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getConfigDocRef(store.state.user.uid, "editor").set(editor);
}

export function findEditorBy(): Promise<DocumentSnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getConfigDocRef(store.state.user.uid, "editor").get();
}

export function findUserBy(): Promise<DocumentSnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getUsersDocRef(store.state.user.uid).get();
}

export function userSave(user: User): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getUsersDocRef(store.state.user.uid).set(user);
}

export async function signIn(): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  const doc = await findUserBy();
  if (doc.data() === undefined) {
    const batch = db.batch();
    batch.set(getUsersDocRef(store.state.user.uid), {
      email: store.state.user.email,
      name: store.state.user.displayName,
      nickname: store.state.user.displayName,
      notification: 0,
      image: store.state.user.photoURL
        ? store.state.user.photoURL
        : identicon(store.state.user.email),
      language: "en",
      published: false
    } as User);
    batch.set(getConfigDocRef(store.state.user.uid, "editor"), {
      themeName: "VSCode"
    });
    await batch.commit();
  }
}

export function userUpdate(userModify: UserModify): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getUsersDocRef(store.state.user.uid).update(userModify);
}
