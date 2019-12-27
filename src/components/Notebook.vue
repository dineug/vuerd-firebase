<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main>
        <el-form inline>
          <el-form-item>
            <vue-tags-input
              style="width: 450px;"
              placeholder="Tag Filter"
              v-model="filterTag"
              :tags="tags"
              :autocomplete-items="autocompleteTags"
              add-only-from-autocomplete
              @tags-changed="onChangeTags"
            />
          </el-form-item>
          <el-form-item class="top-tag-box">
            <el-badge
              v-for="tag in topTags"
              :key="tag.id"
              :value="tag.count"
              type="primary"
            >
              <el-tag @click="onTagAdd(tag)">
                {{ tag.name }}
              </el-tag>
            </el-badge>
          </el-form-item>
        </el-form>
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
import log from "@/ts/Logger";
import {
  NotebookPaging,
  NotebookModel,
  NotebookModelImpl
} from "@/api/NotebookModel";
import { notebookPaging } from "@/api/NotebookAPI";
import { TagModel, TagModelImpl } from "@/api/TagModel";
import { tagAutocomplete, tagTopCount } from "@/api/TagAPI";
import { routes } from "@/router";
import { Commit } from "@/store";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { Tag } from "@/models/vue-tags-input";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import NotebookCard from "./Notebook/NotebookCard.vue";
import VueTagsInput from "@johmun/vue-tags-input";

@Component({
  components: {
    Sidebar,
    NotebookCard,
    VueTagsInput
  }
})
export default class Notebook extends Vue {
  private listProcess: boolean = false;
  private scroll$ = new Subject<number>();
  private subScroll!: Subscription;

  private filterTag: string = "";
  private autocompleteTags: Tag[] = [];
  private topTags: TagModel[] = [];
  private autocompleteTag$: Subject<string> = new Subject();
  private subAutocompleteTag!: Subscription;

  get notebooks(): NotebookModel[] {
    return this.$store.state.notebook.list;
  }

  get paging(): NotebookPaging | null {
    return this.$store.state.notebook.paging;
  }

  get scrollTop(): number {
    return this.$store.state.notebook.scrollTop;
  }

  get tags(): Tag[] {
    return this.$store.state.notebook.tags;
  }

  @Watch("filterTag")
  private watchTag() {
    this.autocompleteTag$.next(this.filterTag);
  }

  private getNotebooks() {
    if (!this.listProcess && this.paging) {
      this.listProcess = true;
      notebookPaging(this.paging)
        .then(querySnapshot => {
          const len = querySnapshot.docs.length;
          if (len === 0) {
            this.$store.commit(Commit.setNotebook, {
              paging: null
            });
          } else if (this.paging) {
            const list: NotebookModel[] = [];
            querySnapshot.forEach(doc => list.push(new NotebookModelImpl(doc)));
            this.$store.commit(Commit.setNotebook, {
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

  private getTagTopCount() {
    tagTopCount().then(querySnapshot => {
      const list: TagModel[] = [];
      querySnapshot.docs.map(doc => {
        if (doc.exists) {
          list.push(new TagModelImpl(doc));
        }
      });
      this.topTags = list;
    });
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
    this.$store.commit(Commit.setNotebook, { scrollTop });
  }

  private onChangeTags(newTags: Tag[]) {
    this.autocompleteTags = [];
    this.$store.commit(Commit.resetNotebook);
    this.$store.commit(Commit.setNotebook, {
      tags: newTags
    });
    this.getNotebooks();
  }

  private onAutocompleteTag(keyword: string) {
    log.debug("Notebook onAutocompleteTag", keyword);
    tagAutocomplete(keyword).then(querySnapshot => {
      this.autocompleteTags = querySnapshot.docs.map(
        doc =>
          ({
            text: doc.id
          } as Tag)
      );
    });
  }

  private onTagAdd(newTag: TagModel) {
    const tags = [...this.tags];
    if (!tags.some(tag => tag.text === newTag.name)) {
      tags.push({
        text: newTag.name
      });
      this.$store.commit(Commit.resetNotebook);
      this.$store.commit(Commit.setNotebook, {
        tags: tags
      });
      this.getNotebooks();
    }
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    if (this.notebooks.length === 0) {
      this.getNotebooks();
    }
    this.getTagTopCount();
    window.addEventListener("scroll", this.onScroll);
    this.subScroll = this.scroll$
      .pipe(debounceTime(300))
      .subscribe(this.onScrollTop);
    this.subAutocompleteTag = this.autocompleteTag$
      .pipe(
        filter(keyword => keyword.length >= 2),
        debounceTime(300)
      )
      .subscribe(this.onAutocompleteTag);
  }

  private mounted() {
    document.documentElement.scrollTop = this.scrollTop;
  }

  private destroyed() {
    window.removeEventListener("scroll", this.onScroll);
    this.subScroll.unsubscribe();
    this.subAutocompleteTag.unsubscribe();
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.top-tag-box {
  .el-tag {
    color: white;
    background-color: $color-tag;
    border: none;
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>
