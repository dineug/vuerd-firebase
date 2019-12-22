<template>
  <el-drawer
    custom-class="export-iframe-drawer"
    title="Export iframe"
    :visible.sync="drawer"
    size="700px"
  >
    <el-form
      class="export-iframe-form"
      :style="exportIframeStyle"
      label-position="left"
      inline
    >
      <el-form-item v-for="tree in treeList" :key="tree.id" :label="tree.path">
        <div class="markdown-body" v-html="markdownToHtml(tree)" />
        <el-tooltip effect="dark" :content="$t('copy')" placement="left">
          <el-button
            class="export-iframe-copy-btn"
            type="info"
            size="medium"
            circle
            icon="el-icon-document-copy"
            @click="onIframeCopy(tree)"
          />
        </el-tooltip>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import eventBus, { Bus } from "@/ts/EventBus";
import { isEditor } from "@/api/TreeHelper";
import { TreeNodeModel } from "@/api/TreeModel";
import marked from "marked";
import { Component, Prop, Vue } from "vue-property-decorator";

const HEADER_HEIGHT = 45;

@Component
export default class ExportIframe extends Vue {
  @Prop({ type: Number, default: 1000 })
  private height!: number;

  private drawer: boolean = false;

  get treeList(): TreeNodeModel[] {
    const list = this.$store.state.treeList as TreeNodeModel[];
    return list.filter(tree => tree.value !== undefined && isEditor(tree.name));
  }

  get exportIframeStyle(): string {
    const height = this.height - HEADER_HEIGHT;
    return `
    padding: 0 20px;
    height: ${height}px;
    `;
  }

  private markdownToHtml(tree: TreeNodeModel): string {
    const value = `
    <iframe
      src="https://vuerd.io/notebooks/${this.$route.params.id}/export/${tree.id}"
      width="890"
      height="500"
      frameborder="0"
    ></iframe>
    `;
    return marked(value);
  }

  private onIframeCopy(tree: TreeNodeModel) {
    const textarea = document.createElement("textarea");
    textarea.value = `
    <iframe
      src="https://vuerd.io/notebooks/${this.$route.params.id}/export/${tree.id}"
      width="800"
      height="500"
      frameborder="0"
    ></iframe>
    `;
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 999);
    document.execCommand("copy");
    textarea.remove();
    this.$notify.success({
      title: "Success",
      message: this.$t("iframeCopy") as string,
      duration: 3000
    });
  }

  private onDrawerStart() {
    log.debug("ExportLink onDrawerStart");
    this.drawer = true;
  }

  private onDrawerEnd() {
    log.debug("ExportLink onDrawerEnd");
    this.drawer = false;
  }

  private created() {
    eventBus.$on(Bus.ExportIframe.drawerStart, this.onDrawerStart);
    eventBus.$on(Bus.ExportIframe.drawerEnd, this.onDrawerEnd);
  }

  private destroyed() {
    eventBus.$off(Bus.ExportIframe.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.ExportIframe.drawerEnd, this.onDrawerEnd);
  }
}
</script>

<style scoped lang="scss">
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  overflow: auto;
  background-color: white;

  & /deep/ pre {
    padding: 14px 16px;
    color: white;
    background-color: #23241f;
  }
}
</style>
