<template>
  <el-card class="notebook-card" :body-style="{ padding: '0px' }">
    <div class="image-box">
      <image-lazy v-if="notebook.image" :src="notebook.image" />
      <el-button-group class="btn-box">
        <el-button icon="el-icon-view" @click="onClick('document')" />
        <el-button v-if="edit" icon="el-icon-edit" @click="onClick('editor')" />
        <el-button
          v-if="setting"
          icon="el-icon-s-tools"
          @click="onClick('setting')"
        />
      </el-button-group>
    </div>
    <div class="content-box scrollbar" :style="contentBoxStyle">
      <div class="title-box">{{ notebook.title }}</div>
      <div class="tag-box">
        <el-tag v-for="tag in notebook.tags" :key="tag">{{ tag }}</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { NotebookModel } from "@/api/NotebookModel";
import { Component, Prop, Vue } from "vue-property-decorator";
import ImageLazy from "@/components/Notebook/ImageLazy.vue";

const enum Action {
  document = "document",
  editor = "editor",
  setting = "setting"
}

const CARD_HEIGHT = 400;
const IMAGE_HEIGHT = 225;
const BUTTON_HEIGHT = 40;
const CONTENT_HEIGHT = CARD_HEIGHT - IMAGE_HEIGHT;

@Component({
  components: {
    ImageLazy
  }
})
export default class NotebookCard extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private notebook!: NotebookModel;

  get edit(): boolean {
    let result = false;
    if (this.$store.state.user !== null) {
      const role = this.notebook.roles[this.$store.state.user.uid];
      if (role === "owner" || role === "writer") {
        result = true;
      }
    }
    return result;
  }

  get setting(): boolean {
    let result = false;
    if (this.$store.state.user !== null) {
      result = !!this.notebook.roles[this.$store.state.user.uid];
    }
    return result;
  }

  get contentBoxStyle(): string {
    if (this.notebook.image) {
      return `height: ${CONTENT_HEIGHT}px;`;
    }
    return `height: ${CARD_HEIGHT - BUTTON_HEIGHT}px;`;
  }

  private onClick(action: Action) {
    this.$emit(action, this.notebook);
  }
}
</script>

<style scoped lang="scss">
.notebook-card {
  width: $size-card-width;
  height: 400px;
  display: inline-block;
  margin: 6px;
  overflow: hidden;

  .image-box {
    position: relative;
    min-height: 40px;

    .btn-box {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }

  .content-box {
    box-sizing: border-box;
    padding: 10px;
    overflow-y: scroll;

    .title-box {
      word-wrap: break-word;
    }

    .tag-box {
      .el-tag {
        color: white;
        background-color: $color-tag;
        border: none;
        margin: 2px;
      }
    }
  }
}
</style>
