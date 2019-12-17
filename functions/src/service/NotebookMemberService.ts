import { functions, db } from "../plugins/firebase";
import {
  getNotificationColRef,
  getUsersDocRef,
  getNotebooksDocRef,
  getMembersDocRef
} from "../plugins/util";
import { Member, Notebook } from "./NotebookModel";
import { User } from "./UserModel";
import * as moment from "moment";

export const createNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onCreate(async (snapshot, context) => {
    const newMember = snapshot.data() as Member;
    if (newMember.status === "invitation") {
      const batch = db.batch();
      const fromDoc = await getUsersDocRef(newMember.fromId).get();
      const fromData = fromDoc.data() as User;
      batch.set(getNotificationColRef(context.params.memberId).doc(), {
        message: `${fromData.email} has invited you`,
        action: "invitation",
        read: false,
        key: context.params.notebookId,
        createdAt: moment().unix()
      });
      const toDoc = await getUsersDocRef(context.params.memberId).get();
      const toData = toDoc.data() as User;
      batch.update(toDoc.ref, {
        notification: toData.notification + 1
      });
      await batch.commit();
    }
  });

export const updateNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onUpdate(async (change, context) => {
    const afterMember = change.after.data() as Member;
    const beforeMember = change.before.data() as Member;
    if (
      beforeMember.status === "invitation" &&
      afterMember.status === "accept"
    ) {
      const notebookDoc = await getNotebooksDocRef(
        context.params.notebookId
      ).get();
      const notebook = notebookDoc.data() as Notebook;
      if (notebook.members.indexOf(context.params.memberId) === -1) {
        const members = notebook.members;
        const roles = notebook.roles;
        members.push(context.params.memberId);
        roles[context.params.memberId] = beforeMember.role;
        notebookDoc.ref.update({
          members,
          roles
        });
      }
    } else if (beforeMember.role !== afterMember.role) {
      const batch = db.batch();
      const notebookDoc = await getNotebooksDocRef(
        context.params.notebookId
      ).get();
      const notebook = notebookDoc.data() as Notebook;
      const roles = notebook.roles;
      roles[context.params.memberId] = afterMember.role;
      let isOwner = false;
      Object.keys(roles).forEach(key => {
        if (roles[key] === "owner") {
          isOwner = true;
        }
      });
      if (!isOwner) {
        const ids = Object.keys(roles);
        if (ids.length !== 0) {
          roles[ids[0]] = "owner";
          batch.update(getMembersDocRef(context.params.notebookId, ids[0]), {
            role: "owner"
          });
        }
      }
      batch.update(notebookDoc.ref, {
        roles
      });
      await batch.commit();
    }
  });

export const deleteNotebookMember = functions.firestore
  .document("notebooks/{notebookId}/members/{memberId}")
  .onDelete(async (snapshot, context) => {
    const member = snapshot.data() as Member;
    if (member.status === "accept") {
      const notebookDoc = await getNotebooksDocRef(
        context.params.notebookId
      ).get();
      if (notebookDoc.exists) {
        const batch = db.batch();
        const notebook = notebookDoc.data() as Notebook;
        const members = notebook.members;
        const roles = notebook.roles;
        delete roles[context.params.memberId];
        let isOwner = false;
        Object.keys(roles).forEach(key => {
          if (roles[key] === "owner") {
            isOwner = true;
          }
        });
        if (!isOwner) {
          const ids = Object.keys(roles);
          if (ids.length !== 0) {
            roles[ids[0]] = "owner";
            batch.update(getMembersDocRef(context.params.notebookId, ids[0]), {
              role: "owner"
            });
          }
        }
        batch.update(notebookDoc.ref, {
          members: members.filter(member => member !== context.params.memberId),
          roles
        });
        await batch.commit();
      }
    }
  });
