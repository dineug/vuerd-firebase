<template>
  <el-drawer :title="$t('newNotebook')" :visible.sync="drawer" size="700px">
    <el-form style="padding: 0 20px;" label-width="120px">
      <el-form-item :label="$t('picture')">
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
      <el-form-item :label="$t('title')">
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
      <el-form-item :label="$t('description')">
        <el-input
          style="width: 450px;"
          type="textarea"
          :rows="5"
          placeholder="Notebook description"
          resize="none"
          v-model="description"
        />
      </el-form-item>
      <el-form-item :label="$t('published')">
        <el-switch v-model="published" />
      </el-form-item>
      <el-form-item :label="$t('tag')">
        <vue-tags-input
          class="tag-box"
          v-model="tag"
          :tags="tags"
          :autocomplete-items="autocompleteTags"
          allow-edit-tags
          @tags-changed="onChangeTags"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCreate">
          {{ $t("create") }}
        </el-button>
        <el-button @click="onDrawerEnd">
          {{ $t("cancel") }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import { COLOR_LOADING } from "@/data/color";
import log from "@/ts/Logger";
import { NotebookAdd } from "@/api/NotebookModel";
import eventBus, { Bus } from "@/ts/EventBus";
import { routes } from "@/router";
import { save } from "@/api/NotebookAPI";
import { autocomplete } from "@/api/TagAPI";
import { upload, FileType } from "@/api/storageAPI";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { IMAGE, MAX_SIZE } from "@/data/image";
import PictureAction from "@/models/PictureAction";
import { Tag } from "@/models/vue-tags-input";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import VueTagsInput from "@johmun/vue-tags-input";
import ImageLazy from "@/components/Notebook/ImageLazy.vue";

@Component({
  components: {
    VueTagsInput,
    ImageLazy
  }
})
export default class NewNotebook extends Vue {
  private drawer: boolean = false;
  private autocompleteTag$: Subject<string> = new Subject();
  private subAutocompleteTag!: Subscription;
  private title: string = "";
  private description: string = "";
  private published: boolean = false;
  private tag: string = "";
  private tags: Tag[] = [];
  private autocompleteTags: Tag[] = [];
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string = IMAGE;
  private file: File | null = null;

  @Watch("tag")
  private watchTag() {
    this.autocompleteTag$.next(this.tag);
  }

  private reset() {
    this.title = "";
    this.description = "";
    this.published = false;
    this.tag = "";
    this.tags = [];
    this.autocompleteTags = [];
    this.previewImage = IMAGE;
  }

  private valid(): boolean {
    let result = false;
    if (this.title.trim() === "") {
      this.title = "";
      this.$notify.warning({
        title: this.$t("Valid") as string,
        message: this.$t("valid.title") as string
      });
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
        this.$notify.warning({
          title: "Valid",
          message: this.$t("valid.imageType") as string
        });
      } else if (file.size > MAX_SIZE) {
        this.$notify.warning({
          title: "Valid",
          message: this.$t("valid.imageSize") as string
        });
      } else {
        result = true;
      }
    }
    return result;
  }

  private onAutocompleteTag(keyword: string) {
    log.debug("NewNotebook onAutocompleteTag", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.autocompleteTags = querySnapshot.docs.map(
        doc =>
          ({
            text: doc.id
          } as Tag)
      );
    });
  }

  private onChangeTags(newTags: Tag[]) {
    this.tags = newTags;
    this.autocompleteTags = [];
  }

  private async onCreate() {
    if (this.valid()) {
      const loading = this.$loading({
        lock: true,
        background: COLOR_LOADING,
        text: this.$t("loading.creating") as string
      });
      const notebookAdd: NotebookAdd = {
        title: this.title,
        description: this.description,
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
        this.$notify.error({
          title: "Error",
          message: err.message
        });
      }
      loading.close();
    }
  }

  private onDrawerStart() {
    log.debug("NewNotebook onDrawerStart");
    this.reset();
    this.drawer = true;
    setTimeout(() => {
      (this.$refs.title as HTMLInputElement).focus();
    }, 100);
  }

  private onDrawerEnd() {
    log.debug("NewNotebook onDrawerEnd");
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
    this.subAutocompleteTag = this.autocompleteTag$
      .pipe(
        filter(keyword => keyword.length >= 2),
        debounceTime(300)
      )
      .subscribe(this.onAutocompleteTag);
  }

  private destroyed() {
    this.inputFile.removeEventListener("change", this.onChangeFile);
    this.inputFile.remove();
    eventBus.$off(Bus.NewNotebook.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.NewNotebook.drawerEnd, this.onDrawerEnd);
    this.subAutocompleteTag.unsubscribe();
  }
}
</script>

<style scoped lang="scss"></style>
