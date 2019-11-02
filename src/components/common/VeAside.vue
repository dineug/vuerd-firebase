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
      <el-tooltip content="Sign in" placement="left" :open-delay="openDelay">
        <el-menu-item index="4">
          <i class="el-icon-connection"></i>
          <span>Sign in</span>
        </el-menu-item>
      </el-tooltip>
    </el-menu>
  </el-aside>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { RouterName } from "@/router";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class VeAside extends Vue {
  @Prop({ type: String, default: "1" })
  private active!: string;

  private openDelay: number = 300;
  private backgroundColor: string = "#282828";
  private textColor: string = "#fff";
  private activeTextColor: string = "#ffc107";

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
      case "4":
        this.$router.push({
          name: RouterName.SignIn
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
</style>
