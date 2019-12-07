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
.app {
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
</style>
