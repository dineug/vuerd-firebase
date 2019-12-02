const { db } = require("./firebase");

module.exports = {
  getTagsDocRef(tag) {
    return db.collection("tags").doc(tag);
  },
  getUsersDocRef(uid) {
    return db.collection("users").doc(uid);
  },
  getConfigDocRef(uid, id) {
    return db
      .collection("users")
      .doc(uid)
      .collection("config")
      .doc(id);
  }
};
