import Vue from "vue";
import VuerdCore from "vuerd-core";
import ERD from "vuerd-plugin-erd";
import "vuerd-core/dist/vuerd-core.css";
import "vuerd-plugin-erd/dist/vuerd-plugin-erd.css";

VuerdCore.use(ERD);
Vue.use(VuerdCore);
