<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        <el-form style="padding: 20px;" label-width="90px">
          <el-form-item label="Picture">
            <el-avatar :src="previewImage" :size="100" />
            <el-button-group>
              <el-button icon="el-icon-edit" @click="onPicture('Edit')" />
              <el-button
                icon="el-icon-refresh-left"
                @click="onPicture('Restore')"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="onPicture('Clean')"
              />
            </el-button-group>
          </el-form-item>
          <el-form-item label="Name">
            <el-input
              clearable
              show-word-limit
              maxlength="30"
              placeholder="name"
              v-model="info.name"
              ref="name"
            />
          </el-form-item>
          <el-form-item label="Nickname">
            <el-input
              clearable
              show-word-limit
              maxlength="30"
              placeholder="nickname"
              v-model="info.nickname"
              ref="nickname"
            />
          </el-form-item>
          <el-form-item label="Email">
            {{ info.email }}
          </el-form-item>
          <el-form-item label="Language">
            <language-select
              :value="info.language"
              @change="onChangeLanguage"
            />
          </el-form-item>
          <el-form-item label="Published">
            <el-switch v-model="info.published" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onUpdate">Update</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import {
  User,
  UserModify,
  Language,
  userUpdate,
  findUserBy
} from "@/api/UserAPI";
import { upload } from "@/api/storageAPI";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import LanguageSelect from "@/components/Setting/LanguageSelect.vue";

const MAX_SIZE = 1024 * 1024 * 2;
const enum PictureAction {
  Edit = "Edit",
  Restore = "Restore",
  Clean = "Clean"
}

@Component({
  components: {
    Sidebar,
    LanguageSelect
  }
})
export default class Setting extends Vue {
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string | null = null;
  private file: File | null = null;
  private info: User = {
    name: null,
    nickname: null,
    email: null,
    image: null,
    language: "en",
    published: false,
    notification: 0
  };

  private valid(): boolean {
    let result = false;
    if (this.info.name && this.info.name.trim() === "") {
      this.$message.warning("Please enter a name");
      (this.$refs.name as HTMLInputElement).focus();
    } else if (this.info.nickname && this.info.nickname.trim() === "") {
      this.$message.warning("Please enter a nickname");
      (this.$refs.nickname as HTMLInputElement).focus();
    } else {
      result = true;
    }
    return result;
  }

  private validPicture(): boolean {
    let result = false;
    if (this.inputFile.files) {
      const file = this.inputFile.files[0];
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      if (!(isJPG || isPNG)) {
        this.$message.warning("Picture must be JPG, PNG format!");
      } else if (file.size > MAX_SIZE) {
        this.$message.warning("Picture size can not exceed 2MB!");
      } else {
        result = true;
      }
    }
    return result;
  }

  private onChangeLanguage(language: Language) {
    this.info.language = language;
  }

  private onPicture(action: PictureAction) {
    switch (action) {
      case PictureAction.Edit:
        this.inputFile.click();
        break;
      case PictureAction.Restore:
        this.previewImage = this.info.image;
        this.inputFile.value = "";
        this.file = null;
        break;
      case PictureAction.Clean:
        this.previewImage = null;
        this.inputFile.value = "";
        this.file = null;
        break;
    }
  }

  private onChangeFile() {
    log.debug("Setting onChangeFile");
    if (this.validPicture() && this.inputFile.files) {
      this.file = this.inputFile.files[0];
      this.previewImage = URL.createObjectURL(this.file);
    } else {
      this.inputFile.value = "";
    }
  }

  private async onUpdate() {
    if (this.valid()) {
      if (this.info.name && this.info.nickname) {
        const loading = this.$loading({
          lock: true,
          text: "Updating",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        const user: UserModify = {
          name: this.info.name,
          nickname: this.info.nickname,
          image: this.info.image,
          language: this.info.language,
          published: this.info.published
        };
        try {
          if (this.file) {
            user.image = await upload(this.file);
          }
          userUpdate(user).finally(() => loading.close());
        } catch (err) {
          this.$message.error(err.message);
        }
      }
    }
  }

  private created() {
    this.inputFile.setAttribute("type", "file");
    this.inputFile.setAttribute("accept", ".png,.jpg,.jpeg");
    this.inputFile.addEventListener("change", this.onChangeFile);

    findUserBy().then(doc => {
      const info = doc.data() as User | undefined;
      if (info) {
        this.info = info;
        this.previewImage = info.image;
      }
    });
  }

  private destroyed() {
    this.inputFile.removeEventListener("change", this.onChangeFile);
  }
}
</script>

<style scoped lang="scss"></style>
