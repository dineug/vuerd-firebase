import Vue from "vue";
import VueRouter, { RawLocation, Route } from "vue-router";
import { signIn } from "./Guard";
import { ElLoadingComponent } from "element-ui/types/loading";
import { COLOR_LOADING } from "@/data/color";

function loadView(view: string) {
  return () =>
    import(/* webpackChunkName: "[request]" */ `@/components/${view}.vue`);
}

Vue.use(VueRouter);

let loading: ElLoadingComponent | null = null;

export const routes = {
  Notebook: {
    path: "/",
    name: "Notebook",
    component: loadView("Notebook")
  },
  MyNotebook: {
    path: "/notebooks/me",
    name: "MyNotebook",
    component: loadView("MyNotebook"),
    beforeEnter: signIn
  },
  NotebookSetting: {
    path: "/notebooks/:id/setting",
    name: "NotebookSetting",
    component: loadView("NotebookSetting"),
    beforeEnter: signIn
  },
  Document: {
    path: "/notebooks/:id/document",
    name: "Document",
    component: loadView("Document"),
    props: (route: Route) => ({
      treeActiveId: route.query.active
    })
  },
  Editor: {
    path: "/notebooks/:id/editor",
    name: "Editor",
    component: loadView("Editor"),
    beforeEnter(to: Route, from: Route, next: (to?: RawLocation) => void) {
      loading = Vue.prototype.$loading({
        lock: true,
        background: COLOR_LOADING
      });
      signIn(to, from, next);
    }
  },
  Setting: {
    path: "/setting",
    name: "Setting",
    component: loadView("Setting"),
    beforeEnter: signIn
  },
  Export: {
    path: "/notebooks/:notebookId/export/:id",
    name: "Export",
    component: loadView("Export")
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
  if (loading !== null) {
    loading.close();
    loading = null;
  }
});

export default router;
