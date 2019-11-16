import {
  db,
  QuerySnapshot,
  DocumentReference,
  DocumentSnapshot
} from "@/plugins/firebase";
import store from "@/store";

export interface Editor {
  themeName: string;
}

export function saveConfigEditor(editor: Editor): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return db
    .collection("users")
    .doc(store.state.user.uid)
    .collection("config")
    .doc("editor")
    .set(editor);
}

export function findByConfigEditor(): Promise<DocumentSnapshot> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return db
    .collection("users")
    .doc(store.state.user.uid)
    .collection("config")
    .doc("editor")
    .get();
}
