<template>
  <el-form style="padding: 20px;" label-width="150px">
    <el-form-item :label="$t('picture')">
      <image-lazy :src="previewImage" />
      <el-button-group>
        <el-button
          icon="el-icon-edit"
          :disabled="readerRole"
          @click="onPicture('Edit')"
        />
        <el-button
          icon="el-icon-refresh-left"
          :disabled="readerRole"
          @click="onPicture('Restore')"
        />
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="readerRole"
          @click="onPicture('Clean')"
        />
      </el-button-group>
    </el-form-item>
    <el-form-item :label="$t('title')">
      <el-input
        style="width: 450px;"
        v-model="notebookModify.title"
        placeholder="Notebook Title"
        clearable
        maxlength="100"
        show-word-limit
        :disabled="readerRole"
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
        v-model="notebookModify.description"
      />
    </el-form-item>
    <el-form-item :label="$t('published')">
      <el-switch v-model="notebookModify.published" :disabled="ownerRole" />
    </el-form-item>
    <el-form-item :label="$t('tag')">
      <vue-tags-input
        class="tag-box"
        v-model="tag"
        :tags="tags"
        :autocomplete-items="autocompleteTags"
        allow-edit-tags
        :disabled="readerRole"
        @tags-changed="onChangeTags"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="readerRole" @click="onUpdate">
        {{ $t("update") }}
      </el-button>
      <el-button :disabled="ownerRole" @click="onDeleteNotebook">
        {{ $t("delete") }}
      </el-button>
      <el-button @click="onBack">
        {{ $t("cancel") }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { COLOR_LOADING } from "@/data/color";
import log from "@/ts/Logger";
import { NotebookModel, NotebookAdd } from "@/api/NotebookModel";
import { notebookUpdate, deleteById } from "@/api/NotebookAPI";
import { autocomplete } from "@/api/TagAPI";
import { FileType, upload } from "@/api/storageAPI";
import { IMAGE, MAX_SIZE } from "@/data/image";
import PictureAction from "@/models/PictureAction";
import { Tag } from "@/models/vue-tags-input";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import VueTagsInput from "@johmun/vue-tags-input";
import ImageLazy from "@/components/Notebook/ImageLazy.vue";

@Component({
  components: {
    VueTagsInput,
    ImageLazy
  }
})
export default class NotebookInfo extends Vue {
  @Prop({ type: Object })
  private notebook!: NotebookModel;

  private autocompleteTag$: Subject<string> = new Subject();
  private subAutocompleteTag!: Subscription;
  private tag: string = "";
  private tags: Tag[] = [];
  private autocompleteTags: Tag[] = [];
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string = IMAGE;
  private file: File | null = null;
  private notebookModify: NotebookAdd = {
    title: "",
    description: "",
    published: false,
    tags: [],
    image: null
  };

  get ownerRole(): boolean {
    return this.notebook.roles[this.$store.state.user.uid] !== "owner";
  }

  get readerRole(): boolean {
    return this.notebook.roles[this.$store.state.user.uid] === "reader";
  }

  @Watch("tag")
  private watchTag() {
    this.autocompleteTag$.next(this.tag);
  }

  private setNotebook() {
    this.notebookModify = {
      title: this.notebook.title,
      description: this.notebook.description,
      published: this.notebook.published,
      tags: this.notebook.tags,
      image: this.notebook.image
    };
    this.tags = this.notebook.tags.map(tag => ({ text: tag }));
    if (this.notebook.image) {
      this.previewImage = this.notebook.image;
    } else {
      this.previewImage = IMAGE;
    }
  }

  private valid(): boolean {
    let result = false;
    if (this.notebookModify.title.trim() === "") {
      this.notebookModify.title = "";
      this.$notify.warning({
        title: "Valid",
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

  // ==================== Event Handler ===================
  private onChangeTags(newTags: Tag[]) {
    this.tags = newTags;
    this.autocompleteTags = [];
  }

  private onAutocompleteTag(keyword: string) {
    log.debug("NotebookInfo onAutocompleteTag", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.autocompleteTags = querySnapshot.docs.map(
        doc =>
          ({
            text: doc.id
          } as Tag)
      );
    });
  }

  private onBack() {
    this.$router.back();
  }

  private onPicture(action: PictureAction) {
    switch (action) {
      case PictureAction.Edit:
        this.inputFile.click();
        break;
      case PictureAction.Restore:
        if (this.notebookModify.image) {
          this.previewImage = this.notebookModify.image;
        } else {
          this.previewImage = IMAGE;
        }
        this.inputFile.value = "";
        this.file = null;
        break;
      case PictureAction.Clean:
        this.previewImage = IMAGE;
        this.inputFile.value = "";
        this.file = null;
        break;
    }
  }

  private onChangeFile() {
    log.debug("NotebookInfo onChangeFile");
    if (this.validPicture() && this.inputFile.files) {
      this.file = this.inputFile.files[0];
      this.previewImage = URL.createObjectURL(this.file);
    } else {
      this.inputFile.value = "";
    }
  }

  private async onUpdate() {
    if (this.valid()) {
      const loading = this.$loading({
        lock: true,
        background: COLOR_LOADING,
        text: this.$t("loading.updating") as string
      });
      try {
        if (this.file) {
          this.notebookModify.image = await upload(this.file);
        }
        if (this.previewImage === IMAGE) {
          this.notebookModify.image = null;
        }
        this.notebookModify.tags = this.tags.map(tag => tag.text);
        notebookUpdate(this.$route.params.id, this.notebookModify);
      } catch (err) {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
      }
      this.$notify.success({
        title: "Success",
        message: this.$t("updated") as string,
        duration: 3000
      });
      loading.close();
    }
  }

  private onDeleteNotebook() {
    this.$confirm(this.$t("confirm.deleteNotebook") as string, "Warning", {
      confirmButtonText: this.$t("ok") as string,
      cancelButtonText: this.$t("cancel") as string,
      type: "warning"
    })
      .then(() => {
        const loading = this.$loading({
          lock: true,
          background: COLOR_LOADING,
          text: this.$t("loading.deleting") as string
        });
        deleteById(this.notebook.id)
          .then(() => {
            this.$notify.success({
              title: "Success",
              message: this.$t("deleted") as string,
              duration: 3000
            });
            this.$router.back();
          })
          .catch(err =>
            this.$notify.error({
              title: "Error",
              message: err.message
            })
          )
          .finally(() => loading.close());
      })
      .catch(() => {});
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.inputFile.setAttribute("type", "file");
    this.inputFile.setAttribute("accept", ".png,.jpg,.jpeg");
    this.inputFile.addEventListener("change", this.onChangeFile);
    this.subAutocompleteTag = this.autocompleteTag$
      .pipe(
        filter(keyword => keyword.length >= 2),
        debounceTime(300)
      )
      .subscribe(this.onAutocompleteTag);
    this.setNotebook();
  }

  private mounted() {
    (this.$refs.title as HTMLInputElement).focus();
  }

  private destroyed() {
    this.inputFile.removeEventListener("change", this.onChangeFile);
    this.inputFile.remove();
    this.subAutocompleteTag.unsubscribe();
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
