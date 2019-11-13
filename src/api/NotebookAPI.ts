import {
  db,
  QuerySnapshot,
  DocumentReference,
  DocumentSnapshot,
  Paging
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";

export const enum Role {
  owner = "owner",
  writer = "writer",
  reader = "reader"
}

export interface Notebook {
  roles: { [key: string]: Role };
  published: boolean;
  title: string;
  image: string;
  tree: Tree;
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

export interface NotebookAdd {
  published: boolean;
  title: string;
}

export function add(notebookAdd: NotebookAdd): Promise<DocumentReference> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const notebook = notebookAdd as Notebook;
  notebook.roles = {};
  notebook.roles[store.state.user.uid] = Role.owner;
  notebook.tree = {
    name: "unnamed",
    open: true,
    children: []
  };
  notebook.createdAt = moment().unix();
  return db.collection("notebooks").add(notebook);
}

export function list(paging: Paging): Promise<QuerySnapshot> {
  if (!paging.limit) {
    paging.limit = 20;
  }
  if (paging.last) {
    return db
      .collection("notebooks")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(paging.last)
      .limit(paging.limit)
      .get();
  } else {
    return db
      .collection("notebooks")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(paging.limit)
      .get();
  }
}
