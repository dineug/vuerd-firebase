<template>
  <el-container>
    <el-main class="main">
      <div class="card" v-for="notebook in notebooks" :key="notebook.id">
        <notebook-card :notebook="notebook" />
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { list, NotebookModel, add } from "@/api/NotebookAPI";
import { Paging } from "@/plugins/firebase";
import { Component, Prop, Vue } from "vue-property-decorator";
import NotebookCard from "./Notebook/NotebookCard.vue";

@Component({
  components: {
    NotebookCard
  }
})
export default class Home extends Vue {
  private notebooks: NotebookModel[] = [];
  private paging: Paging | null = {
    last: null
  };
  private listProcess: boolean = false;

  private getNotebooks() {
    if (!this.listProcess && this.paging) {
      this.listProcess = true;
      list(this.paging)
        .then(querySnapshot => {
          const len = querySnapshot.docs.length;
          if (len === 0) {
            this.paging = null;
          } else if (this.paging) {
            this.paging.last = querySnapshot.docs[len - 1];
            querySnapshot.forEach(doc => {
              const data = doc.data() as NotebookModel;
              data.id = doc.id;
              this.notebooks.push(data);
            });
          }
        })
        .finally(() => (this.listProcess = false));
    }
  }

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

<style scoped lang="scss">
.main {
  text-align: center;

  .card {
    width: $size-card-width;
    display: inline-block;
    padding: 6px;
  }
}
</style>
