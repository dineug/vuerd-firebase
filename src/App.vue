<template>
  <el-container>
    <ve-aside v-if="aside" />
    <router-view />
  </el-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import VeAside from "./components/common/VeAside.vue";

@Component({
  components: {
    VeAside
  }
})
export default class App extends Vue {
  private aside: boolean = true;
}
</script>

<style lang="scss"></style>
