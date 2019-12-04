import Vue from "vue";
import VueRouter from "vue-router";
import { signIn } from "./Guard";
import Notebook from "@/components/Notebook.vue";
import MyNotebook from "@/components/MyNotebook.vue";
import Editor from "@/components/Editor.vue";
import Setting from "@/components/Setting.vue";

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
