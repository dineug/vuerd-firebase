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
        :content="$t('notebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="Notebook">
          <i class="el-icon-notebook-2"></i>
          <span>{{ $t("notebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('myNotebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="MyNotebook">
          <i class="el-icon-notebook-1"></i>
          <span>{{ $t("myNotebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('newNotebook')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="new-notebook">
          <i class="el-icon-document-add"></i>
          <span>{{ $t("newNotebook") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('setting')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="Setting">
          <i class="el-icon-setting"></i>
          <span>{{ $t("setting") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('notification')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-popover
          popper-class="notification-popover"
          placement="right"
          @show="onNotification"
          @hide="onNotificationHide"
        >
          <el-timeline>
            <el-timeline-item
              v-if="notifications.length === 0"
              key="notification-none"
            >
              <el-card>
                <p>{{ $t("noNotification") }}</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item
              v-else
              v-for="notification in notifications"
              :key="notification.id"
              :timestamp="dateMinutesFormat(notification.createdAt)"
            >
              <el-card>
                <p v-if="notification.action === 'comment'">
                  <el-link type="warning" @click="onMove(notification)">
                    {{ notification.message }}
                  </el-link>
                </p>
                <p v-else>{{ notification.message }}</p>
                <el-link
                  v-if="notification.action !== 'invitation'"
                  type="primary"
                  @click="onRead(notification)"
                >
                  {{ $t("read") }}
                </el-link>
                <el-button-group
                  v-else-if="notification.action === 'invitation'"
                >
                  <el-button
                    type="primary"
                    @click="onInvitationAccept(notification)"
                  >
                    {{ $t("accept") }}
                  </el-button>
                  <el-button @click="onInvitationCancel(notification)">
                    {{ $t("cancel") }}
                  </el-button>
                </el-button-group>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-menu-item index="notification" slot="reference">
            <el-badge
              v-if="notificationCount !== 0"
              class="badge-alarm"
              :value="notificationCount"
            >
              <i class="el-icon-message-solid"></i>
            </el-badge>
            <i v-else class="el-icon-message-solid"></i>
          </el-menu-item>
        </el-popover>
      </el-tooltip>
      <el-tooltip
        v-if="user !== null"
        :content="$t('signOut')"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="sign-out">
          <font-awesome-icon class="font-awesome" icon="sign-out-alt" />
          <span>{{ $t("signOut") }}</span>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip v-else :content="$t('signIn')" placement="left">
        <el-popover placement="right">
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
          <el-menu-item index="sign-in" slot="reference">
            <font-awesome-icon class="font-awesome" icon="sign-in-alt" />
          </el-menu-item>
        </el-popover>
      </el-tooltip>
      <el-tooltip
        content="Github issues"
        placement="left"
        :open-delay="openDelay"
      >
        <el-menu-item index="github">
          <font-awesome-icon class="font-awesome" :icon="['fab', 'github']" />
          <span>github</span>
        </el-menu-item>
      </el-tooltip>
    </el-menu>
    <new-notebook />
  </el-aside>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import {
  COLOR_SIDEBAR,
  COLOR_SIDEBAR_ACTIVE,
  COLOR_SIDEBAR_TEXT
} from "@/data/color";
import firebase, {
  auth,
  User,
  FirestoreError,
  AuthError
} from "@/plugins/firebase";
import eventBus, { Bus } from "@/ts/EventBus";
import {
  NotificationModel,
  NotificationModelImpl,
  NotificationPaging
} from "@/api/NotificationModel";
import {
  notificationPaging,
  notificationReadModify
} from "@/api/NotificationAPI";
import { User as UserInfo } from "@/api/UserModel";
import { invitationAccept, invitationCancel } from "@/api/InvitationAPI";
import { dateMinutesFormat } from "@/ts/filter";
import { ElLoadingComponent } from "element-ui/types/loading";
import { routes } from "@/router";
import { Component, Prop, Vue } from "vue-property-decorator";
import NewNotebook from "@/components/common/NewNotebook.vue";

const enum Provider {
  google = "google"
}

@Component({
  components: {
    NewNotebook
  }
})
export default class Sidebar extends Vue {
  private githubIssues: HTMLAnchorElement = document.createElement("a");
  private openDelay: number = 0;
  private backgroundColor: string = COLOR_SIDEBAR;
  private textColor: string = COLOR_SIDEBAR_TEXT;
  private activeTextColor: string = COLOR_SIDEBAR_ACTIVE;
  private active: string = routes.Notebook.name;

  private notifications: NotificationModel[] = [];
  private notificationPaging: NotificationPaging | null = {
    last: null,
    read: false
  };
  private notificationProcess: boolean = false;
  private notificationLoading: ElLoadingComponent | null = null;

  get user(): User | null {
    return this.$store.state.user;
  }

  get notificationCount(): number {
    const info: UserInfo | null = this.$store.state.info;
    if (info) {
      return info.notification;
    }
    return 0;
  }

  private dateMinutesFormat = dateMinutesFormat;

  private getNotifications() {
    if (!this.notificationProcess && this.notificationPaging) {
      this.notificationProcess = true;
      notificationPaging(this.notificationPaging)
        .then(querySnapshot => {
          const len = querySnapshot.docs.length;
          if (len === 0) {
            this.notificationPaging = null;
          } else if (this.notificationPaging) {
            this.notificationPaging.last = querySnapshot.docs[len - 1];
            querySnapshot.forEach(doc => {
              this.notifications.push(new NotificationModelImpl(doc));
            });
          }
        })
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        )
        .finally(() => {
          this.notificationProcess = false;
          if (this.notificationLoading) {
            this.notificationLoading.close();
            this.notificationLoading = null;
          }
        });
    }
  }

  private setActive() {
    this.active = "";
    this.$nextTick(() => {
      if (this.$route.name) {
        this.active = this.$route.name;
      }
    });
  }

  private notificationReload() {
    this.notifications = [];
    this.notificationPaging = {
      last: null,
      read: false
    };
    this.getNotifications();
  }

  // ==================== Event Handler ===================
  private onSelect(key: string) {
    log.debug("Sidebar onSelect", key);
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
      case "sign-out":
        auth
          .signOut()
          .then(() => {
            if (this.$route.name !== routes.Notebook.name) {
              this.$router.push(routes.Notebook);
            }
          })
          .catch(err =>
            this.$notify.error({
              title: "Error",
              message: err.message
            })
          )
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
      case "github":
        this.githubIssues.click();
        this.setActive();
        break;
      case "sign-in":
      case "notification":
        this.setActive();
        break;
    }
  }

  private onSignIn(provider: Provider) {
    switch (provider) {
      case Provider.google:
        auth
          .signInWithPopup(new firebase.auth.GoogleAuthProvider())
          .catch((err: AuthError) => {
            if (err.code !== "auth/popup-closed-by-user") {
              this.$notify.error({
                title: err.code,
                message: err.message
              });
            }
          })
          .finally(() => this.setActive());
        break;
    }
  }

  private onScroll() {
    this.getNotifications();
  }

  private onNotification() {
    log.debug("Sidebar onNotification");
    this.notificationLoading = this.$loading({
      target: ".notification-popover"
    });
    this.notificationReload();
    const el = document.querySelector(".notification-popover");
    if (el) {
      el.addEventListener("scroll", this.onScroll);
    }
  }

  private onNotificationHide() {
    const el = document.querySelector(".notification-popover");
    if (el) {
      el.removeEventListener("scroll", this.onScroll);
    }
  }

  private onInvitationAccept(notification: NotificationModel) {
    const loading = this.$loading({
      target: ".notification-popover"
    });
    invitationAccept(notification)
      .then(() => this.notificationReload())
      .catch((err: FirestoreError) => {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
        if (err.code === "permission-denied") {
          notificationReadModify(notification).then(() =>
            this.notificationReload()
          );
        }
      })
      .finally(() => loading.close());
  }

  private onInvitationCancel(notification: NotificationModel) {
    const loading = this.$loading({
      target: ".notification-popover"
    });
    invitationCancel(notification)
      .then(() => this.notificationReload())
      .catch((err: FirestoreError) => {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
        if (err.code === "permission-denied") {
          notificationReadModify(notification).then(() =>
            this.notificationReload()
          );
        }
      })
      .finally(() => loading.close());
  }

  private onRead(notification: NotificationModel) {
    const loading = this.$loading({
      target: ".notification-popover"
    });
    notificationReadModify(notification)
      .then(() => this.notificationReload())
      .catch(err =>
        this.$notify.error({
          title: "Error",
          message: err.message
        })
      )
      .finally(() => loading.close());
  }

  private onMove(notification: NotificationModel) {
    if (notification.key !== null) {
      this.$router.push({
        name: routes.Document.name,
        params: {
          id: notification.key
        }
      });
    }
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.githubIssues.setAttribute("target", "_blank");
    this.githubIssues.setAttribute(
      "href",
      "https://github.com/vuerd/vuerd-firebase/issues"
    );
    this.setActive();
  }

  private destroyed() {
    this.githubIssues.remove();
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.el-aside {
  width: 64px;
}
.badge-alarm /deep/ .el-badge__content {
  border-width: 0;
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
  font-size: 18px;
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
