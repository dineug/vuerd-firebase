import Vue from "vue";
import router from "@/router";
import { MAX_SIZE_EDITOR } from "@/data/image";
import store, { Commit } from "@/store";
import eventBus, { Bus } from "@/ts/EventBus";
import i18n from "./vue-i18n";
import log from "@/ts/Logger";
import { TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import { FileType, upload } from "@/api/storageAPI";
import {
  treeList,
  treeRemoveBatch,
  treeSaveBatch,
  treeMoveBatch
} from "@/api/TreeAPI";
import {
  convertTree,
  findTreeNodeByPath,
  findPathByPaths
} from "@/api/TreeHelper";
import VuerdCore, { Command, Tree, TreeMove, TreeSave } from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import TuiEditor from "vuerd-plugin-tui.editor";
import Summernote from "vuerd-plugin-summernote";
import Quill from "vuerd-plugin-quill";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-tui.editor/dist/vuerd-plugin-tui.editor.css";
import "vuerd-plugin-summernote/dist/vuerd-plugin-summernote.css";
import "vuerd-plugin-quill/dist/vuerd-plugin-quill.css";

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
  const querySnapshot = await treeList(store.state.notebookId);
  const trees: TreeNodeModel[] = [];
  querySnapshot.forEach(doc => trees.push(new TreeNodeModelImpl(doc)));
  store.commit(Commit.setTreeList, trees);
  return convertTree(trees);
}

async function save(treeSaves: TreeSave[]): Promise<void> {
  log.debug(`vuerd-core save`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  await treeSaveBatch(store.state.notebookId, treeSaves);
}

async function deleteByPaths(paths: string[]): Promise<void> {
  log.debug(`vuerd-core deleteByPaths`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  const deletePaths = findPathByPaths(store.state.treeList, paths);
  await treeRemoveBatch(store.state.notebookId, deletePaths);
}

async function move(treeMove: TreeMove): Promise<void> {
  log.debug(`vuerd-core move`);
  if (!store.state.notebookId) {
    throw new Error("not found notebookId");
  }
  await treeMoveBatch(store.state.notebookId, treeMove);
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
        ],
        explorerContextmenu: [
          {
            name: "Export iframe",
            execute(selectPaths: string[]): void {
              eventBus.$emit(Bus.ExportIframe.drawerStart);
            }
          }
        ]
      }
    });
  }
});

function valid(file: File | Blob): boolean {
  let result = false;
  const isJPG = file.type === FileType.jpg;
  const isPNG = file.type === FileType.png;
  const isGIF = file.type === FileType.gif;
  if (!(isJPG || isPNG || isGIF)) {
    Vue.prototype.$notify.warning({
      title: "Valid",
      message: i18n.t("valid.editorImageType") as string
    });
  } else if (file.size > MAX_SIZE_EDITOR) {
    Vue.prototype.$notify.warning({
      title: "Valid",
      message: i18n.t("valid.editorImageSize") as string
    });
  } else {
    result = true;
  }
  return result;
}

VuerdCore.use(ERD);
VuerdCore.use(TuiEditor, {
  scope: [/\.(md|tui.editor.md)$/i],
  imageUpload(blob, callback) {
    if (valid(blob)) {
      upload(blob)
        .then(url => callback(url))
        .catch(err =>
          Vue.prototype.$notify.error({
            title: "Error",
            message: err.message
          })
        );
    }
  }
});
VuerdCore.use(Summernote, {
  scope: [/\.(summernote.rich)$/i],
  imageUpload(files, callback) {
    files.forEach(file => {
      if (valid(file)) {
        upload(file)
          .then(url => callback(url))
          .catch(err =>
            Vue.prototype.$notify.error({
              title: "Error",
              message: err.message
            })
          );
      }
    });
  }
});
VuerdCore.use(Quill, {
  scope: [/\.(rich|quill.rich)$/i],
  imageUpload(files, callback) {
    files.forEach(file => {
      if (valid(file)) {
        upload(file)
          .then(url => callback(url))
          .catch(err =>
            Vue.prototype.$notify.error({
              title: "Error",
              message: err.message
            })
          );
      }
    });
  }
});
Vue.use(VuerdCore);
