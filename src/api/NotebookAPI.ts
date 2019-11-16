import {
  db,
  QuerySnapshot,
  DocumentReference,
  DocumentSnapshot,
  Paging
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";

export type Role = "owner" | "writer" | "reader";

export interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  image?: string;
  tree?: Tree;
  updatedAt: number;
  createdAt: number;
}

export interface NotebookModel extends Notebook {
  id: string;
}

export interface Tree {
  name: string;
  open?: boolean;
  children?: Tree[];
  value?: string;
}

export interface TreeNode {
  open?: boolean;
  value?: string;
  updatedAt: number;
  createdAt: number;
}

export interface NotebookAdd {
  published: boolean;
  title: string;
}

export async function add(
  notebookAdd: NotebookAdd
): Promise<DocumentReference> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const notebook = notebookAdd as Notebook;
  notebook.roles = {};
  notebook.roles[store.state.user.uid] = "owner";
  notebook.members = [store.state.user.uid];
  notebook.updatedAt = moment().unix();
  notebook.createdAt = moment().unix();
  const docRef = await db.collection("notebooks").add(notebook);
  await db
    .collection("notebooks")
    .doc(docRef.id)
    .collection("trees")
    .doc("unnamed")
    .set({
      open: true,
      updatedAt: moment().unix(),
      createdAt: moment().unix()
    });
  return docRef;
}

export function list(paging: Paging): Promise<QuerySnapshot> {
  if (!paging.limit) {
    paging.limit = 20;
  }
  if (!paging.orderBy) {
    paging.orderBy = "updatedAt";
  }
  if (!paging.sort) {
    paging.sort = "desc";
  }
  let ref = db
    .collection("notebooks")
    .where("published", "==", true)
    .orderBy(paging.orderBy, paging.sort)
    .limit(paging.limit);
  if (paging.last) {
    ref = ref.startAfter(paging.last);
  }
  return ref.get();
}

export function myList(paging: Paging): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  if (!paging.limit) {
    paging.limit = 20;
  }
  if (!paging.orderBy) {
    paging.orderBy = "updatedAt";
  }
  if (!paging.sort) {
    paging.sort = "desc";
  }
  let ref = db
    .collection("notebooks")
    .where("members", "array-contains", store.state.user.uid)
    .orderBy(paging.orderBy, paging.sort)
    .limit(paging.limit);
  if (paging.last) {
    ref = ref.startAfter(paging.last);
  }
  return ref.get();
}
