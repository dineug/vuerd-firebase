import { TreeNodeModel } from "@/api/TreeModel";

type ViewType = "markdown" | "vuerd" | "rich" | null;

export interface Editor extends TreeNodeModel {
  type: ViewType;
}

export function treeNodeModelToEditor(tree: TreeNodeModel): Editor {
  const editor = tree as Editor;
  if (/\.md$/i.test(tree.name)) {
    editor.type = "markdown";
  } else if (/\.vuerd$/i.test(tree.name)) {
    editor.type = "vuerd";
  } else if (/\.rich$/i.test(tree.name)) {
    editor.type = "rich";
  } else {
    editor.type = null;
  }
  return editor;
}
