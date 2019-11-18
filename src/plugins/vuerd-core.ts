import Vue from "vue";
import log from "@/ts/Logger";
import { list, TreeNodeModel, TreeNodeModelImpl } from "@/api/DocumentAPI";
import { convertTree } from "@/api/DocumentHelper";
import store from "@/store";
import VuerdCore, { Command, Tree, TreeMove, TreeSave } from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import TuiEditor from "vuerd-plugin-tui.editor";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-erd/dist/vuerd-plugin-erd.css";
import "vuerd-plugin-tui.editor/dist/vuerd-plugin-tui.editor.css";

async function findFileByPath(path: string): Promise<string> {
  log.debug(path);
  return "";
}

async function findTreeBy(): Promise<Tree> {
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  log.debug(`vuerd-core findTreeBy`);
  const querySnapshot = await list(store.state.notebookId);
  const treeList: TreeNodeModel[] = [];
  querySnapshot.forEach(doc => treeList.push(new TreeNodeModelImpl(doc)));
  return convertTree(treeList);
}

async function save(treeSaves: TreeSave[]): Promise<void> {
  // data save
  log.debug(treeSaves);
}

async function deleteByPaths(paths: string[]): Promise<void> {
  // data delete
  log.debug(paths);
}

async function move(treeMove: TreeMove): Promise<void> {
  // data move
  log.debug(treeMove);
}

VuerdCore.use({
  install(command: Command): void {
    command.remoteAdd({
      name: "vuerd",
      findTreeBy,
      findFileByPath,
      save,
      deleteByPaths,
      move
    });
  }
});

VuerdCore.use(ERD);
VuerdCore.use(TuiEditor);
Vue.use(VuerdCore);
