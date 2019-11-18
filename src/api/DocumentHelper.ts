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

export function createTree(tree: Tree, paths: string[], value?: string) {
  if (tree.children) {
    const name = paths.pop();
    if (name) {
      let node = findTreeBy(tree.children, name);
      if (paths.length === 0) {
        if (node === null && value !== undefined) {
          tree.children.push({
            name
          });
        } else {
          tree.children.push({
            name,
            open: true,
            children: []
          });
        }
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

export function findTreeBy(children: Tree[], path: string): Tree | null {
  let result: Tree | null = null;
  for (const node of children) {
    if (node.name === path) {
      result = node;
      break;
    }
  }
  return result;
}
