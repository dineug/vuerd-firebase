import hljs from "highlight.js";
import marked from "marked";

marked.setOptions({
  highlight: function(code: string) {
    return hljs.highlightAuto(code).value;
  }
});
