const { db } = require("./firebase");

function getTagsDocRef(tag) {
  return db.collection("tags").doc(tag);
}

function getUsersDocRef(uid) {
  return db.collection("users").doc(uid);
}

function getConfigDocRef(uid, id) {
  return getUsersDocRef(uid)
    .collection("config")
    .doc(id);
}

function getNotificationColRef(uid) {
  return getUsersDocRef(uid).collection("notification");
}

function getInvitationDocRef(uid) {
  return db.collection("invitation").doc(uid);
}

function getNotebooksDocRef(id) {
  return db.collection("notebooks").doc(id);
}

module.exports = {
  getTagsDocRef,
  getUsersDocRef,
  getConfigDocRef,
  getNotificationColRef,
  getInvitationDocRef,
  getNotebooksDocRef
};
