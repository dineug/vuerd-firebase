<template>
  <el-card
    class="notebook-card"
    :body-style="{ padding: '0px' }"
    shadow="hover"
  >
    <div class="image-box">
      <image-lazy v-if="notebook.image" :src="notebook.image" />
      <el-button-group class="btn-box">
        <el-button icon="el-icon-view" @click="onClick('document')" />
        <el-button v-if="edit" icon="el-icon-edit" @click="onClick('editor')" />
        <el-button
          v-if="edit"
          icon="el-icon-s-tools"
          @click="onClick('setting')"
        />
      </el-button-group>
    </div>
    <div style="padding: 10px;">
      <div>
        <span>{{ notebook.title }}</span>
      </div>
      <div class="tag-box">
        <el-tag v-for="tag in notebook.tags" :key="tag">{{ tag }}</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { NotebookModel } from "@/api/NotebookAPI";
import { Component, Prop, Vue } from "vue-property-decorator";
import ImageLazy from "@/components/Notebook/ImageLazy.vue";

const enum Action {
  document = "document",
  editor = "editor",
  setting = "setting"
}

const IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8cOTMfwAH7QNRoi5FXwAAAABJRU5ErkJggg==";

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

  private onClick(action: Action) {
    this.$emit(action, this.notebook);
  }

  private created() {
    if (!this.notebook.image) {
      this.notebook.image = IMAGE;
    }
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

  .tag-box {
    .el-tag {
      color: white;
      background-color: $color-tag;
      border: none;
      margin: 2px;
    }
  }
}
</style>
