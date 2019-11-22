import { db, QuerySnapshot, QueryDocumentSnapshot } from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { TreeSave } from "vuerd-core";
import { findTreeNodeByPath } from "./DocumentHelper";

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

export interface TreeNodeAdd {
  name: string;
  value?: string;
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

export function add(
  notebookId: string,
  path: string,
  treeAdd: TreeNodeAdd
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const tree = treeAdd as TreeNode;
  tree.updatedAt = moment().unix();
  tree.createdAt = moment().unix();
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .doc(path)
    .set(tree);
}

export function modify(
  notebookId: string,
  path: string,
  tree: TreeNode
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  tree.updatedAt = moment().unix();
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .doc(path)
    .set(tree);
}

export function removeBatch(
  notebookId: string,
  paths: string[]
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const batch = db.batch();
  paths.forEach(path => {
    batch.delete(
      db
        .collection("notebooks")
        .doc(notebookId)
        .collection("trees")
        .doc(path)
    );
  });
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
      const treeNode = findTreeNodeByPath(
        store.state.treeList,
        treeSave.oldPath
      );
      if (treeNode) {
        batch.delete(
          db
            .collection("notebooks")
            .doc(notebookId)
            .collection("trees")
            .doc(treeSave.oldPath)
        );
        const data: TreeNode = {
          name: treeSave.name,
          updatedAt: moment().unix(),
          createdAt: treeNode.createdAt
        };
        if (treeSave.value) {
          data.value = treeSave.value;
        }
        batch.set(
          db
            .collection("notebooks")
            .doc(notebookId)
            .collection("trees")
            .doc(treeSave.path),
          data
        );
      }
    } else {
      const treeNode = findTreeNodeByPath(store.state.treeList, treeSave.path);
      if (treeNode) {
        const data: TreeNode = {
          name: treeSave.name,
          updatedAt: moment().unix(),
          createdAt: treeNode.createdAt
        };
        if (treeSave.value) {
          data.value = treeSave.value;
        }
        batch.update(
          db
            .collection("notebooks")
            .doc(notebookId)
            .collection("trees")
            .doc(treeSave.path),
          data
        );
      } else {
        const data: TreeNode = {
          name: treeSave.name,
          updatedAt: moment().unix(),
          createdAt: moment().unix()
        };
        if (treeSave.value) {
          data.value = treeSave.value;
        }
        batch.set(
          db
            .collection("notebooks")
            .doc(notebookId)
            .collection("trees")
            .doc(treeSave.path),
          data
        );
      }
    }
  });
  return batch.commit();
}
