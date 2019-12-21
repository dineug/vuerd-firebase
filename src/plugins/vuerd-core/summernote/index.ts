import Summernote from "./Summernote.vue";
import { Command, Editor } from "vuerd-core";
import { Option } from "./types";

export default {
  install(command: Command, option?: Option) {
    const editor: Editor = {
      component: Summernote,
      scope: ["rich"]
    };
    if (option) {
      if (typeof option.imageUpload === "function") {
        Summernote.prototype.imageUpload = option.imageUpload;
      }
      if (option.scope !== undefined) {
        editor.scope = option.scope;
      }
      if (option.exclude !== undefined) {
        editor.exclude = option.exclude;
      }
    }
    command.editorAdd(editor);
  }
};
