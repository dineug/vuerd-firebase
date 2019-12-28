<template>
  <el-drawer :title="$t('newNotebook')" :visible.sync="drawer" size="700px">
    <new-notebook-form ref="newNotebook" @cancel="onDrawerEnd" />
  </el-drawer>
</template>

<script lang="ts">
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import NewNotebookForm from "@/components/NewNotebook/NewNotebookForm.vue";

@Component({
  components: {
    NewNotebookForm
  }
})
export default class NewNotebookDrawer extends Vue {
  private drawer: boolean = false;

  // ==================== Event Handler ===================
  private onDrawerStart() {
    this.drawer = true;
    const vm = this.$refs.newNotebook as any;
    if (vm) {
      vm.reset();
      setTimeout(() => {
        (vm.$refs.title as HTMLInputElement).focus();
      }, 100);
    }
  }

  private onDrawerEnd() {
    this.drawer = false;
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    eventBus.$on(Bus.NewNotebookDrawer.drawerStart, this.onDrawerStart);
    eventBus.$on(Bus.NewNotebookDrawer.drawerEnd, this.onDrawerEnd);
  }

  private destroyed() {
    eventBus.$off(Bus.NewNotebookDrawer.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.NewNotebookDrawer.drawerEnd, this.onDrawerEnd);
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
