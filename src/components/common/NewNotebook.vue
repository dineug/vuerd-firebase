<template>
  <el-drawer
    :title="$t('NewNotebook.newNotebook')"
    :visible.sync="drawer"
    size="630px"
  >
    <el-form style="padding: 0 20px;" label-width="90px">
      <el-form-item :label="$t('NewNotebook.picture')">
        <image-lazy :src="previewImage" />
        <el-button-group>
          <el-button icon="el-icon-edit" @click="onPicture('Edit')" />
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="onPicture('Clean')"
          />
        </el-button-group>
      </el-form-item>
      <el-form-item :label="$t('NewNotebook.title')">
        <el-input
          style="width: 450px;"
          v-model="title"
          placeholder="Notebook Title"
          clearable
          maxlength="100"
          show-word-limit
          ref="title"
        />
      </el-form-item>
      <el-form-item :label="$t('NewNotebook.published')">
        <el-switch v-model="published" />
      </el-form-item>
      <el-form-item :label="$t('NewNotebook.tag')">
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
        <el-button type="primary" @click="onCreate">{{
          $t("NewNotebook.create")
        }}</el-button>
        <el-button @click="onDrawerEnd">{{
          $t("NewNotebook.cancel")
        }}</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import eventBus, { Bus } from "@/ts/EventBus";
import { routes } from "@/router";
import { save, NotebookAdd } from "@/api/NotebookAPI";
import { autocomplete } from "@/api/TagAPI";
import { upload, FileType } from "@/api/storageAPI";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
// @ts-ignore
import VueTagsInput from "@johmun/vue-tags-input";
import ImageLazy from "@/components/Notebook/ImageLazy.vue";

import { Subject, Subscription } from "rxjs";
import { debounceTime, filter, distinctUntilChanged } from "rxjs/operators";

const IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8cOTMfwAH7QNRoi5FXwAAAABJRU5ErkJggg==";
const MAX_SIZE = 1024 * 1024 * 2;
const enum PictureAction {
  Edit = "Edit",
  Clean = "Clean"
}

interface Tag {
  text: string;
  tiClasses?: string[];
}

@Component({
  components: {
    VueTagsInput,
    ImageLazy
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
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string = IMAGE;
  private file: File | null = null;

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
    this.previewImage = IMAGE;
  }

  private valid(): boolean {
    let result = false;
    if (this.title.trim() === "") {
      this.$message.warning(this.$t("NewNotebook.valid.title") as string);
      (this.$refs.title as HTMLInputElement).focus();
    } else {
      result = true;
    }
    return result;
  }

  private validPicture(): boolean {
    let result = false;
    if (this.inputFile.files) {
      const file = this.inputFile.files[0];
      const isJPG = file.type === FileType.jpg;
      const isPNG = file.type === FileType.png;
      if (!(isJPG || isPNG)) {
        this.$message.warning(this.$t("Setting.valid.imageType") as string);
      } else if (file.size > MAX_SIZE) {
        this.$message.warning(this.$t("Setting.valid.imageSize") as string);
      } else {
        result = true;
      }
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

  private async onCreate() {
    if (this.valid()) {
      const loading = this.$loading({
        lock: true,
        text: this.$t("NewNotebook.creating") as string,
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      const notebookAdd: NotebookAdd = {
        title: this.title,
        published: this.published,
        tags: this.tags.map(tag => tag.text),
        image: null
      };
      try {
        if (this.file) {
          notebookAdd.image = await upload(this.file);
        }
        const docRef = await save(notebookAdd);
        this.$router.push({
          name: routes.Editor.name,
          params: {
            id: docRef.id
          }
        });
      } catch (err) {
        this.$message.error(err.message);
      }
      loading.close();
    }
  }

  private onDrawerStart() {
    this.reset();
    this.drawer = true;
    this.$nextTick(() => {
      (this.$refs.title as HTMLInputElement).focus();
    });
  }

  private onDrawerEnd() {
    this.drawer = false;
  }

  private onPicture(action: PictureAction) {
    if (action === PictureAction.Edit) {
      this.inputFile.click();
    } else if (action === PictureAction.Clean) {
      this.previewImage = IMAGE;
      this.inputFile.value = "";
      this.file = null;
    }
  }

  private onChangeFile() {
    log.debug("NewNotebook onChangeFile");
    if (this.validPicture() && this.inputFile.files) {
      this.file = this.inputFile.files[0];
      this.previewImage = URL.createObjectURL(this.file);
    } else {
      this.inputFile.value = "";
    }
  }

  private created() {
    this.inputFile.setAttribute("type", "file");
    this.inputFile.setAttribute("accept", ".png,.jpg,.jpeg");
    this.inputFile.addEventListener("change", this.onChangeFile);
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
    this.inputFile.removeEventListener("change", this.onChangeFile);
    this.inputFile.remove();
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
