<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main>
        <notebook-card
          v-for="notebook in notebooks"
          :key="notebook.id"
          :notebook="notebook"
          @document="onDocument"
          @editor="onEditor"
          @setting="onSetting"
        />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import {
  findByPaging,
  NotebookModel,
  NotebookModelImpl
} from "@/api/NotebookAPI";
import { Paging } from "@/plugins/firebase";
import { routes } from "@/router";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import NotebookCard from "./Notebook/NotebookCard.vue";

@Component({
  components: {
    Sidebar,
    NotebookCard
  }
})
export default class Notebook extends Vue {
  private notebooks: NotebookModel[] = [];
  private paging: Paging | null = {
    last: null
  };
  private listProcess: boolean = false;

  private getNotebooks() {
    if (!this.listProcess && this.paging) {
      this.listProcess = true;
      findByPaging(this.paging)
        .then(querySnapshot => {
          const len = querySnapshot.docs.length;
          if (len === 0) {
            this.paging = null;
          } else if (this.paging) {
            this.paging.last = querySnapshot.docs[len - 1];
            querySnapshot.forEach(doc =>
              this.notebooks.push(new NotebookModelImpl(doc))
            );
          }
        })
        .catch(err => this.$message.error(err.message))
        .finally(() => (this.listProcess = false));
    }
  }

  private onDocument(notebook: NotebookModel) {}

  private onEditor(notebook: NotebookModel) {
    this.$router.push({
      name: routes.Editor.name,
      params: {
        id: notebook.id
      }
    });
  }

  private onSetting(notebook: NotebookModel) {}

  private onScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const innerHeight = window.innerHeight;
    const currentScroll = scrollTop + innerHeight;
    if (currentScroll + 400 >= scrollHeight) {
      this.getNotebooks();
    }
  }

  private created() {
    this.getNotebooks();
    window.addEventListener("scroll", this.onScroll);
  }

  private destroyed() {
    window.removeEventListener("scroll", this.onScroll);
  }
}
</script>

<style scoped lang="scss"></style>
