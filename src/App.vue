<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import eventBus from "@/ts/EventBus";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  private destroyed() {
    eventBus.destroyed();
  }
}
</script>

<style lang="scss">
.app {
  font-family: "Noto Sans", "Noto Sans KR", "Noto Sans SC", "Noto Sans HK",
    "Noto Sans JP", "Noto Sans TC", sans-serif;
}
</style>
