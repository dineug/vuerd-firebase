<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        <el-form style="padding: 20px;" label-width="90px">
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
import { User, Language, userUpdate, findUserBy } from "@/api/UserAPI";
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

  private onChangeLanguage(language: Language) {
    this.info.language = language;
  }

  private onUpdate() {
    if (this.valid()) {
      if (this.info.name && this.info.nickname) {
        const loading = this.$loading({
          lock: true,
          text: "Updating",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        userUpdate({
          name: this.info.name,
          nickname: this.info.nickname,
          image: this.info.image,
          language: this.info.language,
          published: this.info.published
        })
          .catch(err => this.$message.error(err.message))
          .finally(() => loading.close());
      }
    }
  }

  private created() {
    findUserBy().then(doc => {
      const info = doc.data() as User | undefined;
      if (info) {
        this.info = info;
      }
    });
  }
}
</script>

<style scoped lang="scss"></style>
