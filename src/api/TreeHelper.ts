import { TreeNodeModel, TreeModel } from "./TreeModel";
import { Tree } from "vuerd-core";

export function convertTree(treeList: TreeNodeModel[]): Tree {
  const list = [...treeList];
  list.sort(orderByPathLengthASC);
  const tree: Tree = {
    name: list[0].name,
    open: true,
    children: []
  };
  const children = list.splice(1);
  children.forEach(treeNode => {
    createTree(tree, treeNode);
  });
  return tree;
}

function createTree(root: Tree, treeNode: TreeNodeModel) {
  const paths = treeNode.path.split("/").reverse();
  paths.pop();
  const parent = findTreeByParent(root, paths);
  if (parent.children) {
    if (treeNode.value !== undefined) {
      parent.children.push({
        name: treeNode.name
      });
    } else {
      parent.children.push({
        name: treeNode.name,
        open: true,
        children: []
      });
    }
  }
}

function findTreeByParent(root: Tree, paths: string[]): Tree {
  const path = paths.pop();
  if (paths.length === 0) {
    return root;
  } else if (root.children) {
    let parent: Tree = root;
    root.children.forEach(node => {
      if (node.name === path) {
        parent = findTreeByParent(node, paths);
      }
    });
    return parent;
  }
  return root;
}

export function convertTreeModel(treeList: TreeNodeModel[]): TreeModel | null {
  if (treeList.length === 0) {
    return null;
  }
  const list = [...treeList];
  list.sort(orderByPathLengthASC);
  const tree = list[0] as TreeModel;
  tree.parent = null;
  tree.children = [];
  const children = list.splice(1);
  children.forEach(treeNode => {
    createTreeModel(tree, treeNode);
  });
  orderAllByNameASC(tree);
  return tree;
}

function createTreeModel(root: TreeModel, treeNode: TreeNodeModel) {
  const paths = treeNode.path.split("/").reverse();
  paths.pop();
  const parent = findTreeModelByParent(root, paths);
  if (parent.children) {
    if (treeNode.value !== undefined) {
      const node = treeNode as TreeModel;
      node.parent = parent;
      parent.children.push(node);
    } else {
      const node = treeNode as TreeModel;
      node.parent = parent;
      node.children = [];
      parent.children.push(node);
    }
  }
}

function findTreeModelByParent(root: TreeModel, paths: string[]): TreeModel {
  const path = paths.pop();
  if (paths.length === 0) {
    return root;
  } else if (root.children) {
    let parent: TreeModel = root;
    root.children.forEach(node => {
      if (node.name === path) {
        parent = findTreeModelByParent(node, paths);
      }
    });
    return parent;
  }
  return root;
}

export function orderAllByNameASC(root: Tree) {
  if (root.children) {
    orderByNameASC(root);
    root.children.forEach((tree: Tree) => {
      if (tree.children) {
        orderByNameASC(tree);
      }
    });
  }
}

export function orderByNameASC(folder: Tree) {
  if (folder.children) {
    const folders: Tree[] = [];
    const files: Tree[] = [];
    const sortTrees: Tree[] = [];
    folder.children.forEach((tree: Tree) => {
      if (tree.children) {
        folders.push(tree);
      } else {
        files.push(tree);
      }
    });
    folders.sort(treeSortNameASC);
    files.sort(treeSortNameASC);
    sortTrees.push.apply(sortTrees, folders);
    sortTrees.push.apply(sortTrees, files);
    folder.children = sortTrees;
  }
}

function treeSortNameASC(a: Tree, b: Tree): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

export function findTreeNodeByPath(
  treeList: TreeNodeModel[],
  path: string
): TreeNodeModel | null {
  let treeNode: TreeNodeModel | null = null;
  for (const node of treeList) {
    if (node.path === path) {
      treeNode = node;
      break;
    }
  }
  return treeNode;
}

export function findPathByPaths(
  treeList: TreeNodeModel[],
  paths: string[]
): string[] {
  const childrenPaths: string[] = [];
  paths.forEach(path => {
    treeList.forEach(tree => {
      if (
        (tree.path === path || tree.path.indexOf(`${path}/`) === 0) &&
        childrenPaths.indexOf(tree.path) === -1
      ) {
        childrenPaths.push(tree.path);
      }
    });
  });
  return childrenPaths;
}

interface TreeSort {
  path: string;
}

export function orderByPathLengthDESC<T extends TreeSort>(a: T, b: T): number {
  return b.path.length - a.path.length;
}

export function orderByPathLengthASC<T extends TreeSort>(a: T, b: T): number {
  return a.path.length - b.path.length;
}

export function path(tree: TreeModel, buffer: string[] = []): string {
  buffer.unshift(tree.name);
  if (tree.parent) {
    path(tree.parent, buffer);
  }
  return buffer.join("/");
}

export function findParentTreeByChildren(
  treeList: TreeNodeModel[],
  target: TreeNodeModel[]
): TreeNodeModel[] {
  const parent: TreeNodeModel[] = [];
  target.forEach(tree => {
    const paths = tree.path.split("/");
    paths.pop();
    const list = findParentTreeByPaths(treeList, paths);
    list.forEach(node => {
      if (!parent.some(value => value.path === node.path)) {
        parent.push(node);
      }
    });
  });
  return parent;
}

function findParentTreeByPaths(
  treeList: TreeNodeModel[],
  paths: string[],
  result: TreeNodeModel[] = []
): TreeNodeModel[] {
  if (paths.length === 0) {
    return result;
  }
  const tree = findTreeNodeByPath(treeList, paths.join("/"));
  if (tree) {
    result.push(tree);
    paths.pop();
    findParentTreeByPaths(treeList, paths, result);
  }
  return result;
}

export function isEditor(name: string): boolean {
  return /\.(md|vuerd|rich)$/i.test(name);
}

export function treeModelToTreeNodeModel(
  treeModel: TreeModel,
  result: TreeNodeModel[] = []
): TreeNodeModel[] {
  if (isEditor(treeModel.name)) {
    result.push(treeModel);
  }
  if (treeModel.children) {
    treeModel.children.forEach(tree => {
      treeModelToTreeNodeModel(tree, result);
    });
  }
  return result;
}

export function findTreeModelById(
  container: TreeModel,
  id: string
): TreeModel | null {
  if (container.id === id) {
    return container;
  } else {
    let target: TreeModel | null = null;
    if (container.children) {
      for (const value of container.children) {
        target = findTreeModelById(value, id);
        if (target) {
          break;
        }
      }
    }
    return target;
  }
}
