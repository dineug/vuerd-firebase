import Vue from "vue";
import VueRouter from "vue-router";
import { signIn } from "./Guard";
import Document from "@/components/Document.vue";
import Notebook from "@/components/Notebook.vue";
import Editor from "@/components/Editor.vue";
import Setting from "@/components/Setting.vue";

Vue.use(VueRouter);

export const routes = {
  Document: {
    path: "/",
    name: Document.name,
    component: Document
  },
  Notebook: {
    path: "/notebook",
    name: Notebook.name,
    component: Notebook,
    beforeEnter: signIn
  },
  Editor: {
    path: "/editor/:id",
    name: Editor.name,
    component: Editor,
    beforeEnter: signIn
  },
  Setting: {
    path: "/setting",
    name: Setting.name,
    component: Setting,
    beforeEnter: signIn
  },
  Redirect: {
    path: "*",
    redirect: "/"
  }
};

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: Object.values(routes)
});

export default router;
