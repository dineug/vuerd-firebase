import { functions, db } from "../plugins/firebase";
import { getMembersColRef, getUsersDocRef, getNotificationColRef } from "../plugins/util";
import { Member } from "./NotebookModel";
import { Comment } from "./CommentModel";
import { User } from "./UserModel";
import * as moment from "moment";

export const createNotebookComment = functions.firestore
  .document("notebooks/{notebookId}/comments/{commentId}")
  .onCreate(async (snapshot, context) => {
    const newComment = snapshot.data() as Comment;
    const memberQuery = await getMembersColRef(context.params.notebookId).get();
    const members: Member[] = [];
    memberQuery.forEach(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data.status === "accept" && newComment.uid !== data.uid) {
          members.push(doc.data() as Member);
        }
      }
    });

    if (members.length !== 0) {
      const batch = db.batch();
      const fromDoc = await getUsersDocRef(newComment.uid).get();
      const fromData = fromDoc.data() as User;
      for (const member of members) {
        batch.set(getNotificationColRef(member.uid).doc(), {
          message: `${fromData.email} left a comment`,
          action: "comment",
          read: false,
          key: context.params.notebookId,
          createdAt: moment().unix()
        });
        const toDoc = await getUsersDocRef(member.uid).get();
        const toData = toDoc.data() as User;
        batch.update(toDoc.ref, {
          notification: toData.notification + 1
        });
      }
      await batch.commit();
    }
  });
