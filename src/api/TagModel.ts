import { DocumentSnapshot } from "@/plugins/firebase";

export interface Tag {
  name: string;
  count: number;
}

export interface TagModel extends Tag {
  id: string;
}

export class TagModelImpl implements TagModel {
  public id: string;
  public name: string;
  public count: number;

  constructor(doc: DocumentSnapshot) {
    const data = doc.data() as Tag;
    this.id = doc.id;
    this.name = data.name;
    this.count = data.count;
  }
}
