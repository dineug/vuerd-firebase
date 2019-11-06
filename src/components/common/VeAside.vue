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
        <el-menu-item index="1">
          <i class="el-icon-menu"></i>
          <span>Home</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip content="Notebook" placement="left" :open-delay="openDelay">
        <el-menu-item index="2">
          <i class="el-icon-notebook-1"></i>
          <span>Notebook</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip content="Bookmark" placement="left" :open-delay="openDelay">
        <el-menu-item index="3">
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
  @Prop({ type: String, default: "1" })
  private active!: string;

  private openDelay: number = 0;
  private backgroundColor: string = "#282828";
  private textColor: string = "#fff";
  private activeTextColor: string = "#ffc107";

  private provider: AuthProvider = new firebase.auth.GoogleAuthProvider();

  get user(): User | null {
    return this.$store.state.user;
  }

  private onSelect(key: string) {
    log.debug(`VeAside onSelect: ${key}`);
    switch (key) {
      case "1":
        this.$router.push({
          name: RouterName.Home
        });
        break;
      case "2":
        this.$router.push({
          name: RouterName.Notebook
        });
        break;
      case "3":
        this.$router.push({
          name: RouterName.Bookmark
        });
        break;
      case "sign-in-google":
        auth.signInWithPopup(this.provider).catch(err => {
          log.error(err.message);
        });
        break;
      case "sign-out":
        auth.signOut().catch(err => {
          log.error(err.message);
        });
        break;
    }
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
