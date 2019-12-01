import {
  db,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference
} from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";
import { TreeMove, TreeSave } from "vuerd-core";
import {
  findTreeNodeByPath,
  findPathByPaths,
  Move,
  orderByPathLengthDESC
} from "./DocumentHelper";

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

export function getTreesColRef(notebookId: string): CollectionReference {
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees");
}

export function getTreesDocRef(
  notebookId: string,
  path: string
): DocumentReference {
  return getTreesColRef(notebookId).doc(path);
}

export function list(notebookId: string): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
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
    throw new Error("not found user");
  }
  const batch = db.batch();
  let rootCreate = false;
  let rootName = "unnamed";
  paths.forEach(path => {
    if (path.indexOf(":") === -1) {
      rootCreate = true;
      rootName = path;
    }
    batch.delete(getTreesDocRef(notebookId, path));
  });
  if (rootCreate) {
    batch.set(getTreesDocRef(notebookId, rootName), {
      name: rootName,
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
    throw new Error("not found user");
  }
  const batch = db.batch();
  treeSaves.forEach(treeSave => {
    treeSave.path = treeSave.path.replace(/\//g, ":");
    if (treeSave.oldPath) {
      treeSave.oldPath = treeSave.oldPath.replace(/\//g, ":");
      const paths = findPathByPaths(store.state.treeList, [treeSave.oldPath]);
      for (const path of paths) {
        batch.delete(getTreesDocRef(notebookId, path));
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
            getTreesDocRef(
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
      if (treeNode) {
        data.createdAt = treeNode.createdAt;
        if (treeNode.value !== undefined) {
          data.value = treeNode.value;
        }
      }
      if (treeSave.value !== undefined) {
        data.value = treeSave.value;
      }
      batch.set(getTreesDocRef(notebookId, treeSave.path), data);
    }
  });
  return batch.commit();
}

export function moveBatch(
  notebookId: string,
  treeMove: TreeMove
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  const batch = db.batch();
  const deleteMoves: Move[] = [];
  const saveTreeList: TreeNodeModel[] = [];
  treeMove.toPath = treeMove.toPath.replace(/\//g, ":");
  treeMove.fromPaths.forEach(path => {
    path = path.replace(/\//g, ":");
    const tree = findTreeNodeByPath(store.state.treeList, path);
    if (tree) {
      deleteMoves.push({
        path,
        name: tree.name
      });
      tree.path = `${treeMove.toPath}:${tree.name}`;
      saveTreeList.push(tree);
    }
  });
  deleteMoves.sort(orderByPathLengthDESC);
  const searchDeleteMoves = [...deleteMoves];
  searchDeleteMoves.forEach(deleteMove => {
    const paths = findPathByPaths(store.state.treeList, [deleteMove.path]);
    paths.forEach(path => {
      const tree = findTreeNodeByPath(store.state.treeList, path);
      if (tree) {
        deleteMoves.push({
          path,
          name: tree.name
        });
        tree.path = tree.path.replace(
          deleteMove.path,
          `${treeMove.toPath}:${deleteMove.name}`
        );
        saveTreeList.push(tree);
      }
    });
  });
  deleteMoves.forEach(deleteMove => {
    batch.delete(getTreesDocRef(notebookId, deleteMove.path));
  });
  saveTreeList.forEach(treeNode => {
    const data: TreeNode = {
      name: treeNode.name,
      updatedAt: moment().unix(),
      createdAt: treeNode.createdAt
    };
    if (treeNode.value !== undefined) {
      data.value = treeNode.value;
    }
    batch.set(getTreesDocRef(notebookId, treeNode.path), data);
  });
  return batch.commit();
}
