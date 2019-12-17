import { db, QuerySnapshot, CollectionReference } from "@/plugins/firebase";

export function getTagsColRef(): CollectionReference {
  return db.collection("tags");
}

export function tagAutocomplete(keyword: string): Promise<QuerySnapshot> {
  return getTagsColRef()
    .where("name", ">=", keyword)
    .limit(6)
    .get();
}
