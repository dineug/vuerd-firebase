<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-main class="main">
        <el-form style="padding: 0 20px;" label-width="90px">
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
            <el-input
              clearable
              show-word-limit
              maxlength="30"
              placeholder="email"
              v-model="info.email"
              ref="email"
            />
          </el-form-item>
          <el-form-item label="Language">
            <language-select :value="info.language" @change="onChangeLanguage" />
          </el-form-item>
          <el-form-item label="Published">
            <el-switch v-model="info.published" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">Save</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { User, Language, userSave, findUserBy } from "@/api/UserAPI";
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
    name: "",
    nickname: "",
    email: "",
    image: "",
    language: "en",
    published: false,
    notification: 0
  };

  private onChangeLanguage(language: Language) {
    this.info.language = language;
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
