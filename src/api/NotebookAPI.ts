import {
  db,
  QuerySnapshot,
  DocumentReference,
  QueryDocumentSnapshot,
  Paging,
  CollectionReference
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { getTreesDocRef } from "./TreeAPI";
import { findUserBy, User } from "./UserAPI";

export function getNotebooksColRef(): CollectionReference {
  return db.collection("notebooks");
}

export function getMembersColRef(notebookId: string): CollectionReference {
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("members");
}

export function getMembersDocRef(
  notebookId: string,
  uid: string
): DocumentReference {
  return getMembersColRef(notebookId).doc(uid);
}

export type Role = "owner" | "writer" | "reader";
export type Status = "invitation" | "accept";

export interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  image: string | null;
  tags: string[];
  updatedAt: number;
  createdAt: number;
}

export interface Member {
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  status: Status;
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
  public image: string | null;
  public tags: string[];
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
      tags,
      updatedAt,
      createdAt
    } = doc.data();
    this.roles = roles;
    this.members = members;
    this.published = published;
    this.title = title;
    this.image = image;
    this.tags = tags;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}

export interface NotebookAdd {
  published: boolean;
  title: string;
  tags: string[];
}

export async function save(
  notebookAdd: NotebookAdd
): Promise<DocumentReference> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const notebook = notebookAdd as Notebook;
  notebook.roles = {};
  notebook.roles[store.state.user.uid] = "owner";
  notebook.members = [store.state.user.uid];
  notebook.image = null;
  notebook.updatedAt = moment().unix();
  notebook.createdAt = moment().unix();
  const docRef = await getNotebooksColRef().add(notebook);
  await getTreesDocRef(docRef.id, "unnamed").set({
    name: "unnamed",
    updatedAt: moment().unix(),
    createdAt: moment().unix()
  });
  const docUser = await findUserBy();
  const user = docUser.data() as User;
  await getMembersDocRef(docRef.id, store.state.user.uid).set({
    name: store.state.user.displayName,
    nickname: user.nickname,
    email: store.state.user.email,
    image: user.image,
    role: "owner",
    status: "accept",
    createdAt: moment().unix()
  } as Member);
  return docRef;
}

export function findByPaging(paging: Paging): Promise<QuerySnapshot> {
  if (!paging.limit) {
    paging.limit = 20;
  }
  if (!paging.orderBy) {
    paging.orderBy = "updatedAt";
  }
  if (!paging.sort) {
    paging.sort = "desc";
  }
  let ref = getNotebooksColRef()
    .where("published", "==", true)
    .orderBy(paging.orderBy, paging.sort)
    .limit(paging.limit);
  if (paging.last) {
    ref = ref.startAfter(paging.last);
  }
  return ref.get();
}

export function findByPagingAndMember(paging: Paging): Promise<QuerySnapshot> {
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
  let ref = getNotebooksColRef()
    .where("members", "array-contains", store.state.user.uid)
    .orderBy(paging.orderBy, paging.sort)
    .limit(paging.limit);
  if (paging.last) {
    ref = ref.startAfter(paging.last);
  }
  return ref.get();
}
