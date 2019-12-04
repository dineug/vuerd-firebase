import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";
import { TreeNodeModel } from "@/api/TreeAPI";
import { User as UserInfo, findUserBy } from "@/api/UserAPI";
import i18n from "@/plugins/vue-i18n";

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
  setTreeList = "setTreeList",
  setLocale = "setLocale"
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
      findUserBy().then(doc => {
        const info = doc.data() as UserInfo | undefined;
        if (info) {
          i18n.locale = info.language;
        }
      });
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
  actions: {}
});
