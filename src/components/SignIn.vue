<template>
  <el-container>
    <sidebar />
    <el-container>
      <el-header style="padding: 0; height: auto;">
        <nav-header />
      </el-header>
      <el-main>
        <el-page-header @back="onBack" title="" :content="$t('signIn')" />
        <el-container class="sign-in-main">
          <el-card class="sign-in-box">
            <el-button class="sign-in-btn" @click="onSignIn('google')">
              <el-row :gutter="20">
                <el-col :span="2">
                  <img class="sign-in-logo" src="@/assets/google.png" />
                </el-col>
                <el-col :span="20">
                  <span class="sign-in-text">{{ $t("signInGoogle") }}</span>
                </el-col>
                <el-col :span="2"></el-col>
              </el-row>
            </el-button>
          </el-card>
        </el-container>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { COLOR_LOADING } from "@/data/color";
import SignInProvider from "@/models/SignInProvider";
import firebase, { auth, AuthError } from "@/plugins/firebase";
import { routes } from "@/router";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Sidebar from "@/components/common/Sidebar.vue";
import NavHeader from "@/components/common/NavHeader.vue";

@Component({
  components: {
    Sidebar,
    NavHeader
  }
})
export default class SignIn extends Vue {
  get auth(): boolean {
    return this.$store.state.user !== null;
  }

  @Watch("auth")
  private watchAuth(auth: boolean) {
    if (auth) {
      this.$router.push(routes.Notebook);
    }
  }

  private onBack() {
    this.$router.back();
  }

  private onSignIn(provider: SignInProvider) {
    switch (provider) {
      case SignInProvider.google:
        auth
          .signInWithRedirect(new firebase.auth.GoogleAuthProvider())
          .catch((err: AuthError) => {
            if (err.code !== "auth/popup-closed-by-user") {
              this.$notify.error({
                title: err.code,
                message: err.message
              });
            }
          });
        break;
    }
  }

  private mounted() {
    const loading = this.$loading({
      lock: true,
      background: COLOR_LOADING
    });
    auth
      .getRedirectResult()
      .catch((err: AuthError) => {
        if (err.code !== "auth/popup-closed-by-user") {
          this.$notify.error({
            title: err.code,
            message: err.message
          });
        }
      })
      .finally(() => loading.close());
  }
}
</script>

<style scoped lang="scss">
.sign-in-main {
  justify-content: center;

  .sign-in-box {
    width: 340px;

    .sign-in-btn {
      width: 300px;
      margin: 0 0 10px 0;

      .sign-in-logo {
        width: 20px;
        height: 20px;
      }

      .sign-in-text {
        font-size: 20px;
      }
    }
  }
}
</style>
