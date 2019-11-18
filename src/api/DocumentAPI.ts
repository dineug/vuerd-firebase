import { db, QuerySnapshot, QueryDocumentSnapshot } from "@/plugins/firebase";
import store from "@/store";
import moment from "moment";

export interface TreeNode {
  open?: boolean;
  value?: string;
  updatedAt: number;
  createdAt: number;
}

export interface TreeNodeModel extends TreeNode {
  path: string;
}

export class TreeNodeModelImpl implements TreeNodeModel {
  public path: string;
  public open: boolean;
  public value: string;
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: QueryDocumentSnapshot) {
    this.path = doc.id;
    const { open, value, updatedAt, createdAt } = doc.data();
    this.open = open;
    this.value = value;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}

export interface TreeNodeAdd {
  open?: boolean;
  value?: string;
}

export interface Tree {
  name: string;
  open?: boolean;
  children?: Tree[];
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

export function remove(notebookId: string, path: string): Promise<void> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  return db
    .collection("notebooks")
    .doc(notebookId)
    .collection("trees")
    .doc(path)
    .delete();
}
