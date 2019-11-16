<template>
  <el-card :body-style="{ padding: '0px' }" shadow="hover">
    <el-image class="card-image" :src="notebook.image" lazy />
    <div style="padding: 10px;">
      <span>{{ notebook.title }}</span>
      <div class="btn-box">
        <el-button icon="el-icon-star-on" circle @click="onClick('bookmark')" />
        <el-button icon="el-icon-view" circle @click="onClick('document')" />
        <el-button
          v-if="edit"
          icon="el-icon-edit"
          circle
          @click="onClick('editor')"
        />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { NotebookModel } from "@/api/NotebookAPI";
import { Component, Prop, Vue } from "vue-property-decorator";

const IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO89B8AAqkB05ycXjIAAAAASUVORK5CYII=";

const enum Action {
  bookmark = "bookmark",
  document = "document",
  editor = "editor"
}

@Component
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
.card-image {
  width: 100%;
  margin-bottom: 5px;
}
.btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}
</style>
