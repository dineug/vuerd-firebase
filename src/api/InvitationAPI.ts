import { db, QuerySnapshot, CollectionReference } from "@/plugins/firebase";

export function getInvitationColRef(): CollectionReference {
  return db.collection("invitation");
}

export function autocomplete(keyword: string): Promise<QuerySnapshot> {
  return getInvitationColRef()
    .where("email", ">=", keyword)
    .limit(6)
    .get();
}

export interface Member {
  id?: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
}
