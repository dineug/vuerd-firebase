import Vue from "vue";
import VueRouter from "vue-router";
import { signIn } from "./Guard";
import Home from "@/components/Home.vue";
import Notebook from "@/components/Notebook.vue";
import Editor from "@/components/Editor.vue";

Vue.use(VueRouter);

export const routes = {
  Home: {
    path: "/",
    name: Home.name,
    component: Home
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
