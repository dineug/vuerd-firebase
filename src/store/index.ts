import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";
import { TreeNodeModel } from "@/api/TreeModel";
import { User as UserInfo } from "@/api/UserModel";
import { getUsersDocRef, userSignIn } from "@/api/UserAPI";
import i18n from "@/plugins/vue-i18n";
import eventBus, { Bus } from "@/ts/EventBus";

Vue.use(Vuex);

export interface State {
  user: User | null;
  info: UserInfo | null;
  referer: string;
  notebookId: string | null;
  treeList: TreeNodeModel[];
  unsubscribe: { (): void; (): void } | null;
  treeActiveId: string | null;
}

export const enum Commit {
  signIn = "signIn",
  signOut = "signOut",
  referer = "referer",
  setNotebookId = "setNotebookId",
  setTreeList = "setTreeList",
  setTreeActiveId = "setTreeActiveId"
}

export default new Vuex.Store<State>({
  state: {
    user: null,
    info: null,
    referer: "/",
    notebookId: null,
    treeList: [],
    unsubscribe: null,
    treeActiveId: null
  },
  mutations: {
    signIn(state: State, user: User) {
      state.user = user;
      userSignIn();
      if (state.unsubscribe !== null) {
        state.unsubscribe();
        state.unsubscribe = null;
      }
      state.unsubscribe = getUsersDocRef(user.uid).onSnapshot(doc => {
        if (doc.exists) {
          const info = doc.data() as UserInfo;
          state.info = info;
          i18n.locale = info.language;
          eventBus.$emit(Bus.Setting.setInfo);
        }
      });
    },
    signOut(state: State) {
      if (state.unsubscribe !== null) {
        state.unsubscribe();
        state.unsubscribe = null;
      }
      state.user = null;
      state.info = null;
      state.notebookId = null;
      state.treeList = [];
    },
    referer(state: State, referer: string) {
      state.referer = referer;
    },
    setNotebookId(state: State, notebookId: string) {
      state.notebookId = notebookId;
    },
    setTreeList(state: State, treeList: TreeNodeModel[]) {
      state.treeList = treeList;
    },
    setTreeActiveId(state: State, treeActiveId: string | null) {
      state.treeActiveId = treeActiveId;
    }
  },
  actions: {}
});
