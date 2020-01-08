<template>
  <div class="explorer" :style="explorerStyle">
    <el-input
      class="explorer-search"
      placeholder="search"
      prefix-icon="el-icon-search"
      clearable
      :value="search"
      @input="onInput"
    />
    <div class="explorer-tree scrollbar" :style="explorerTreeStyle">
      <tree-view :trees="trees" :preview="preview" />
    </div>
  </div>
</template>

<script lang="ts">
import { TreeModel } from "@/api/TreeModel";
import { Component, Prop, Vue } from "vue-property-decorator";
import TreeView from "@/components/Document/TreeView.vue";

const MARGIN = 100;

@Component({
  components: {
    TreeView
  }
})
export default class Explorer extends Vue {
  @Prop({ type: Number, default: 200 })
  private width!: number;
  @Prop({ type: Number, default: 1000 })
  private height!: number;
  @Prop({ type: Array, default: () => [] })
  private trees!: TreeModel[];
  @Prop({ type: String, default: "" })
  private search!: string;
  @Prop({ type: Boolean, default: false })
  private preview!: boolean;

  get explorerStyle(): string {
    return `
    width: ${this.width}px;
    `;
  }

  get explorerTreeStyle(): string {
    return `
    height: ${this.height - MARGIN}px;
    `;
  }

  private onInput(keyword: string) {
    this.$emit("changeSearch", keyword);
  }
}
</script>

<style scoped lang="scss">
.explorer {
  height: 100%;
  position: absolute;
  display: inline-block;
  padding: 20px;
  box-sizing: border-box;

  .explorer-search {
    margin-bottom: 20px;
  }

  .explorer-tree {
    overflow-y: auto;
  }
}
</style>
