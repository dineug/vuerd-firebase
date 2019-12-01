<template>
  <el-card :body-style="{ padding: '0px' }" shadow="hover">
    <image-lazy :src="notebook.image" />
    <div style="padding: 10px;">
      <span>{{ notebook.title }}</span>
      <div class="btn-box">
        <el-button icon="el-icon-view" circle @click="onClick('document')" />
        <el-button
          v-if="edit"
          icon="el-icon-edit"
          circle
          @click="onClick('editor')"
        />
        <el-button
          v-if="edit"
          icon="el-icon-s-tools"
          circle
          @click="onClick('setting')"
        />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { NotebookModel } from "@/api/NotebookAPI";
import { Component, Prop, Vue } from "vue-property-decorator";
import ImageLazy from "@/components/common/ImageLazy.vue";

const enum Action {
  document = "document",
  editor = "editor",
  setting = "setting"
}

const IMAGE = require("@/assets/images/milky-way-3602131_1920.jpg");

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
.btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}
</style>
