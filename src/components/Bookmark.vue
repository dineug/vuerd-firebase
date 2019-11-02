<template>
  <el-container>
    <ae-aside active="3" />
    <el-container>
      <el-main>Bookmark</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AeAside from "./common/VeAside.vue";

@Component({
  components: {
    AeAside
  }
})
export default class Bookmark extends Vue {}
</script>

<style scoped lang="scss"></style>
