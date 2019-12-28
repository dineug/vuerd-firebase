<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-header style="padding: 0; height: auto;">
        <nav-header />
      </el-header>
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
import { NotebookModel, NotebookModelImpl } from "@/api/NotebookModel";
import { myNotebookPaging } from "@/api/NotebookAPI";
import { Paging } from "@/plugins/firebase";
import { routes } from "@/router";
import { Commit } from "@/store";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "@/components/common/Sidebar.vue";
import NavHeader from "@/components/common/NavHeader.vue";
import NotebookCard from "@/components/Notebook/NotebookCard.vue";

@Component({
  components: {
    Sidebar,
    NavHeader,
    NotebookCard
  }
})
export default class MyNotebook extends Vue {
  private listProcess: boolean = false;
  private scroll$ = new Subject<number>();
  private subScroll!: Subscription;

  get notebooks(): NotebookModel[] {
    return this.$store.state.myNotebook.list;
  }

  get paging(): Paging | null {
    return this.$store.state.myNotebook.paging;
  }

  get scrollTop(): number {
    return this.$store.state.myNotebook.scrollTop;
  }

  private getNotebooks() {
    if (!this.listProcess && this.paging) {
      this.listProcess = true;
      myNotebookPaging(this.paging)
        .then(querySnapshot => {
          const len = querySnapshot.docs.length;
          if (len === 0) {
            this.$store.commit(Commit.setMyNotebook, {
              paging: null
            });
          } else if (this.paging) {
            const list: NotebookModel[] = [];
            querySnapshot.forEach(doc => list.push(new NotebookModelImpl(doc)));
            this.$store.commit(Commit.setMyNotebook, {
              list,
              paging: {
                last: querySnapshot.docs[len - 1]
              }
            });
          }
        })
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        )
        .finally(() => (this.listProcess = false));
    }
  }

  // ==================== Event Handler ===================
  private onDocument(notebook: NotebookModel) {
    this.$router.push({
      name: routes.Document.name,
      params: {
        id: notebook.id
      }
    });
  }

  private onEditor(notebook: NotebookModel) {
    this.$router.push({
      name: routes.Editor.name,
      params: {
        id: notebook.id
      }
    });
  }

  private onSetting(notebook: NotebookModel) {
    this.$router.push({
      name: routes.NotebookSetting.name,
      params: {
        id: notebook.id
      }
    });
  }

  private onScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const innerHeight = window.innerHeight;
    const currentScroll = scrollTop + innerHeight;
    if (currentScroll + 400 >= scrollHeight) {
      this.getNotebooks();
    }
    this.scroll$.next(scrollTop);
  }

  private onScrollTop(scrollTop: number) {
    this.$store.commit(Commit.setMyNotebook, { scrollTop });
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    if (this.notebooks.length === 0) {
      this.getNotebooks();
    }
    window.addEventListener("scroll", this.onScroll);
    this.subScroll = this.scroll$
      .pipe(debounceTime(300))
      .subscribe(this.onScrollTop);
  }

  private mounted() {
    document.documentElement.scrollTop = this.scrollTop;
  }

  private destroyed() {
    window.removeEventListener("scroll", this.onScroll);
    this.subScroll.unsubscribe();
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
