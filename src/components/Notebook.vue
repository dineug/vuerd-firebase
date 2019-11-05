<template>
  <el-container>
    <ve-aside active="2" />
    <el-container>
      <el-main>Notebook</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VeAside from "./common/VeAside.vue";

@Component({
  components: {
    VeAside
  }
})
export default class Notebook extends Vue {}
</script>

<style scoped lang="scss"></style>
