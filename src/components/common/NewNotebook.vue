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
      <el-form-item label="tag">
        <vue-tags-input
          class="tag-box"
          v-model="tag"
          :tags="tags"
          :autocomplete-items="autocompleteItems"
          allow-edit-tags
          @tags-changed="onChangeTags"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCreate">Create</el-button>
        <el-button @click="onDrawerEnd">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import eventBus, { Bus } from "@/ts/EventBus";
import { save } from "@/api/NotebookAPI";
import { routes } from "@/router";
import { autocomplete } from "@/api/TagAPI";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
// @ts-ignore
import VueTagsInput from "@johmun/vue-tags-input";

import { Subject, Subscription } from "rxjs";
import { debounceTime, filter, distinctUntilChanged } from "rxjs/operators";

interface Tag {
  text: string;
  tiClasses?: string[];
}

@Component({
  components: {
    VueTagsInput
  }
})
export default class NewNotebook extends Vue {
  private drawer: boolean = false;

  private autocomplete$: Subject<string> = new Subject();
  private subAutocomplete!: Subscription;

  private title: string = "";
  private published: boolean = false;
  private tag: string = "";
  private tags: Tag[] = [];
  private autocompleteItems: Tag[] = [];

  @Watch("tag")
  private watchTag() {
    this.autocomplete$.next(this.tag);
  }

  private reset() {
    this.title = "";
    this.published = false;
    this.tag = "";
    this.tags = [];
    this.autocompleteItems = [];
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

  private onAutocomplete(keyword: string) {
    log.debug("NewNotebook onAutocomplete", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.autocompleteItems = querySnapshot.docs.map(
        doc =>
          ({
            text: doc.id
          } as Tag)
      );
    });
  }

  private onChangeTags(newTags: Tag[]) {
    this.tags = newTags;
    this.autocompleteItems = [];
  }

  private onCreate() {
    if (this.valid()) {
      const loading = this.$loading({
        lock: true,
        text: "Creating",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      save({
        title: this.title,
        published: this.published,
        tags: this.tags.map(tag => tag.text)
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
    this.subAutocomplete = this.autocomplete$
      .pipe(
        filter(keyword => keyword.length >= 2),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(this.onAutocomplete);
  }

  private destroyed() {
    eventBus.$off(Bus.NewNotebook.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.NewNotebook.drawerEnd, this.onDrawerEnd);
    this.subAutocomplete.unsubscribe();
  }
}
</script>

<style scoped lang="scss">
.tag-box {
  & /deep/ .ti-tag,
  & /deep/ .ti-selected-item {
    background-color: $color-tag;
  }
}
</style>
