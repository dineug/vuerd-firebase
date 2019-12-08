import Vue from "vue";
import router from "@/router";
import store, { Commit } from "@/store";
import eventBus, { Bus } from "@/ts/EventBus";
import log from "@/ts/Logger";
import { TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import { upload } from "@/api/storageAPI";
import { findAllBy, deleteByBatch, saveBatch, moveBatch } from "@/api/TreeAPI";
import {
  convertTree,
  findTreeNodeByPath,
  findPathByPaths
} from "@/api/TreeHelper";
import VuerdCore, { Command, Tree, TreeMove, TreeSave } from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import TuiEditor from "vuerd-plugin-tui.editor";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-erd/dist/vuerd-plugin-erd.css";
import "vuerd-plugin-tui.editor/dist/vuerd-plugin-tui.editor.css";

async function getTreeList(): Promise<TreeNodeModel[]> {
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  const querySnapshot = await findAllBy(store.state.notebookId);
  const treeList: TreeNodeModel[] = [];
  querySnapshot.forEach(doc => treeList.push(new TreeNodeModelImpl(doc)));
  store.commit(Commit.setTreeList, treeList);
  return treeList;
}

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
  const treeList = await getTreeList();
  return convertTree(treeList);
}

async function save(treeSaves: TreeSave[]): Promise<void> {
  log.debug(`vuerd-core save`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  await saveBatch(store.state.notebookId, treeSaves);
  getTreeList();
}

async function deleteByPaths(paths: string[]): Promise<void> {
  log.debug(`vuerd-core deleteByPaths`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  const deletePaths = findPathByPaths(store.state.treeList, paths);
  await deleteByBatch(store.state.notebookId, deletePaths);
  getTreeList();
}

async function move(treeMove: TreeMove): Promise<void> {
  log.debug(`vuerd-core move`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  await moveBatch(store.state.notebookId, treeMove);
  getTreeList();
}

VuerdCore.use({
  install(command: Command): void {
    command.remoteAdd({
      name: "vuerd",
      findTreeBy,
      findFileByPath,
      save,
      deleteByPaths,
      move,
      option: {
        titleBarContextmenu: [
          {
            name: "File",
            children: [
              {
                name: "Restart",
                execute(): void {
                  eventBus.$emit(Bus.Editor.reload);
                }
              },
              {
                name: "Exit",
                execute(): void {
                  router.back();
                }
              }
            ]
          }
        ]
      }
    });
  }
});

VuerdCore.use(ERD);
VuerdCore.use(TuiEditor, {
  imageUpload(blob, callback) {
    upload(blob).then(string => callback(string));
  }
});
Vue.use(VuerdCore);
