import Vue from "vue";
import VueRouter, { RawLocation, Route } from "vue-router";
import { signIn } from "./Guard";
import { ElLoadingComponent } from "element-ui/types/loading";
import { COLOR_LOADING } from "@/data/color";
import { performance, Trace } from "@/plugins/firebase";

const Notebook = () =>
  import(/* webpackChunkName: "user" */ "@/components/Notebook.vue");
const MyNotebook = () =>
  import(/* webpackChunkName: "user" */ "@/components/MyNotebook.vue");
const Setting = () =>
  import(/* webpackChunkName: "user" */ "@/components/Setting.vue");
const NotebookSetting = () =>
  import(/* webpackChunkName: "user" */ "@/components/NotebookSetting.vue");
const Document = () =>
  import(/* webpackChunkName: "user" */ "@/components/Document.vue");
const Editor = () =>
  import(/* webpackChunkName: "editor" */ "@/components/Editor.vue");
const Export = () =>
  import(/* webpackChunkName: "export" */ "@/components/Export.vue");

Vue.use(VueRouter);

let loading: ElLoadingComponent | null = null;
let traceEditorLoad: Trace | null = null;

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
  Setting: {
    path: "/setting",
    name: "Setting",
    component: Setting,
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
    beforeEnter(to: Route, from: Route, next: (to?: RawLocation) => void) {
      traceEditorLoad = performance.trace("editorLoad");
      traceEditorLoad.start();
      loading = Vue.prototype.$loading({
        lock: true,
        background: COLOR_LOADING
      });
      signIn(to, from, next);
    }
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

router.afterEach((to, from) => {
  if (traceEditorLoad !== null) {
    traceEditorLoad.stop();
    traceEditorLoad = null;
  }
  if (loading !== null) {
    loading.close();
    loading = null;
  }
});

export default router;
