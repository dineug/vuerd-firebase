<template>
  <ul class="tree-view">
    <li v-for="node in trees" :key="node.id">
      <span
        class="tree-name"
        :class="{ folder: node.children, active: active(node.id) }"
        @click="onActive(node)"
      >
        {{ node.name }}
      </span>
      <tree-view
        v-if="node.children && node.children.length !== 0"
        :trees="node.children"
        :preview="preview"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { TreeModel } from "@/api/TreeModel";
import { routes } from "@/router";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "TreeView"
})
export default class TreeView extends Vue {
  @Prop({ type: Array, default: () => [] })
  private trees!: TreeModel[];
  @Prop({ type: Boolean, default: false })
  private preview!: boolean;

  private onActive(treeModel: TreeModel) {
    log.debug("TreeView onActive");
    if (this.$route.query.active !== treeModel.id) {
      if (this.preview) {
        this.$router.push({
          name: routes.DocumentPreview.name,
          params: {
            id: this.$route.params.id
          },
          query: {
            active: treeModel.id
          }
        });
      } else {
        this.$router.push({
          name: routes.Document.name,
          params: {
            id: this.$route.params.id
          },
          query: {
            active: treeModel.id
          }
        });
      }
    }
  }

  private active(id: string): boolean {
    return this.$store.state.treeActiveId === id;
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

      &.active {
        color: $color-sidebar-active;
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
