<template>
  <vuerd-core :themeName="themeName" @changeTheme="onChangeTheme" />
</template>

<script lang="ts">
import { Commit } from "@/store";
import {
  saveConfigEditor,
  findByConfigEditor,
  Editor as ConfigEditor
} from "@/api/UserAPI";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Editor extends Vue {
  private themeName: string = "VSCode";

  private getConfigEditor() {
    findByConfigEditor().then(doc => {
      const editor = doc.data() as ConfigEditor;
      if (editor) {
        this.themeName = editor.themeName;
      } else {
        saveConfigEditor({
          themeName: "VSCode"
        });
      }
    });
  }

  private onChangeTheme(themeName: string) {
    saveConfigEditor({
      themeName
    });
  }

  private created() {
    this.$store.commit(Commit.layout, "editor");
    this.$nextTick(() => {
      window.dispatchEvent(new Event("resize"));
    });
    this.getConfigEditor();
  }
  private destroyed() {
    this.$store.commit(Commit.layout, "base");
  }
}
</script>

<style scoped lang="scss"></style>
