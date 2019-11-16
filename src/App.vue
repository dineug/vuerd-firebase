<template>
  <div class="app">
    <el-container :class="{ 'workspace-editor': layout === 'editor' }">
      <sidebar v-if="layout === 'base'" />
      <router-view />
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Sidebar from "./components/common/Sidebar.vue";

@Component({
  components: {
    Sidebar
  }
})
export default class App extends Vue {
  get layout(): string {
    return this.$store.state.layout;
  }
}
</script>

<style lang="scss">
.app {
  font-family: "Noto Sans", "Noto Sans KR", "Noto Sans SC", "Noto Sans HK",
    "Noto Sans JP", "Noto Sans TC", sans-serif;

  .workspace-editor {
    display: block;
  }
}
</style>
