<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-header style="padding: 0; height: auto;">
        <nav-header />
      </el-header>
      <el-main>
        <el-page-header @back="onBack" title="" :content="$t('newNotebook')" />
        <new-notebook-form @cancel="onBack" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "@/components/common/Sidebar.vue";
import NavHeader from "@/components/common/NavHeader.vue";
import NewNotebookForm from "@/components/NewNotebook/NewNotebookForm.vue";

@Component({
  components: {
    Sidebar,
    NavHeader,
    NewNotebookForm
  }
})
export default class NewNotebook extends Vue {
  private onBack() {
    this.$router.back();
  }
}
</script>

<style scoped lang="scss"></style>
