<template>
  <el-drawer title="New Notebook" :visible.sync="drawer" size="50%">
    <el-form style="padding: 0 20px;" label-width="90px">
      <el-form-item label="Title">
        <el-input
          v-model="title"
          placeholder="Notebook Title"
          clearable
          maxlength="100"
          show-word-limit
          ref="title"
        />
      </el-form-item>
      <el-form-item label="Published">
        <el-switch v-model="published" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCreate">Create</el-button>
        <el-button @click="onDrawerEnd">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import eventBus, { Bus } from "@/ts/EventBus";
import { add } from "@/api/NotebookAPI";
import { routes } from "@/router";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

@Component
export default class NewNotebook extends Vue {
  private drawer: boolean = false;

  private title: string = "";
  private published: boolean = false;

  private reset() {
    this.title = "";
    this.published = false;
  }

  private valid(): boolean {
    let result = false;
    if (this.title.trim() === "") {
      this.$message.warning("Please enter a title");
      (this.$refs.title as HTMLInputElement).focus();
    } else {
      result = true;
    }
    return result;
  }

  private onCreate() {
    if (this.valid()) {
      const loading = this.$loading({
        lock: true,
        text: "Creating",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      add({
        title: this.title,
        published: this.published
      })
        .then(docRef => {
          this.$router.push({
            name: routes.Editor.name,
            params: {
              id: docRef.id
            }
          });
        })
        .catch(err => this.$message.error(err.message))
        .finally(() => loading.close());
    }
  }

  private onDrawerStart() {
    this.reset();
    this.drawer = true;
  }

  private onDrawerEnd() {
    this.drawer = false;
  }

  private created() {
    eventBus.$on(Bus.NewNotebook.drawerStart, this.onDrawerStart);
    eventBus.$on(Bus.NewNotebook.drawerEnd, this.onDrawerEnd);
  }

  private destroyed() {
    eventBus.$off(Bus.NewNotebook.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.NewNotebook.drawerEnd, this.onDrawerEnd);
  }
}
</script>

<style scoped lang="scss"></style>
