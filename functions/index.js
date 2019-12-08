require("./plugins/firebase");
const user = require("./service/user");
const userNotification = require("./service/userNotification");
const notebook = require("./service/notebook");
const notebookMember = require("./service/notebookMember");

exports.deleteUser = user.deleteUser;
exports.updateUser = user.updateUser;
exports.updateUserNotification = userNotification.updateUserNotification;
exports.createNotebookTag = notebook.createNotebookTag;
exports.updateNotebookTag = notebook.updateNotebookTag;
exports.deleteNotebookTag = notebook.deleteNotebookTag;
exports.createNotebookMember = notebookMember.createNotebookMember;
exports.updateNotebookMember = notebookMember.updateNotebookMember;
exports.deleteNotebookMember = notebookMember.deleteNotebookMember;
