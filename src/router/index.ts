import Vue from "vue";
import VueRouter from "vue-router";
import { signIn } from "./Guard";
import Debug from "@/components/Debug.vue";
import Home from "@/components/Home.vue";
import Notebook from "@/components/Notebook.vue";
import Editor from "@/components/Editor.vue";

Vue.use(VueRouter);

export const enum RouterName {
  Home = "Home",
  Notebook = "Notebook",
  Bookmark = "Bookmark",
  Editor = "Editor"
}

export const routes = [
  {
    path: "/",
    name: Debug.name,
    component: Debug
  },
  {
    path: "/home",
    // path: "/",
    name: RouterName.Home,
    component: Home
  },
  {
    path: "/notebook",
    name: RouterName.Notebook,
    component: Notebook,
    beforeEnter: signIn
  },
  {
    path: "/editor/:id",
    name: RouterName.Editor,
    component: Editor,
    beforeEnter: signIn
  },
  {
    path: "*",
    redirect: "/"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
