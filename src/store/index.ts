import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";
import { TreeNodeModel } from "@/api/TreeAPI";

Vue.use(Vuex);

export interface State {
  user: User | null;
  referer: string;
  notebookId: string | null;
  treeList: TreeNodeModel[];
}

export const enum Commit {
  signIn = "signIn",
  signOut = "signOut",
  referer = "referer",
  setNotebookId = "setNotebookId",
  setTreeList = "setTreeList"
}

export default new Vuex.Store<State>({
  state: {
    user: null,
    referer: "/",
    notebookId: null,
    treeList: []
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
    },
    setTreeList(state: State, treeList: TreeNodeModel[]) {
      state.treeList = treeList;
    }
  },
  actions: {},
  modules: {}
});
