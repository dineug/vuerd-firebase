<template>
  <el-drawer :title="$t('comment')" :visible.sync="drawer" size="50%">
    <div class="comment-box" :style="commentBoxStyle">
      <el-timeline>
        <el-timeline-item v-if="comments.length === 0" key="comment-none">
          <el-card>
            <p>{{ $t("noComment") }}</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item
          v-else
          v-for="comment in comments"
          :key="comment.id"
          :timestamp="dateMinutesFormat(comment.createdAt)"
          :type="myComment(comment) ? 'primary' : ''"
        >
          <el-card>
            <div class="user-info">
              <el-avatar :src="comment.image" />
              <el-tooltip
                effect="dark"
                :content="comment.email"
                placement="top-start"
              >
                <div class="user-nickname">{{ comment.nickname }}</div>
              </el-tooltip>
            </div>
            <el-input
              v-if="
                myComment(comment) &&
                  editComment &&
                  editComment.id === comment.id
              "
              id="comment-modify-input"
              type="textarea"
              :rows="5"
              :placeholder="$t('writeComment')"
              resize="none"
              v-model="editMessage"
            />
            <div class="message-box" v-else>{{ comment.message }}</div>
            <el-button-group
              v-if="
                myComment(comment) &&
                  editComment &&
                  editComment.id === comment.id
              "
            >
              <el-button type="primary" size="small" @click="onUpdate(comment)">
                {{ $t("update") }}
              </el-button>
              <el-button size="small" @click="onEditCancel">
                {{ $t("cancel") }}
              </el-button>
            </el-button-group>
            <el-button-group v-else-if="myComment(comment)">
              <el-button
                icon="el-icon-edit"
                size="small"
                @click="onEdit(comment)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="small"
                @click="onDelete(comment)"
              />
            </el-button-group>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    <el-form class="comment-form">
      <el-form-item>
        <el-input
          type="textarea"
          :rows="5"
          :placeholder="auth ? $t('writeComment') : $t('valid.signIn')"
          resize="none"
          ref="message"
          :disabled="!auth"
          v-model="message"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="disabled" @click="onCreate">
          {{ $t("create") }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { dateMinutesFormat } from "@/ts/filter";
import eventBus, { Bus } from "@/ts/EventBus";
import { CommentModel } from "@/api/CommentModel";
import { save, commentUpdate, deleteById } from "@/api/CommentAPI";
import { Component, Prop, Vue } from "vue-property-decorator";

const HEADER_HEIGHT = 45;
const COMMENT_FORM = 240;

@Component
export default class Comment extends Vue {
  @Prop({ type: Array, default: () => [] })
  private comments!: CommentModel[];
  @Prop({ type: Number, default: 1000 })
  private height!: number;

  private drawer: boolean = false;
  private message: string = "";
  private disabled: boolean = false;
  private editComment: CommentModel | null = null;
  private editMessage: string = "";

  get commentBoxStyle(): string {
    const height = this.height - HEADER_HEIGHT - COMMENT_FORM;
    return `height: ${height}px;`;
  }

  get auth(): boolean {
    return this.$store.state.user !== null;
  }

  private reset() {
    this.message = "";
  }

  private valid(): boolean {
    let result = false;
    if (this.message.trim() === "") {
      this.message = "";
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.comments") as string
      });
      (this.$refs.message as HTMLInputElement).focus();
    } else {
      result = true;
    }
    return result;
  }

  private dateMinutesFormat = dateMinutesFormat;

  private myComment(comment: CommentModel): boolean {
    return this.$store.state.user && comment.uid === this.$store.state.user.uid;
  }

  // ==================== Event Handler ===================
  private onCreate() {
    if (!this.auth) {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.signIn") as string
      });
    } else if (this.valid()) {
      this.disabled = true;
      save(this.$route.params.id, this.message)
        .then(() => (this.message = ""))
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        )
        .finally(() => (this.disabled = false));
    }
  }

  private onDelete(comment: CommentModel) {
    this.$confirm(this.$t("confirm.deleteComments") as string, "Warning", {
      confirmButtonText: this.$t("ok") as string,
      cancelButtonText: this.$t("cancel") as string,
      type: "warning"
    })
      .then(() => {
        deleteById(this.$route.params.id, comment.id)
          .then(() =>
            this.$notify.success({
              title: "Success",
              message: this.$t("deleted") as string,
              duration: 3000
            })
          )
          .catch(err =>
            this.$notify.error({
              title: "Error",
              message: err.message
            })
          );
      })
      .catch(() => {});
  }

  private onEdit(comment: CommentModel) {
    this.editMessage = comment.message;
    this.editComment = comment;
    this.$nextTick(() => {
      const input = document.querySelector(
        "#comment-modify-input"
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    });
  }

  private onEditCancel() {
    this.editMessage = "";
    this.editComment = null;
  }

  private onUpdate(comment: CommentModel) {
    if (this.editMessage.trim() === "") {
      this.editMessage = "";
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.comments") as string
      });
      const input = document.querySelector(
        "#comment-modify-input"
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    } else {
      commentUpdate(this.$route.params.id, comment.id, this.editMessage)
        .then(() => this.onEditCancel())
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        );
    }
  }

  private onDrawerStart() {
    log.debug("Comment onDrawerStart");
    this.reset();
    this.drawer = !this.drawer;
    setTimeout(() => {
      (this.$refs.message as HTMLInputElement).focus();
    }, 100);
  }

  private onDrawerEnd() {
    log.debug("Comment onDrawerEnd");
    this.drawer = false;
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    log.debug("Comment created");
    eventBus.$on(Bus.Comment.drawerStart, this.onDrawerStart);
    eventBus.$on(Bus.Comment.drawerEnd, this.onDrawerEnd);
  }

  private destroyed() {
    log.debug("Comment destroyed");
    eventBus.$off(Bus.Comment.drawerStart, this.onDrawerStart);
    eventBus.$off(Bus.Comment.drawerEnd, this.onDrawerEnd);
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.comment-box {
  box-sizing: border-box;
  padding: 20px;
  overflow-y: auto;

  .user-info {
    display: flex;
    align-items: center;

    .user-nickname {
      display: inline-block;
      margin-left: 5px;
    }
  }

  .message-box {
    word-wrap: break-word;
    white-space: pre-line;
  }
}
.comment-form {
  box-sizing: border-box;
  padding: 20px;
}
</style>
