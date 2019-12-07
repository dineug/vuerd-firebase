<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        <notebook-info />
        <notebook-member />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import NotebookInfo from "@/components/NotebookSetting/NotebookInfo.vue";
import NotebookMember from "@/components/NotebookSetting/NotebookMember.vue";

@Component({
  components: {
    Sidebar,
    NotebookInfo,
    NotebookMember
  }
})
export default class NotebookSetting extends Vue {}
</script>

<style scoped lang="scss">
.main {
  height: 100vh;
}
</style>
