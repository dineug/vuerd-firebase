import Vue from "vue";
import VueRouter, { Route } from "vue-router";
import { signIn } from "./Guard";
const Notebook = () => import("@/components/Notebook.vue");
const MyNotebook = () => import("@/components/MyNotebook.vue");
const Editor = () => import("@/components/Editor.vue");
const Setting = () => import("@/components/Setting.vue");
const NotebookSetting = () => import("@/components/NotebookSetting.vue");
const Document = () => import("@/components/Document.vue");
const Export = () => import("@/components/Export.vue");

Vue.use(VueRouter);

export const routes = {
  Notebook: {
    path: "/",
    name: "Notebook",
    component: Notebook
  },
  MyNotebook: {
    path: "/notebooks/me",
    name: "MyNotebook",
    component: MyNotebook,
    beforeEnter: signIn
  },
  NotebookSetting: {
    path: "/notebooks/:id/setting",
    name: "NotebookSetting",
    component: NotebookSetting,
    beforeEnter: signIn
  },
  Document: {
    path: "/notebooks/:id/document",
    name: "Document",
    component: Document,
    props: (route: Route) => ({
      treeActiveId: route.query.active
    })
  },
  Editor: {
    path: "/notebooks/:id/editor",
    name: "Editor",
    component: Editor,
    beforeEnter: signIn
  },
  Setting: {
    path: "/setting",
    name: "Setting",
    component: Setting,
    beforeEnter: signIn
  },
  Export: {
    path: "/notebooks/:notebookId/export/:id",
    name: "Export",
    component: Export
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
