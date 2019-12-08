<template>
  <vuerd-core v-if="load" :themeName="themeName" @changeTheme="onChangeTheme" />
</template>

<script lang="ts">
import { Editor as ConfigEditor } from "@/api/UserModel";
import { editorSave, findEditorBy } from "@/api/UserAPI";
import log from "@/ts/Logger";
import { Commit } from "@/store";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Editor extends Vue {
  private themeName: string = "VSCode";
  private load: boolean = true;

  private getConfigEditor() {
    findEditorBy().then(doc => {
      if (doc.exists) {
        const editor = doc.data() as ConfigEditor;
        this.themeName = editor.themeName;
      }
    });
  }

  private onChangeTheme(themeName: string) {
    editorSave({ themeName });
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
    this.getConfigEditor();
    eventBus.$on(Bus.Editor.reload, this.onReload);
  }

  private destroyed() {
    log.debug("Editor destroyed");
    this.$store.commit(Commit.setTreeList, []);
    eventBus.$off(Bus.Editor.reload, this.onReload);
  }
}
</script>

<style scoped lang="scss"></style>
