import { DocumentSnapshot, Paging } from "@/plugins/firebase";

export type Action = "invitation" | "notification" | "comment";

export interface NotificationPaging extends Paging {
  read?: boolean;
}

export interface Notification {
  message: string;
  action: Action;
  read: boolean;
  key: string | null;
  createdAt: number;
}

export interface NotificationModel extends Notification {
  id: string;
}

export class NotificationModelImpl implements NotificationModel {
  public id: string;
  public message: string;
  public action: Action;
  public read: boolean;
  public key: string | null;
  public createdAt: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as Notification;
    this.id = doc.id;
    this.message = data.message;
    this.action = data.action;
    this.read = data.read;
    this.key = data.key;
    this.createdAt = data.createdAt;
  }
}
