<template>
  <div class="container-view" :style="contentViewStyle">
    <div v-for="editor in editors" :key="editor.id">
      <el-breadcrumb class="path" separator-class="el-icon-arrow-right">
        <el-breadcrumb-item
          v-for="pathName in editor.path.split('/')"
          :key="pathName"
        >
          <span class="path-name">{{ pathName }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <markdown
        v-if="editor.type === 'markdown'"
        :value="editor.value"
        :width="width"
      />
      <erd
        v-else-if="editor.type === 'vuerd'"
        :value="editor.value"
        :width="width"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { TreeModel, TreeNodeModel } from "@/api/TreeModel";
import { treeModelToTreeNodeModel } from "@/api/TreeHelper";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Markdown from "@/components/Document/ContainerView/Markdown.vue";
import Erd from "@/components/Document/ContainerView/ERD.vue";

type ViewType = "markdown" | "vuerd";

interface Editor extends TreeNodeModel {
  type: ViewType;
}

@Component({
  components: {
    Markdown,
    Erd
  }
})
export default class ContainerView extends Vue {
  @Prop({ type: Number, default: 1000 })
  private width!: number;
  @Prop({ type: Number, default: 1000 })
  private height!: number;
  @Prop({ type: Object, default: () => ({}) })
  private tree!: TreeModel | null;

  private editors: Editor[] = [];

  get contentViewStyle(): string {
    return `
    width: ${this.width}px;
    height: ${this.height}px;
    `;
  }

  @Watch("tree")
  private watchTree() {
    if (this.tree !== null) {
      const list = treeModelToTreeNodeModel(this.tree);
      this.editors = [];
      list.forEach(tree => {
        if (/\.md$/i.test(tree.name)) {
          const editor = tree as Editor;
          editor.type = "markdown";
          this.editors.push(editor);
        } else if (/\.vuerd$/i.test(tree.name)) {
          const editor = tree as Editor;
          editor.type = "vuerd";
          this.editors.push(editor);
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
.container-view {
  box-sizing: border-box;

  .path {
    padding: 20px;
    background-color: $color-view-header;

    .path-name {
      color: $color-view-header-text;
    }
  }
}
</style>
