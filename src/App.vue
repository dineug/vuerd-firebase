<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {}
</script>

<style lang="scss">
@import "~highlight.js/styles/monokai-sublime.css";
@import "~github-markdown-css";
@import "~vuerd-plugin-erd/dist/vuerd-plugin-erd.css";
@import "scss/popover.scss";
@import "scss/drawer.scss";

body {
  font-family: "Noto Sans", "Noto Sans JP", "Noto Sans KR", sans-serif;
  margin: 0;

  /* width */
  ::-webkit-scrollbar {
    width: $size-scrollbar;
    height: $size-scrollbar;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: $color-opacity;
  }

  ::-webkit-scrollbar-corner {
    background: $color-opacity;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: $color-scrollbar-thumb;
  }

  /* Handle : hover*/
  ::-webkit-scrollbar-thumb:hover {
    background: $color-scrollbar-thumb-active;
  }

  /* firefox */
  .scrollbar {
    scrollbar-color: $color-scrollbar-thumb $color-opacity;
    scrollbar-width: thin;
  }

  .el-avatar {
    background-color: white;
  }
}
.app {
  .tag-box .ti-tag,
  .tag-box .ti-selected-item {
    background-color: $color-tag;
  }

  .tag-box .duplication.ti-tag,
  .tag-box .duplication.ti-selected-item {
    background-color: $color-tag-duplication;
    text-decoration: line-through;
  }
}
</style>
