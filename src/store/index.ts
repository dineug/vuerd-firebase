import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";

Vue.use(Vuex);

export interface State {
  user: User | null;
}

export const enum Commit {
  signIn = "signIn",
  signOut = "signOut"
}

export default new Vuex.Store<State>({
  state: {
    user: null
  },
  mutations: {
    signIn(state: State, user: User) {
      state.user = user;
    },
    signOut(state: State) {
      state.user = null;
    }
  },
  actions: {},
  modules: {}
});
