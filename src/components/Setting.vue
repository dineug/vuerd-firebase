<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-header style="padding: 0; height: auto;">
        <nav-header />
      </el-header>
      <el-main class="main">
        <el-page-header @back="onBack" title="" :content="$t('setting')" />
        <el-form style="padding: 20px;" label-width="150px">
          <el-form-item :label="$t('picture')">
            <el-avatar :src="previewImage" :size="100" />
            <el-button-group>
              <el-button
                class="custom-icon-btn"
                type="info"
                size="mini"
                plain
                @click="onPicture('Edit')"
              >
                <i class="el-icon-upload" />
              </el-button>
              <el-button
                class="custom-icon-btn"
                type="info"
                size="mini"
                plain
                @click="onPicture('Restore')"
              >
                <i class="el-icon-refresh-left" />
              </el-button>
              <el-button
                class="custom-icon-btn"
                type="info"
                size="mini"
                plain
                @click="onPicture('Clean')"
              >
                <i class="el-icon-delete" />
              </el-button>
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
            <el-switch
              :active-color="COLOR_SWITCH_ACTIVE"
              :inactive-color="COLOR_SWITCH_INACTIVE"
              v-model="info.published"
            />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="onUpdate">
                {{ $t("update") }}
              </el-button>
              <el-button type="info" plain @click="onLeave">
                {{ $t("leave") }}
              </el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import {
  COLOR_LOADING,
  COLOR_SWITCH_ACTIVE,
  COLOR_SWITCH_INACTIVE
} from "@/data/color";
import log from "@/ts/Logger";
import { identicon } from "@/ts/util";
import { User, UserModify, Language } from "@/api/UserModel";
import { userModify } from "@/api/UserAPI";
import { upload, FileType } from "@/api/storageAPI";
import eventBus, { Bus } from "@/ts/EventBus";
import { MAX_SIZE } from "@/data/image";
import PictureAction from "@/models/PictureAction";
import { User as AuthUser } from "@/plugins/firebase";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "@/components/common/Sidebar.vue";
import NavHeader from "@/components/common/NavHeader.vue";
import LanguageSelect from "@/components/Setting/LanguageSelect.vue";
import { routes } from "@/router";

@Component({
  components: {
    Sidebar,
    NavHeader,
    LanguageSelect
  }
})
export default class Setting extends Vue {
  private COLOR_SWITCH_ACTIVE = COLOR_SWITCH_ACTIVE;
  private COLOR_SWITCH_INACTIVE = COLOR_SWITCH_INACTIVE;
  private inputFile: HTMLInputElement = document.createElement("input");
  private previewImage: string = "";
  private file: File | null = null;
  private info: User = {
    name: "",
    nickname: "",
    email: "",
    image: "",
    language: "en",
    published: false,
    notification: 0
  };

  private valid(): boolean {
    let result = false;
    if (this.info.nickname === null || this.info.nickname.trim() === "") {
      this.info.nickname = "";
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.nickname") as string
      });
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
        this.previewImage = identicon(this.$store.state.user.uid);
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
          this.previewImage = identicon(this.$store.state.user.uid);
        }
        this.inputFile.value = "";
        this.file = null;
        break;
      case PictureAction.Clean:
        this.previewImage = identicon(this.$store.state.user.uid);
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
      if (this.info.name !== null && this.info.nickname !== null) {
        const loading = this.$loading({
          lock: true,
          background: COLOR_LOADING,
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
          if (this.previewImage === identicon(this.$store.state.user.uid)) {
            user.image = identicon(this.$store.state.user.uid);
          }
          await userModify(user);
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
  }

  private onBack() {
    this.$router.back();
  }

  private onLeave() {
    const user = this.$store.state.user as AuthUser | null;
    if (user) {
      this.$confirm(this.$t("confirm.deleteLeave") as string, "Warning", {
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
          user
            .delete()
            .then(() => {
              this.$router.push(routes.Notebook);
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

<style scoped lang="scss">
.custom-icon-btn {
  i {
    font-size: 18px;
  }
}
</style>
