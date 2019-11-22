import {
  db,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentReference
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { TreeSave } from "vuerd-core";
import { findTreeNodeByPath, findPathByPaths } from "./DocumentHelper";

export interface TreeNode {
  name: string;
  value?: string;
  updatedAt: number;
  createdAt: number;
}

export interface TreeNodeModel extends TreeNode {
  path: string;
}

export class TreeNodeModelImpl implements TreeNodeModel {
  public path: string;
  public name: string;
  public value: string;
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: QueryDocumentSnapshot) {
    this.path = doc.id;
    const { name, value, updatedAt, createdAt } = doc.data();
    this.name = name;
    this.value = value;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}

export function list(notebookId: string): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .get();
}

export function removeBatch(
  notebookId: string,
  paths: string[]
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const batch = db.batch();
  let createRoot = false;
  paths.forEach(path => {
    if (path.indexOf(":") === -1) {
      createRoot = true;
    }
    batch.delete(getTreeDocRef(notebookId, path));
  });
  if (createRoot) {
    batch.set(getTreeDocRef(notebookId, "unnamed"), {
      name: "unnamed",
      updatedAt: moment().unix(),
      createdAt: moment().unix()
    });
  }
  return batch.commit();
}

export function saveBatch(
  notebookId: string,
  treeSaves: TreeSave[]
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const batch = db.batch();
  treeSaves.forEach(treeSave => {
    treeSave.path = treeSave.path.replace(/\//g, ":");
    if (treeSave.oldPath) {
      treeSave.oldPath = treeSave.oldPath.replace(/\//g, ":");
      const paths = findPathByPaths(store.state.treeList, [treeSave.oldPath]);
      for (const path of paths) {
        batch.delete(getTreeDocRef(notebookId, path));
        const treeNode = findTreeNodeByPath(store.state.treeList, path);
        if (treeNode) {
          const data: TreeNode = {
            name: treeNode.name,
            updatedAt: moment().unix(),
            createdAt: treeNode.createdAt
          };
          if (treeNode.value !== undefined) {
            data.value = treeNode.value;
          }
          if (treeNode.path === treeSave.oldPath) {
            data.name = treeSave.name;
            if (treeSave.value !== undefined) {
              data.value = treeSave.value;
            }
          }
          batch.set(
            getTreeDocRef(
              notebookId,
              path.replace(treeSave.oldPath, treeSave.path)
            ),
            data
          );
        }
      }
    } else {
      const treeNode = findTreeNodeByPath(store.state.treeList, treeSave.path);
      const data: TreeNode = {
        name: treeSave.name,
        updatedAt: moment().unix(),
        createdAt: moment().unix()
      };
      if (treeSave.value !== undefined) {
        data.value = treeSave.value;
      }
      if (treeNode) {
        data.createdAt = treeNode.createdAt;
      }
      batch.set(getTreeDocRef(notebookId, treeSave.path), data);
    }
  });
  return batch.commit();
}

export function getTreeDocRef(
  notebookId: string,
  path: string
): DocumentReference {
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .doc(path);
}
