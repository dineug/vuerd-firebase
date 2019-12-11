<template>
  <div class="container-view" :style="contentViewStyle">
    <markdown
      v-for="(markdown, i) in markdownList"
      :key="`markdown-${i}`"
      :value="markdown"
      :width="width"
    />
  </div>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { TreeModel, TreeNodeModel } from "@/api/TreeModel";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";
import Markdown from "@/components/Document/ContainerView/Markdown.vue";

@Component({
  components: {
    Markdown
  }
})
export default class ContainerView extends Vue {
  @Prop({ type: Number, default: 1000 })
  private width!: number;
  @Prop({ type: Number, default: 1000 })
  private height!: number;
  @Prop({ type: Array, default: () => [] })
  private treeList!: TreeNodeModel[];

  get contentViewStyle(): string {
    return `
    width: ${this.width}px;
    height: ${this.height}px;
    `;
  }

  get markdownList(): string[] {
    log.debug(this.treeList.length);
    const markdownList: string[] = [];
    this.treeList.forEach(tree => {
      if (/\.(md)$/i.test(tree.name)) {
        if (tree.value) {
          markdownList.push(tree.value);
        }
      }
    });
    return markdownList;
  }

  private onViewLoad(treeModel: TreeModel) {
    log.debug("Container onViewLoad", treeModel);
  }

  private created() {
    eventBus.$on(Bus.ContainerView.viewLoad, this.onViewLoad);
  }

  private destroyed() {
    eventBus.$off(Bus.ContainerView.viewLoad, this.onViewLoad);
  }
}
</script>

<style scoped lang="scss">
.container-view {
  background-color: white;
  box-sizing: border-box;
  padding: 20px;
}
</style>
