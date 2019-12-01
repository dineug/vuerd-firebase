import {
  db,
  QuerySnapshot,
  DocumentReference,
  QueryDocumentSnapshot,
  Paging
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { getTreesDocRef } from "./DocumentAPI";

export type Role = "owner" | "writer" | "reader";

export interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  image?: string;
  hashTags: string[];
  updatedAt: number;
  createdAt: number;
}

export interface NotebookModel extends Notebook {
  id: string;
}

export class NotebookModelImpl implements NotebookModel {
  public id: string;
  public roles: { [p: string]: Role };
  public members: string[];
  public published: boolean;
  public title: string;
  public image: string;
  public hashTags: string[];
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: QueryDocumentSnapshot) {
    this.id = doc.id;
    const {
      roles,
      members,
      published,
      title,
      image,
      hashTags,
      updatedAt,
      createdAt
    } = doc.data();
    this.roles = roles;
    this.members = members;
    this.published = published;
    this.title = title;
    this.image = image;
    this.hashTags = hashTags;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
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
  notebook.hashTags = ["vuejs"];
  notebook.updatedAt = moment().unix();
  notebook.createdAt = moment().unix();
  const docRef = await db.collection("notebooks").add(notebook);
  await getTreesDocRef(docRef.id, "unnamed").set({
    name: "unnamed",
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
    throw new Error("not found user");
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
