import Vue from "vue";
import VuerdCore from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import TuiEditor from "vuerd-plugin-tui.editor";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-erd/dist/vuerd-plugin-erd.css";
import "vuerd-plugin-tui.editor/dist/vuerd-plugin-tui.editor.css";

VuerdCore.use(ERD);
VuerdCore.use(TuiEditor);
Vue.use(VuerdCore);
