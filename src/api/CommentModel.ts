import { DocumentSnapshot } from "@/plugins/firebase";

export interface Comment {
  uid: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  message: string;
  updatedAt: number;
  createdAt: number;
}

export interface CommentModel extends Comment {
  id: string;
}

export class CommentModelImpl implements CommentModel {
  public id: string;
  public uid: string;
  public name: string | null;
  public nickname: string | null;
  public email: string | null;
  public image: string | null;
  public message: string;
  public updatedAt: number;
  public createdAt: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as Comment;
    this.id = doc.id;
    this.uid = data.uid;
    this.name = data.name;
    this.nickname = data.nickname;
    this.email = data.email;
    this.image = data.image;
    this.message = data.message;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }
}
