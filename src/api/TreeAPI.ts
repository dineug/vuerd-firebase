import {
  db,
  QuerySnapshot,
  DocumentReference,
  CollectionReference
} from "@/plugins/firebase";
import log from "@/ts/Logger";
import store from "@/store";
import moment from "moment";
import { TreeMove, TreeSave } from "vuerd-core";
import { Move, TreeNodeModel, TreeNode } from "./TreeModel";
import {
  findTreeNodeByPath,
  findPathByPaths,
  orderByPathLengthDESC
} from "./TreeHelper";

export function getTreesColRef(notebookId: string): CollectionReference {
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees");
}

export function getTreesDocRef(
  notebookId: string,
  treeId: string
): DocumentReference {
  return getTreesColRef(notebookId).doc(treeId);
}

export function findAllBy(notebookId: string): Promise<QuerySnapshot> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .get();
}

export function deleteByBatch(
  notebookId: string,
  paths: string[]
): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found user");
  }
  const batch = db.batch();
  let rootCreate = false;
  let rootTreeNode!: TreeNodeModel;
  paths.forEach(path => {
    const treeNode = findTreeNodeByPath(store.state.treeList, path);
    if (treeNode) {
      if (path.indexOf("/") === -1) {
        rootCreate = true;
        rootTreeNode = treeNode;
        rootTreeNode.name = path;
        rootTreeNode.path = path;
      } else {
        batch.delete(getTreesDocRef(notebookId, treeNode.id));
      }
    }
  });
  if (rootCreate && rootTreeNode) {
    batch.update(getTreesDocRef(notebookId, rootTreeNode.id), {
      path: rootTreeNode.path,
      name: rootTreeNode.name,
      updatedAt: rootTreeNode.updatedAt,
      createdAt: rootTreeNode.createdAt
    } as TreeNode);
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
    if (treeSave.oldPath) {
      const paths = findPathByPaths(store.state.treeList, [treeSave.oldPath]);
      for (const path of paths) {
        const treeNode = findTreeNodeByPath(store.state.treeList, path);
        if (treeNode) {
          if (treeNode.path === treeSave.oldPath) {
            const data: TreeNode = {
              path: treeSave.path,
              name: treeSave.name,
              updatedAt: moment().unix(),
              createdAt: treeNode.createdAt
            };
            if (treeNode.value !== undefined) {
              data.value = treeNode.value;
            }
            if (treeSave.value !== undefined) {
              data.value = treeSave.value;
            }
            batch.update(getTreesDocRef(notebookId, treeNode.id), data);
          } else {
            const data: TreeNode = {
              path: treeNode.path.replace(treeSave.oldPath, treeSave.path),
              name: treeNode.name,
              updatedAt: moment().unix(),
              createdAt: treeNode.createdAt
            };
            if (treeNode.value !== undefined) {
              data.value = treeNode.value;
            }
            batch.update(getTreesDocRef(notebookId, treeNode.id), data);
          }
        }
      }
    } else {
      const treeNode = findTreeNodeByPath(store.state.treeList, treeSave.path);
      if (treeNode) {
        const data: TreeNode = {
          path: treeSave.path,
          name: treeSave.name,
          updatedAt: moment().unix(),
          createdAt: treeNode.createdAt
        };
        if (treeNode.value !== undefined) {
          data.value = treeNode.value;
        }
        if (treeSave.value !== undefined) {
          data.value = treeSave.value;
        }
        batch.update(getTreesDocRef(notebookId, treeNode.id), data);
      } else {
        const data: TreeNode = {
          path: treeSave.path,
          name: treeSave.name,
          updatedAt: moment().unix(),
          createdAt: moment().unix()
        };
        if (treeSave.value !== undefined) {
          data.value = treeSave.value;
        }
        batch.set(getTreesColRef(notebookId).doc(), data);
      }
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
  const moves: Move[] = [];
  const saveTreeList: TreeNodeModel[] = [];
  treeMove.fromPaths.forEach(path => {
    const tree = findTreeNodeByPath(store.state.treeList, path);
    if (tree) {
      moves.push({
        path,
        name: tree.name
      });
      tree.path = `${treeMove.toPath}/${tree.name}`;
      saveTreeList.push(tree);
    }
  });
  moves.sort(orderByPathLengthDESC);
  moves.forEach(move => {
    const paths = findPathByPaths(store.state.treeList, [move.path]);
    paths.forEach(path => {
      const tree = findTreeNodeByPath(store.state.treeList, path);
      if (tree) {
        tree.path = tree.path.replace(
          move.path,
          `${treeMove.toPath}/${move.name}`
        );
        saveTreeList.push(tree);
      }
    });
  });
  saveTreeList.forEach(treeNode => {
    const data: TreeNode = {
      path: treeNode.path,
      name: treeNode.name,
      updatedAt: moment().unix(),
      createdAt: treeNode.createdAt
    };
    if (treeNode.value !== undefined) {
      data.value = treeNode.value;
    }
    batch.update(getTreesDocRef(notebookId, treeNode.id), data);
  });
  return batch.commit();
}
