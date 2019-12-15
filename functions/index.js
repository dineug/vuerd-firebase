require("./plugins/firebase");
const user = require("./service/user");
const notebook = require("./service/notebook");
const notebookMember = require("./service/notebookMember");
const notebookComment = require("./service/notebookComment");

exports.deleteUser = user.deleteUser;
exports.updateUser = user.updateUser;
exports.createNotebook = notebook.createNotebook;
exports.updateNotebook = notebook.updateNotebook;
exports.deleteNotebook = notebook.deleteNotebook;
exports.createNotebookMember = notebookMember.createNotebookMember;
exports.updateNotebookMember = notebookMember.updateNotebookMember;
exports.deleteNotebookMember = notebookMember.deleteNotebookMember;
exports.createNotebookComment = notebookComment.createNotebookComment;
