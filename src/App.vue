<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import eventBus from "@/ts/EventBus";
import { unsubscribe } from "@/store";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  private destroyed() {
    eventBus.destroyed();
    if (unsubscribe !== null) {
      unsubscribe();
    }
  }
}
</script>

<style lang="scss">
body {
  font-family: "Noto Sans", "Noto Sans KR", "Noto Sans SC", "Noto Sans HK",
  "Noto Sans JP", "Noto Sans TC", sans-serif;

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
}
.app {
  .el-avatar {
    background-color: white;
  }

  .tag-box {
    & /deep/ .ti-tag,
    & /deep/ .ti-selected-item {
      background-color: $color-tag;
    }
    & /deep/ .duplication.ti-tag,
    & /deep/ .duplication.ti-selected-item {
      background-color: $color-tag-duplication;
      text-decoration: line-through;
    }
  }
}

.notification-popover {
  max-height: 200px;
  overflow-y: auto;
}
</style>
