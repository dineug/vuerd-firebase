<template>
  <el-container class="app">
    <sidebar v-if="aside" />
    <router-view />
  </el-container>
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
  private aside: boolean = true;
}
</script>

<style lang="scss">
.app {
  font-family: "Noto Sans", "Noto Sans KR", "Noto Sans SC", "Noto Sans HK",
    "Noto Sans JP", "Noto Sans TC", sans-serif;
}
</style>
