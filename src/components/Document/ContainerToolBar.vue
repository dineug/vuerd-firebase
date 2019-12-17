<template>
  <div class="container-tool-bar">
    <el-button-group>
      <el-button type="info" size="mini" plain>
        <i class="el-icon-share" />
      </el-button>
      <el-button type="info" size="mini" plain>
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
        size="mini"
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
    </el-button-group>
    <comment :height="height" :comments="comments" />
  </div>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import eventBus, { Bus } from "@/ts/EventBus";
import { CommentModel, CommentModelImpl } from "@/api/CommentModel";
import { getCommentsColRef } from "@/api/CommentAPI";
import { getHeartsColRef, heartDetail } from "@/api/NotebookAPI";
import { Component, Prop, Vue } from "vue-property-decorator";
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
  private unsubscribeComment: { (): void; (): void } | null = null;
  private unsubscribeHeart: { (): void; (): void } | null = null;

  private getHeartStatus() {
    if (this.$store.state.user) {
      heartDetail(this.$route.params.id).then(doc => {
        this.heart = doc.exists;
      });
    }
  }

  private getHeartCount() {
    this.unsubscribeHeart = getHeartsColRef(this.$route.params.id).onSnapshot(
      snapshot => {
        this.heartCount = snapshot.size;
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

  i {
    font-size: 1.5rem;
  }

  .btn-comment {
    & /deep/ .el-badge__content {
      border-width: 0;
    }
  }

  .font-awesome {
    font-size: 24px;
  }
}
</style>
