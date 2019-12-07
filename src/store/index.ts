import Vue from "vue";
import Vuex from "vuex";
import { User } from "@/plugins/firebase";
import { TreeNodeModel } from "@/api/TreeAPI";
import { User as UserInfo, getUsersDocRef, signIn } from "@/api/UserAPI";
import i18n from "@/plugins/vue-i18n";
import eventBus, { Bus } from "@/ts/EventBus";

Vue.use(Vuex);

export interface State {
  user: User | null;
  info: UserInfo | null;
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

export let unsubscribe: { (): void; (): void } | null = null;

export default new Vuex.Store<State>({
  state: {
    user: null,
    info: null,
    referer: "/",
    notebookId: null,
    treeList: []
  },
  mutations: {
    signIn(state: State, user: User) {
      state.user = user;
      signIn();
      unsubscribe = getUsersDocRef(user.uid).onSnapshot(doc => {
        const info = doc.data() as UserInfo | undefined;
        if (info) {
          state.info = info;
          i18n.locale = info.language;
          eventBus.$emit(Bus.Setting.setInfo);
        }
      });
    },
    signOut(state: State) {
      if (unsubscribe !== null) {
        unsubscribe();
        unsubscribe = null;
      }
      state.user = null;
      state.info = null;
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
