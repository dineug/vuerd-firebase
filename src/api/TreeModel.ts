import { DocumentSnapshot } from "@/plugins/firebase";

export interface TreeNode {
  path: string;
  name: string;
  value?: string;
  updatedAt: number;
  createdAt: number;
}

export interface TreeNodeModel extends TreeNode {
  id: string;
}

export class TreeNodeModelImpl implements TreeNodeModel {
  public id: string;
  public path: string;
  public name: string;
  public value?: string;
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as TreeNode;
    this.id = doc.id;
    this.path = data.path;
    this.name = data.name;
    this.value = data.value;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }
}

export interface Move {
  path: string;
  name: string;
}
