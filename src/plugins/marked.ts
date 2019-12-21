import hljs from "highlight.js";
import marked from "marked";

marked.setOptions({
  highlight: function(code: string, lang: string) {
    try {
      return hljs.highlight(lang, code).value;
    } catch (e) {
      return hljs.highlightAuto(code).value;
    }
  }
});
