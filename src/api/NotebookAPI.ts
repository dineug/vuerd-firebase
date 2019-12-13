import {
  db,
  QuerySnapshot,
  DocumentReference,
  Paging,
  CollectionReference
} from "@/plugins/firebase";
import {
  Notebook,
  NotebookAdd,
  Member,
  MemberAdd,
  Role
} from "./NotebookModel";
import store from "@/store";
import moment from "moment";
import { getTreesColRef } from "./TreeAPI";
import { User } from "./UserModel";
import { TreeNode } from "./TreeModel";
import { findUserBy } from "./UserAPI";

export function getNotebooksColRef(): CollectionReference {
  return db.collection("notebooks");
}

export function getNotebookDocRef(id: string): DocumentReference {
  return getNotebooksColRef().doc(id);
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

export async function save(
  notebookAdd: NotebookAdd
): Promise<DocumentReference> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  const notebook = notebookAdd as Notebook;
  notebook.roles = {};
  notebook.roles[store.state.user.uid] = "owner";
  notebook.members = [store.state.user.uid];
  notebook.updatedAt = moment().unix();
  notebook.createdAt = moment().unix();
  const docRef = await getNotebooksColRef().add(notebook);
  await getTreesColRef(docRef.id).add({
    path: "unnamed",
    name: "unnamed",
    updatedAt: moment().unix(),
    createdAt: moment().unix()
  } as TreeNode);
  const docUser = await findUserBy();
  const user = docUser.data() as User;
  await getMembersDocRef(docRef.id, store.state.user.uid).set({
    name: user.name,
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
    paging.orderBy = "createdAt";
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
    paging.orderBy = "createdAt";
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

export function findById(id: string) {
  return getNotebookDocRef(id).get();
}

export function notebookUpdate(
  id: string,
  notebookAdd: NotebookAdd
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getNotebookDocRef(id).update(notebookAdd);
}

export function findAllMemberBy(id: string): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getMembersColRef(id).get();
}

export function memberInvitation(
  notebookId: string,
  membersAdd: MemberAdd[]
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  const batch = db.batch();
  for (const member of membersAdd) {
    batch.set(getMembersDocRef(notebookId, member.id), {
      fromId: store.state.user.uid,
      name: member.name,
      nickname: member.nickname,
      email: member.email,
      image: member.image,
      role: "reader",
      status: "invitation",
      createdAt: moment().unix()
    } as Member);
  }
  return batch.commit();
}

export function deleteById(notebookId: string): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getNotebookDocRef(notebookId).delete();
}

export function deleteMemberById(
  notebookId: string,
  memberId: string
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getMembersDocRef(notebookId, memberId).delete();
}

export function memberRoleUpdate(
  notebookId: string,
  memberId: string,
  role: Role
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getMembersDocRef(notebookId, memberId).update({
    role
  });
}
