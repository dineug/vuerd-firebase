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
      <el-tooltip
        :content="$t('Sidebar.notebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="Notebook">
          <i class="el-icon-notebook-2"></i>
          <span>{{ $t("Sidebar.notebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('Sidebar.myNotebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="MyNotebook">
          <i class="el-icon-notebook-1"></i>
          <span>{{ $t("Sidebar.myNotebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('Sidebar.newNotebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="new-notebook">
          <i class="el-icon-document-add"></i>
          <span>{{ $t("Sidebar.newNotebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('Sidebar.setting')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="Setting">
          <i class="el-icon-setting"></i>
          <span>{{ $t("Sidebar.setting") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('Sidebar.signOut')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="sign-out">
          <font-awesome-icon class="font-awesome" icon="sign-out-alt" />
          <span>{{ $t("Sidebar.signOut") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-submenu v-else index="sign-in">
        <template slot="title">
          <font-awesome-icon class="font-awesome" icon="sign-in-alt" />
          <span>{{ $t("Sidebar.signIn") }}</span>
        </template>
        <el-menu-item-group>
          <span slot="title">{{ $t("Sidebar.signIn") }}</span>
          <el-menu-item index="sign-in-google">
            <el-button class="sign-in-btn">
              <el-row :gutter="20">
                <el-col :span="2">
                  <img class="sign-in-logo" src="@/assets/google.png" />
                </el-col>
                <el-col :span="20">
                  <span class="sign-in-text">{{
                    $t("Sidebar.signInGoogle")
                  }}</span>
                </el-col>
                <el-col :span="2"></el-col>
              </el-row>
            </el-button>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
    <new-notebook />
  </el-aside>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { routes } from "@/router";
import firebase, { auth, User } from "@/plugins/firebase";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";
import NewNotebook from "@/components/common/NewNotebook.vue";

@Component({
  components: {
    NewNotebook
  }
})
export default class Sidebar extends Vue {
  private openDelay: number = 0;
  private backgroundColor: string = "#282828";
  private textColor: string = "#fff";
  private activeTextColor: string = "#ffc107";
  private active: string = routes.Notebook.name;

  get user(): User | null {
    return this.$store.state.user;
  }

  private setActive() {
    this.active = "";
    this.$nextTick(() => {
      if (this.$route.name) {
        this.active = this.$route.name;
      }
    });
  }

  private onSelect(key: string) {
    log.debug(`Sidebar onSelect: ${key}`);
    switch (key) {
      case routes.Notebook.name:
        if (this.$route.name !== routes.Notebook.name) {
          this.$router.push(routes.Notebook);
        }
        break;
      case routes.MyNotebook.name:
        if (this.$route.name !== routes.MyNotebook.name) {
          this.$router.push(routes.MyNotebook).catch(() => this.setActive());
        }
        break;
      case "sign-in-google":
        auth
          .signInWithPopup(new firebase.auth.GoogleAuthProvider())
          .catch(err => this.$message.error(err.message))
          .finally(() => this.setActive());
        this.setActive();
        break;
      case "sign-out":
        auth
          .signOut()
          .then(() => {
            if (this.$route.name !== routes.Notebook.name) {
              this.$router.push(routes.Notebook);
            }
          })
          .catch(err => this.$message.error(err.message))
          .finally(() => this.setActive());
        break;
      case routes.Setting.name:
        if (this.$route.name !== routes.Setting.name) {
          this.$router.push(routes.Setting);
        }
        break;
      case "new-notebook":
        eventBus.$emit(Bus.NewNotebook.drawerStart);
        this.setActive();
        break;
    }
  }

  private created() {
    this.setActive();
  }
}
</script>

<style scoped lang="scss">
.el-aside {
  width: 64px;
}
.aside-menu {
  width: 64px;
  height: 100vh;
  border: 0;
  position: fixed;
}
.el-submenu,
.el-menu-item {
  text-align: center;
}
.font-awesome {
  color: #909399;
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
