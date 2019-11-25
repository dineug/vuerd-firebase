import { TreeNodeModel } from "./DocumentAPI";
import { Tree } from "vuerd-core";

export function convertTree(treeList: TreeNodeModel[]): Tree {
  const first = treeList[0].path.split(":");
  const tree: Tree = {
    name: first[0],
    open: true,
    children: []
  };
  treeList.forEach(treeNode => {
    const paths = treeNode.path.split(":").reverse();
    paths.pop();
    createTree(tree, paths, treeNode.value);
  });
  return tree;
}

function createTree(tree: Tree, paths: string[], value?: string) {
  if (tree.children) {
    const name = paths.pop();
    if (name) {
      let node = findTreeByName(tree.children, name);
      if (paths.length === 0 && node === null && value !== undefined) {
        tree.children.push({
          name
        });
      } else {
        if (node === null) {
          node = {
            name,
            open: true,
            children: []
          };
          tree.children.push(node);
          createTree(node, paths, value);
        } else {
          createTree(node, paths, value);
        }
      }
    }
  }
}

export function findTreeByName(children: Tree[], name: string): Tree | null {
  let result: Tree | null = null;
  for (const node of children) {
    if (node.name === name) {
      result = node;
      break;
    }
  }
  return result;
}

export function findTreeNodeByPath(
  treeList: TreeNodeModel[],
  path: string
): TreeNodeModel | null {
  path = path.replace(/\//g, ":");
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
    path = path.replace(/\//g, ":");
    treeList.forEach(tree => {
      if (
        (tree.path === path || tree.path.indexOf(`${path}:`) === 0) &&
        childrenPaths.indexOf(tree.path) === -1
      ) {
        childrenPaths.push(tree.path);
      }
    });
  });
  return childrenPaths;
}

export interface Move {
  path: string;
  name: string;
}

export function orderByPathLengthDESC(a: Move, b: Move): number {
  return b.path.length - a.path.length;
}
