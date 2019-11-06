<template>
  <el-aside width="64">
    <el-menu
      :default-active="active"
      class="aside-menu"
      :background-color="backgroundColor"
      :text-color="textColor"
      :active-text-color="activeTextColor"
      :collapse="true"
      @select="onSelect"
    >
      <el-tooltip content="Home" placement="left" :open-delay="openDelay">
        <el-menu-item index="Home">
          <i class="el-icon-menu"></i>
          <span>Home</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip content="Notebook" placement="left" :open-delay="openDelay">
        <el-menu-item index="Notebook">
          <i class="el-icon-notebook-1"></i>
          <span>Notebook</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip content="Bookmark" placement="left" :open-delay="openDelay">
        <el-menu-item index="Bookmark">
          <i class="el-icon-collection-tag"></i>
          <span>Bookmark</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        content="Sign out"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="sign-out">
          <i class="el-icon-switch-button"></i>
          <span>Sign out</span>
        </el-menu-item>
      </el-tooltip>
      <el-submenu v-else index="sign-in">
        <template slot="title">
          <i class="el-icon-connection"></i>
          <span>Sign in</span>
        </template>
        <el-menu-item-group>
          <span slot="title">Sign in</span>
          <el-menu-item index="sign-in-google">
            <el-button class="sign-in-btn">
              <el-row :gutter="20">
                <el-col :span="2">
                  <img class="sign-in-logo" src="@/assets/google.png" />
                </el-col>
                <el-col :span="20">
                  <span class="sign-in-text">Sign in With Google</span>
                </el-col>
                <el-col :span="2"></el-col>
              </el-row>
            </el-button>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { RouterName } from "@/router";
import firebase, { auth, AuthProvider, User } from "@/plugins/firebase";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class VeAside extends Vue {
  private openDelay: number = 0;
  private backgroundColor: string = "#282828";
  private textColor: string = "#fff";
  private activeTextColor: string = "#ffc107";
  private active: string = RouterName.Home;
  private provider: AuthProvider = new firebase.auth.GoogleAuthProvider();

  get user(): User | null {
    return this.$store.state.user;
  }

  private setActive() {
    if (this.$route.name) {
      this.active = this.$route.name;
    }
  }

  private onSelect(key: string) {
    log.debug(`VeAside onSelect: ${key}`);
    switch (key) {
      case RouterName.Home:
        if (this.$route.name !== RouterName.Home) {
          this.$router.push({
            name: RouterName.Home
          });
        }
        break;
      case RouterName.Notebook:
        if (this.$route.name !== RouterName.Notebook) {
          this.$router.push({
            name: RouterName.Notebook
          });
        }
        break;
      case RouterName.Bookmark:
        if (this.$route.name !== RouterName.Bookmark) {
          this.$router.push({
            name: RouterName.Bookmark
          });
        }
        break;
      case "sign-in-google":
        auth
          .signInWithPopup(this.provider)
          .catch(err => this.$message.error(err.message))
          .finally(() => this.setActive());
        break;
      case "sign-out":
        auth
          .signOut()
          .catch(err => this.$message.error(err.message))
          .finally(() => this.setActive());
        break;
    }
  }

  private created() {
    this.setActive();
  }
}
</script>

<style scoped lang="scss">
.aside-menu {
  height: 100vh;
  border: 0;
}
.sign-in-btn {
  width: 200px;

  .sign-in-logo {
    width: 14px;
    height: 14px;
  }

  .sign-in-text {
    font-size: 14px;
  }
}
</style>
