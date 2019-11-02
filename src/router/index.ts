import Vue from "vue";
import VueRouter from "vue-router";
import Debug from "@/components/Debug.vue";
import Home from "@/components/Home.vue";
import SignIn from "@/components/SignIn.vue";
import Notebook from "@/components/Notebook.vue";
import Bookmark from "@/components/Bookmark.vue";

Vue.use(VueRouter);

export const enum RouterName {
  Home = "Home",
  SignIn = "SignIn",
  Notebook = "Notebook",
  Bookmark = "Bookmark"
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
    path: "/sign-in",
    name: RouterName.SignIn,
    component: SignIn
  },
  {
    path: "/notebook",
    name: RouterName.Notebook,
    component: Notebook
  },
  {
    path: "/bookmark",
    name: RouterName.Bookmark,
    component: Bookmark
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
