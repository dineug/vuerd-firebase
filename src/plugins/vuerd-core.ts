import Vue from "vue";
import log from "@/ts/Logger";
import {
  list,
  removeBatch,
  saveBatch,
  TreeNodeModel,
  TreeNodeModelImpl
} from "@/api/DocumentAPI";
import {
  convertTree,
  findTreeNodeByPath,
  findPathByPaths
} from "@/api/DocumentHelper";
import store, { Commit } from "@/store";
import VuerdCore, { Command, Tree, TreeMove, TreeSave } from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import TuiEditor from "vuerd-plugin-tui.editor";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-erd/dist/vuerd-plugin-erd.css";
import "vuerd-plugin-tui.editor/dist/vuerd-plugin-tui.editor.css";

async function findFileByPath(path: string): Promise<string> {
  log.debug(`vuerd-core findFileByPath`);
  const treeNode = findTreeNodeByPath(store.state.treeList, path);
  if (!treeNode) {
    throw new Error("not found file");
  }
  if (!treeNode.value) {
    return "";
  }
  return treeNode.value;
}

async function findTreeBy(): Promise<Tree> {
  log.debug(`vuerd-core findTreeBy`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  const querySnapshot = await list(store.state.notebookId);
  const treeList: TreeNodeModel[] = [];
  querySnapshot.forEach(doc => treeList.push(new TreeNodeModelImpl(doc)));
  store.commit(Commit.setTreeList, treeList);
  return convertTree(treeList);
}

async function save(treeSaves: TreeSave[]): Promise<void> {
  log.debug(`vuerd-core save`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  await saveBatch(store.state.notebookId, treeSaves);
  const querySnapshot = await list(store.state.notebookId);
  const treeList: TreeNodeModel[] = [];
  querySnapshot.forEach(doc => treeList.push(new TreeNodeModelImpl(doc)));
  store.commit(Commit.setTreeList, treeList);
}

async function deleteByPaths(paths: string[]): Promise<void> {
  log.debug(`vuerd-core deleteByPaths`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  const deletePaths = findPathByPaths(store.state.treeList, paths);
  return removeBatch(store.state.notebookId, deletePaths);
}

async function move(treeMove: TreeMove): Promise<void> {
  log.debug(`vuerd-core move`);
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
