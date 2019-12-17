import { DocumentSnapshot } from "@/plugins/firebase";

export type Role = "owner" | "writer" | "reader";
export type Status = "invitation" | "accept";

export interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  updatedAt: number;
  createdAt: number;
}

export interface NotebookAdd {
  published: boolean;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
}

export interface NotebookModel extends Notebook {
  id: string;
}

export class NotebookModelImpl implements NotebookModel {
  public id: string;
  public roles: { [key: string]: Role };
  public members: string[];
  public published: boolean;
  public title: string;
  public description: string;
  public image: string | null;
  public tags: string[];
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as Notebook;
    this.id = doc.id;
    this.roles = data.roles;
    this.members = data.members;
    this.published = data.published;
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.tags = data.tags;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }
}

export interface Member {
  fromId: string;
  uid: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  status: Status;
  createdAt: number;
}

export interface MemberAdd {
  id: string;
  uid: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
}

export interface MemberModel extends Member {
  id: string;
}

export class MemberModelImpl implements MemberModel {
  public id: string;
  public uid: string;
  public fromId: string;
  public name: string | null;
  public nickname: string | null;
  public email: string | null;
  public image: string | null;
  public role: Role;
  public status: Status;
  public createdAt: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as Member;
    this.id = doc.id;
    this.uid = data.uid;
    this.fromId = data.fromId;
    this.name = data.name;
    this.nickname = data.nickname;
    this.email = data.email;
    this.image = data.image;
    this.role = data.role;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}

export interface Heart {
  createdAt: number;
}
