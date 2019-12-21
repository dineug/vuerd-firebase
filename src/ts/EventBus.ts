import Vue from "vue";

enum Editor {
  reload = "Editor.reload"
}

enum NewNotebook {
  drawerStart = "NewNotebook.drawerStart",
  drawerEnd = "NewNotebook.drawerEnd"
}

enum Setting {
  setInfo = "Setting.setInfo"
}

enum Comment {
  drawerStart = "Comment.drawerStart",
  drawerEnd = "Comment.drawerEnd"
}

enum ExportIframe {
  drawerStart = "ExportLink.drawerStart",
  drawerEnd = "ExportLink.drawerEnd"
}

export const Bus = {
  Editor,
  NewNotebook,
  Setting,
  Comment,
  ExportIframe
};

export default new Vue();
