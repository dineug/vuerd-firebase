<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        설정
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";

@Component({
  components: {
    Sidebar
  }
})
export default class Setting extends Vue {}
</script>

<style scoped lang="scss"></style>
