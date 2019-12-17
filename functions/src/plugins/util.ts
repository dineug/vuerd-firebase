import { DocumentReference, CollectionReference, db } from "./firebase";

export function getTagsDocRef(tag: string): DocumentReference {
  return db.collection("tags").doc(tag);
}

export function getUsersDocRef(uid: string): DocumentReference {
  return db.collection("users").doc(uid);
}

export function getConfigDocRef(uid: string, id: string): DocumentReference {
  return getUsersDocRef(uid)
    .collection("config")
    .doc(id);
}

export function getNotificationColRef(uid: string): CollectionReference {
  return getUsersDocRef(uid).collection("notification");
}

export function getInvitationDocRef(uid: string): DocumentReference {
  return db.collection("invitation").doc(uid);
}

export function getNotebooksDocRef(id: string): DocumentReference {
  return db.collection("notebooks").doc(id);
}

export function getTreesColRef(notebookId: string): CollectionReference {
  return getNotebooksDocRef(notebookId).collection("trees");
}

export function getMembersColRef(notebookId: string): CollectionReference {
  return getNotebooksDocRef(notebookId).collection("members");
}

export function getMembersDocRef(
  notebookId: string,
  uid: string
): DocumentReference {
  return getMembersColRef(notebookId).doc(uid);
}

export function getCommentColRef(notebookId: string): CollectionReference {
  return getNotebooksDocRef(notebookId).collection("comments");
}
