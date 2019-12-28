import Vue from "vue";

enum Editor {
  reload = "Editor.reload"
}

enum NewNotebookDrawer {
  drawerStart = "NewNotebookDrawer.drawerStart",
  drawerEnd = "NewNotebookDrawer.drawerEnd"
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

enum Sidebar {
  show = "Sidebar.show",
  hide = "Sidebar.hide"
}

enum NavHeader {
  show = "NavHeader.show",
  hide = "NavHeader.hide"
}

export const Bus = {
  Editor,
  NewNotebookDrawer,
  Setting,
  Comment,
  ExportIframe,
  Sidebar,
  NavHeader
};

export default new Vue();
