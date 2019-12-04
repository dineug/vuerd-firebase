import { storage } from "@/plugins/firebase";
import store from "@/store";
import { uuid } from "@/ts/util";

const enum FileType {
  jpg = "image/jpeg",
  png = "image/png"
}

function getFileName(file: File): string {
  let ext = "";
  switch (file.type) {
    case FileType.jpg:
      ext = ".jpg";
      break;
    case FileType.png:
      ext = ".png";
      break;
  }
  return `${uuid()}${ext}`;
}

export async function upload(file: File): Promise<string> {
  if (!store.state.user) {
    throw new Error("not found uid");
  }
  const ref = storage.ref(`${store.state.user.uid}/${getFileName(file)}`);
  const snapshot = await ref.put(file);
  return snapshot.ref.getDownloadURL();
}
