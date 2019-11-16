import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";

Vue.use(Vuex);

export interface State {
  user: User | null;
  layout: Layout;
}

export type Layout = "base" | "editor";

export const enum Commit {
  signIn = "signIn",
  signOut = "signOut",
  layout = "layout"
}

export default new Vuex.Store<State>({
  state: {
    user: null,
    layout: "base"
  },
  mutations: {
    signIn(state: State, user: User) {
      state.user = user;
    },
    signOut(state: State) {
      state.user = null;
    },
    layout(state: State, layout: Layout) {
      state.layout = layout;
    }
  },
  actions: {},
  modules: {}
});
