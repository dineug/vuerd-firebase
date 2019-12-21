<template>
  <div class="container-tool-bar">
    <el-button-group>
      <el-button
        type="info"
        size="small"
        plain
        :disabled="heartDisabled"
        @click="onHeart"
      >
        <font-awesome-icon
          v-if="heartCount === 0"
          class="font-awesome"
          :icon="[heart ? 'fas' : 'far', 'heart']"
        />
        <el-badge v-else class="btn-comment" type="primary" :value="heartCount">
          <font-awesome-icon
            class="font-awesome"
            :icon="[heart ? 'fas' : 'far', 'heart']"
          />
        </el-badge>
      </el-button>
      <el-button
        class="btn-comment"
        type="info"
        size="small"
        plain
        @click="onComment"
      >
        <i v-if="commentCount === 0" class="el-icon-chat-dot-round" />
        <el-badge
          v-else
          class="btn-comment"
          type="primary"
          :value="commentCount"
        >
          <i class="el-icon-chat-dot-round" />
        </el-badge>
      </el-button>
      <el-popover popper-class="share-popper">
        <div class="facebook-btn">
          <font-awesome-icon
            :icon="['fab', 'facebook']"
            @click="onShareFacebook"
          />
        </div>
        <el-button
          class="twitter-btn"
          size="small"
          circle
          @click="onShareTwitter"
        >
          <font-awesome-icon class="font-awesome" :icon="['fab', 'twitter']" />
        </el-button>
        <div id="share-kakao-btn" class="kakao-btn" @click="onShareKakao">
          <img src="@/assets/kakao-logo.png" />
        </div>
        <div class="kakao-story-btn" @click="onShareKakaoStory">
          <img src="@/assets/kakao-story-logo.png" />
        </div>
        <el-button
          type="info"
          size="small"
          circle
          icon="el-icon-link"
          @click="onShareLinkCopy"
        />
        <el-button type="info" size="small" plain slot="reference">
          <i class="el-icon-share" />
        </el-button>
      </el-popover>
    </el-button-group>
    <comment :height="height" :comments="comments" />
  </div>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { popupData } from "@/ts/util";
import eventBus, { Bus } from "@/ts/EventBus";
import { CommentModel, CommentModelImpl } from "@/api/CommentModel";
import { getCommentsColRef } from "@/api/CommentAPI";
import {
  getNotebooksDocRef,
  heartDetail,
  heartAdd,
  heartRemove
} from "@/api/NotebookAPI";
import { Notebook } from "@/api/NotebookModel";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Comment from "@/components/Document/Comment.vue";

@Component({
  components: {
    Comment
  }
})
export default class ContainerToolBar extends Vue {
  @Prop({ type: Number, default: 1000 })
  private height!: number;

  private comments: CommentModel[] = [];
  private commentCount: number = 0;
  private heart: boolean = false;
  private heartCount: number = 0;
  private heartDisabled: boolean = false;
  private unsubscribeComment: { (): void; (): void } | null = null;
  private unsubscribeHeart: { (): void; (): void } | null = null;
  private notebook: Notebook | null = null;
  private popup: Window | null = null;
  private kakao = window.Kakao;

  get auth(): boolean {
    return this.$store.state.user !== null;
  }

  @Watch("auth")
  private watchAuth() {
    this.getHeartStatus();
  }

  private getHeartStatus() {
    if (this.auth) {
      heartDetail(this.$route.params.id).then(doc => {
        this.heart = doc.exists;
      });
    } else {
      this.heart = false;
    }
  }

  private getHeartCount() {
    this.unsubscribeHeart = getNotebooksDocRef(
      this.$route.params.id
    ).onSnapshot(
      snapshot => {
        if (snapshot.exists) {
          this.notebook = snapshot.data() as Notebook;
          this.heartCount = this.notebook.heartCount;
        }
      },
      err =>
        this.$notify.error({
          title: "Error",
          message: err.message
        })
    );
  }

  private getComments() {
    this.unsubscribeComment = getCommentsColRef(this.$route.params.id)
      .orderBy("createdAt", "asc")
      .onSnapshot(
        snapshot => {
          this.comments = [];
          this.commentCount = snapshot.size;
          snapshot.forEach(doc =>
            this.comments.push(new CommentModelImpl(doc))
          );
        },
        err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
      );
  }

  // ==================== Event Handler ===================
  private onComment() {
    log.debug("Document onComment");
    eventBus.$emit(Bus.Comment.drawerStart);
  }

  private onHeart() {
    if (this.auth) {
      this.heartDisabled = true;
      if (this.heart) {
        heartRemove(this.$route.params.id)
          .then(() => {
            this.heart = false;
            this.heartCount--;
          })
          .catch(err =>
            this.$notify.error({
              title: "Error",
              message: err.message
            })
          )
          .finally(() => (this.heartDisabled = false));
      } else {
        heartAdd(this.$route.params.id)
          .then(() => {
            this.heart = true;
            this.heartCount++;
          })
          .catch(err =>
            this.$notify.error({
              title: "Error",
              message: err.message
            })
          )
          .finally(() => (this.heartDisabled = false));
      }
    } else {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.signIn") as string
      });
    }
  }

  private onShareLinkCopy() {
    const textarea = document.createElement("textarea");
    textarea.value = location.href;
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 999);
    document.execCommand("copy");
    textarea.remove();
    this.$notify.success({
      title: "Success",
      message: this.$t("linkCopy") as string,
      duration: 3000
    });
  }

  private onShareFacebook() {
    window.FB.ui({
      method: "share",
      href: location.href,
      hashtag: "#vuerd"
    });
  }

  private onShareTwitter() {
    const params: string[] = [
      `url=${encodeURI(location.href)}`,
      "hashtags=vuerd"
    ];
    if (this.notebook !== null) {
      params.push(`text=${encodeURI(this.notebook.title)}`);
    }
    this.popup = open(
      `https://twitter.com/intent/tweet?${params.join("&")}`,
      "share",
      popupData(600, 450).toString()
    );
  }

  private onShareKakao() {
    if (this.notebook) {
      this.kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: this.notebook.title,
          description: this.notebook.description,
          imageUrl: this.notebook.image
            ? this.notebook.image
            : "https://vuerd.io/vuerd.png",
          link: {
            mobileWebUrl: location.href,
            webUrl: location.href
          }
        },
        social: {
          likeCount: this.heartCount,
          commentCount: this.commentCount
        },
        buttons: [
          {
            title: "웹으로 보기",
            link: {
              mobileWebUrl: location.href,
              webUrl: location.href
            }
          }
        ]
      });
    }
  }

  private onShareKakaoStory() {
    if (this.notebook) {
      this.kakao.Story.share({
        url: location.href,
        text: `${this.notebook.title} #vuerd`
      });
    }
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.getComments();
    this.getHeartCount();
    this.getHeartStatus();
  }

  private destroyed() {
    if (this.unsubscribeComment !== null) {
      this.unsubscribeComment();
    }
    if (this.unsubscribeHeart !== null) {
      this.unsubscribeHeart();
    }
    if (this.popup !== null) {
      this.popup.close();
    }
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.container-tool-bar {
  position: absolute;
  top: 0;
  width: 100%;
  height: 40px;
  background-color: white;
  box-sizing: border-box;
  border-bottom: 1px solid #e5e5e5;

  .btn-comment {
    & /deep/ .el-badge__content {
      border-width: 0;
    }
  }

  i,
  .font-awesome {
    font-size: 20px;
  }
}
</style>
