<template>
  <vuerd-core v-if="load" :themeName="themeName" @changeTheme="onChangeTheme" />
</template>

<script lang="ts">
import "@/plugins/vuerd-core";
import { Editor as ConfigEditor } from "@/api/UserModel";
import { editorModify, editorDetail } from "@/api/UserAPI";
import { getTreesColRef } from "@/api/TreeAPI";
import { TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import log from "@/ts/Logger";
import { Commit } from "@/store";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Editor extends Vue {
  private themeName: string = "VSCode";
  private load: boolean = true;
  private unsubscribe: { (): void; (): void } | null = null;

  private getConfigEditor() {
    editorDetail().then(doc => {
      if (doc.exists) {
        const editor = doc.data() as ConfigEditor;
        this.themeName = editor.themeName;
      }
    });
  }

  private getTrees() {
    this.unsubscribe = getTreesColRef(this.$route.params.id).onSnapshot(
      snapshot => {
        const treeList: TreeNodeModel[] = [];
        snapshot.forEach(doc => {
          treeList.push(new TreeNodeModelImpl(doc));
        });
        this.$store.commit(Commit.setTreeList, treeList);
      },
      err => {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
        this.$router.back();
      }
    );
  }

  private onChangeTheme(themeName: string) {
    editorModify({ themeName });
  }

  private onReload() {
    this.load = false;
    this.$nextTick(() => {
      this.load = true;
    });
  }

  private created() {
    log.debug("Editor created", this.$route.params.id);
    this.$store.commit(Commit.setNotebookId, this.$route.params.id);
    this.getTrees();
    this.getConfigEditor();
    eventBus.$on(Bus.Editor.reload, this.onReload);
  }

  private destroyed() {
    log.debug("Editor destroyed");
    this.$store.commit(Commit.setTreeList, []);
    eventBus.$off(Bus.Editor.reload, this.onReload);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
</script>

<style scoped lang="scss"></style>
