<template>
  <ul class="tree-view">
    <li v-for="node in trees" :key="node.name">
      <span
        class="tree-name"
        :class="{ folder: node.children }"
        @click="onView(node)"
        >{{ node.name }}</span
      >
      <tree-view
        v-if="node.children && node.children.length !== 0"
        :trees="node.children"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { TreeModel } from "@/api/TreeModel";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TreeView extends Vue {
  @Prop({ type: Array, default: () => [] })
  private trees!: TreeModel[];

  private onView(treeModel: TreeModel) {
    log.debug("TreeView onView");
    eventBus.$emit(Bus.ContainerView.viewLoad, treeModel);
  }
}
</script>

<style scoped lang="scss">
.tree-view {
  padding-left: 0;
  position: relative;
  z-index: 200;
  height: 100%;

  li {
    padding-left: 10px;
    white-space: nowrap;
    overflow: hidden;

    .tree-name {
      cursor: pointer;
      color: $color-document-tree;
      margin-bottom: 8px;
      display: inline-block;

      &.folder {
        font-weight: bold;
      }
    }
  }
}

ul,
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
