<template>
  <vuerd-core :themeName="themeName" @changeTheme="onChangeTheme" />
</template>

<script lang="ts">
import {
  saveEditor,
  findEditorBy,
  Editor as ConfigEditor
} from "@/api/UserAPI";
import log from "@/ts/Logger";
import { Commit } from "@/store";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Editor extends Vue {
  private themeName: string = "VSCode";

  private getConfigEditor() {
    findEditorBy().then(doc => {
      const editor = doc.data() as ConfigEditor;
      if (editor) {
        this.themeName = editor.themeName;
      } else {
        saveEditor({
          themeName: "VSCode"
        });
      }
    });
  }

  private onChangeTheme(themeName: string) {
    saveEditor({ themeName });
  }

  private created() {
    log.debug(`Editor created: ${this.$route.params.id}`);
    this.$store.commit(Commit.setNotebookId, this.$route.params.id);
    this.getConfigEditor();
  }
}
</script>

<style scoped lang="scss"></style>
