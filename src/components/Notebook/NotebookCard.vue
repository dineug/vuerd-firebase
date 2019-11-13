<template>
  <el-card :body-style="{ padding: '0px' }" shadow="hover">
    <el-image class="card-image" :src="notebook.image" lazy />
    <div style="padding: 10px;">
      <span>{{ notebook.title }}</span>
      <div class="btn-box">
        <el-button icon="el-icon-view" circle />
        <el-button icon="el-icon-star-on" circle />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { NotebookModel } from "@/api/NotebookAPI";
import { Component, Prop, Vue } from "vue-property-decorator";

const IMAGE =
  "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png";

@Component
export default class NotebookCard extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private notebook!: NotebookModel;

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
}
</style>
