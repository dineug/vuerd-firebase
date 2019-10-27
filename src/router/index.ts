import Vue from "vue";
import VueRouter from "vue-router";
import Debug from "@/components/Debug.vue";
import Home from "@/components/Home.vue";

Vue.use(VueRouter);

export const enum RouterName {
  Home = "Home"
}

export const routes = [
  {
    path: "/",
    name: Debug.name,
    component: Debug
  },
  {
    path: "/home",
    name: RouterName.Home,
    component: Home
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
