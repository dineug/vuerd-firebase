const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

module.exports = {
  functions: functions.region("asia-northeast1"),
  admin,
  db
};
