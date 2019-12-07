<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main>
        문서 보기
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
export default class Document extends Vue {}
</script>

<style scoped lang="scss"></style>
