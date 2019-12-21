import hljs from "highlight.js";
import marked from "marked";

marked.setOptions({
  highlight: function(code: string, lang: string) {
    try {
      if (lang !== "") {
        return hljs.highlight(lang, code).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    } catch (e) {
      return hljs.highlightAuto(code).value;
    }
  }
});
