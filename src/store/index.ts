import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";

Vue.use(Vuex);

export interface State {
  user: User | null;
  referer: string;
  notebookId: string | null;
}

export type Layout = "base" | "editor";

export const enum Commit {
  signIn = "signIn",
  signOut = "signOut",
  referer = "referer",
  setNotebookId = "setNotebookId"
}

export default new Vuex.Store<State>({
  state: {
    user: null,
    referer: "/",
    notebookId: null
  },
  mutations: {
    signIn(state: State, user: User) {
      state.user = user;
    },
    signOut(state: State) {
      state.user = null;
    },
    referer(state: State, referer: string) {
      state.referer = referer;
    },
    setNotebookId(state: State, notebookId: string) {
      state.notebookId = notebookId;
    }
  },
  actions: {},
  modules: {}
});
