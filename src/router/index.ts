import Vue from "vue";
import VueRouter, { Route } from "vue-router";
import { signIn } from "./Guard";
const Notebook = () => import("@/components/Notebook.vue");
const MyNotebook = () => import("@/components/MyNotebook.vue");
const Editor = () => import("@/components/Editor.vue");
const Setting = () => import("@/components/Setting.vue");
const NotebookSetting = () => import("@/components/NotebookSetting.vue");
const Document = () => import("@/components/Document.vue");

Vue.use(VueRouter);

export const routes = {
  Notebook: {
    path: "/",
    name: Notebook.name,
    component: Notebook
  },
  MyNotebook: {
    path: "/notebooks/me",
    name: MyNotebook.name,
    component: MyNotebook,
    beforeEnter: signIn
  },
  NotebookSetting: {
    path: "/notebooks/:id/setting",
    name: NotebookSetting.name,
    component: NotebookSetting,
    beforeEnter: signIn
  },
  Document: {
    path: "/notebooks/:id/document",
    name: Document.name,
    component: Document,
    props: (route: Route) => ({
      treeActiveId: route.query.active
    })
  },
  Editor: {
    path: "/notebooks/:id/editor",
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
