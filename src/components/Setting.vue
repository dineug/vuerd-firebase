<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        <el-page-header @back="onBack" title="" :content="$t('setting')" />
        <el-form style="padding: 20px;" label-width="150px">
          <el-form-item :label="$t('picture')">
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
          <el-form-item :label="$t('name')">
            <el-input
              style="width: 450px;"
              clearable
              show-word-limit
              maxlength="30"
              placeholder="name"
              v-model="info.name"
              ref="name"
            />
          </el-form-item>
          <el-form-item :label="$t('nickname')">
            <el-input
              style="width: 450px;"
              clearable
              show-word-limit
              maxlength="30"
              placeholder="nickname"
              v-model="info.nickname"
              ref="nickname"
            />
          </el-form-item>
          <el-form-item :label="$t('email')">
            {{ info.email }}
          </el-form-item>
          <el-form-item :label="$t('language')">
            <language-select
              :value="info.language"
              @change="onChangeLanguage"
            />
          </el-form-item>
          <el-form-item :label="$t('invitationActive')">
            <el-switch v-model="info.published" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onUpdate">
              {{ $t("update") }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { identicon } from "@/ts/util";
import { User, UserModify, Language } from "@/api/UserModel";
import { userUpdate } from "@/api/UserAPI";
import { upload, FileType } from "@/api/storageAPI";
import eventBus, { Bus } from "@/ts/EventBus";
import { MAX_SIZE } from "@/data/image";
import PictureAction from "@/models/PictureAction";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import LanguageSelect from "@/components/Setting/LanguageSelect.vue";

@Component({
  components: {
    Sidebar,
    LanguageSelect
  }
})
export default class Setting extends Vue {
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string = "";
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
    if (this.info.name === null || this.info.name.trim() === "") {
      this.info.name = "";
      this.$message.warning(this.$t("valid.name") as string);
      (this.$refs.name as HTMLInputElement).focus();
    } else if (
      this.info.nickname === null ||
      this.info.nickname.trim() === ""
    ) {
      this.info.nickname = "";
      this.$message.warning(this.$t("valid.nickname") as string);
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
      const isJPG = file.type === FileType.jpg;
      const isPNG = file.type === FileType.png;
      if (!(isJPG || isPNG)) {
        this.$message.warning(this.$t("valid.imageType") as string);
      } else if (file.size > MAX_SIZE) {
        this.$message.warning(this.$t("valid.imageSize") as string);
      } else {
        result = true;
      }
    }
    return result;
  }

  // ==================== Event Handler ===================
  private onSetInfo() {
    const info = this.$store.state.info as User | null;
    if (info) {
      this.info = {
        name: info.name,
        nickname: info.nickname,
        email: info.email,
        image: info.image,
        language: info.language,
        published: info.published,
        notification: info.notification
      };
      if (info.image) {
        this.previewImage = info.image;
      } else {
        this.previewImage = identicon(info.email);
      }
    }
  }

  private onChangeLanguage(language: Language) {
    this.info.language = language;
    this.$i18n.locale = language;
  }

  private onPicture(action: PictureAction) {
    switch (action) {
      case PictureAction.Edit:
        this.inputFile.click();
        break;
      case PictureAction.Restore:
        if (this.info.image) {
          this.previewImage = this.info.image;
        } else {
          this.previewImage = identicon(this.info.email);
        }
        this.inputFile.value = "";
        this.file = null;
        break;
      case PictureAction.Clean:
        this.previewImage = identicon(this.info.email);
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
          text: this.$t("loading.updating") as string
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
          if (this.previewImage === identicon(this.info.email)) {
            user.image = identicon(this.info.email);
          }
          await userUpdate(user);
        } catch (err) {
          this.$message.error(err.message);
        }
        this.$message({
          type: "success",
          message: this.$t("updated") as string
        });
        loading.close();
      }
    }
  }

  private onBack() {
    this.$router.back();
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.inputFile.setAttribute("type", "file");
    this.inputFile.setAttribute("accept", ".png,.jpg,.jpeg");
    this.inputFile.addEventListener("change", this.onChangeFile);
    this.onSetInfo();
    eventBus.$on(Bus.Setting.setInfo, this.onSetInfo);
  }

  private mounted() {
    (this.$refs.name as HTMLInputElement).focus();
  }

  private destroyed() {
    this.inputFile.removeEventListener("change", this.onChangeFile);
    this.inputFile.remove();
    eventBus.$off(Bus.Setting.setInfo, this.onSetInfo);
    const info = this.$store.state.info as User | null;
    if (info) {
      this.$i18n.locale = info.language;
    }
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
