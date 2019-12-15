import { db, DocumentReference, CollectionReference } from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { Comment } from "./CommentModel";

export function getCommentColRef(notebookId: string): CollectionReference {
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("comments");
}

export function getCommentDocRef(
  notebookId: string,
  commentId: string
): DocumentReference {
  return getCommentColRef(notebookId).doc(commentId);
}

export function save(
  notebookId: string,
  message: string
): Promise<DocumentReference> {
  if (!store.state.user || !store.state.info) {
    throw new Error("not found user");
  }
  return getCommentColRef(notebookId).add({
    uid: store.state.user.uid,
    name: store.state.info.name,
    nickname: store.state.info.nickname,
    email: store.state.info.email,
    image: store.state.info.image,
    message,
    updatedAt: moment().unix(),
    createdAt: moment().unix()
  } as Comment);
}

export function deleteById(
  notebookId: string,
  commentId: string
): Promise<void> {
  if (!store.state.user || !store.state.info) {
    throw new Error("not found user");
  }
  return getCommentDocRef(notebookId, commentId).delete();
}

export function commentUpdate(
  notebookId: string,
  commentId: string,
  message: string
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return getCommentDocRef(notebookId, commentId).update({
    message,
    updatedAt: moment().unix()
  } as Comment);
}
