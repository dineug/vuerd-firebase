<template>
  <el-form style="padding: 20px;" label-width="150px">
    <el-form-item :label="$t('memberInvitation')">
      <vue-tags-input
        class="tag-box"
        v-model="email"
        :tags="emails"
        :autocomplete-items="autocompleteEmails"
        :validation="validation"
        placeholder="Add Member"
        add-only-from-autocomplete
        :disabled="ownerRole"
        ref="invitation"
        @tags-changed="onChangeEamils"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="ownerRole" @click="onInvitation">
        {{ $t("invitation") }}
      </el-button>
    </el-form-item>
    <el-form-item :label="$t('member')">
      <el-table :data="members">
        <el-table-column width="50">
          <template slot-scope="scope">
            <el-avatar :src="scope.row.image" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('name')" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('nickname')" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('email')" width="300">
          <template slot-scope="scope">
            <span>{{ scope.row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('invitationStatus')" width="150">
          <template slot-scope="scope">
            <span>{{ $t(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('role')" width="150">
          <template slot-scope="scope">
            <role-select
              :value="scope.row.role"
              :disabled="ownerRole"
              @change="onChangeRole($event, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template slot-scope="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
              :disabled="leaveRole(scope.row)"
              @click="onDeleteMember(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { COLOR_LOADING } from "@/data/color";
import log from "@/ts/Logger";
import {
  MemberModel,
  MemberModelImpl,
  NotebookModel,
  Role
} from "@/api/NotebookModel";
import {
  MemberModel as InvitationMemberModel,
  MemberModelImpl as InvitationMemberModelImpl
} from "@/api/InvitationModel";
import {
  findAllMemberBy,
  memberInvitation,
  deleteMemberById,
  memberRoleUpdate
} from "@/api/NotebookAPI";
import { autocomplete } from "@/api/InvitationAPI";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { Tag, Validation } from "@/models/vue-tags-input";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import VueTagsInput from "@johmun/vue-tags-input";
import RoleSelect from "@/components/NotebookSetting/RoleSelect.vue";

@Component({
  components: {
    VueTagsInput,
    RoleSelect
  }
})
export default class NotebookMember extends Vue {
  @Prop({ type: Object })
  private notebook!: NotebookModel;

  private autocompleteEmail$: Subject<string> = new Subject();
  private subAutocompleteEmail!: Subscription;
  private email: string = "";
  private emails: Tag[] = [];
  private autocompleteEmails: Tag[] = [];
  private validation: Validation[] = [
    {
      classes: "duplication",
      rule: this.validationRule
    }
  ];
  private members: MemberModel[] = [];
  private tempInvitationMembers: InvitationMemberModel[] = [];
  private invitationMembers: InvitationMemberModel[] = [];

  get ownerRole(): boolean {
    return this.notebook.roles[this.$store.state.user.uid] !== "owner";
  }

  @Watch("email")
  private watchEmail() {
    this.autocompleteEmail$.next(this.email);
  }

  @Watch("members")
  private watchMembers() {
    if (this.members.length !== 0) {
      if (
        !this.members.some(member => member.id === this.$store.state.user.uid)
      ) {
        this.$notify.error({
          title: "Error",
          message: this.$t("notFound.role") as string
        });
        this.$router.back();
      }
    }
  }

  private validRole(role: Role, member: MemberModel): boolean {
    let result = false;
    if (
      role !== "owner" &&
      member.id === this.$store.state.user.uid &&
      this.members.filter(
        value =>
          value.status === "accept" &&
          value.role === "owner" &&
          value.id !== member.id
      ).length === 0
    ) {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.memberRole") as string
      });
    } else {
      result = true;
    }
    return result;
  }

  private validDeleteMember(member: MemberModel): boolean {
    let result = false;
    if (
      member.id === this.$store.state.user.uid &&
      this.members.filter(
        value => value.status === "accept" && value.id !== member.id
      ).length === 0
    ) {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.memberDelete") as string
      });
    } else if (
      member.id === this.$store.state.user.uid &&
      this.members.filter(
        value =>
          value.status === "accept" &&
          value.role === "owner" &&
          value.id !== member.id
      ).length === 0
    ) {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.memberRole") as string
      });
    } else {
      result = true;
    }
    return result;
  }

  private getMembers() {
    log.debug("NotebookMember getMembers");
    findAllMemberBy(this.$route.params.id).then(querySnapshot => {
      this.members = [];
      querySnapshot.docs.forEach(doc => {
        this.members.push(new MemberModelImpl(doc));
      });
    });
  }

  private getInvitationMember(tag: Tag): InvitationMemberModel | null {
    let result: InvitationMemberModel | null = null;
    for (const member of this.tempInvitationMembers) {
      if (member.email === tag.text) {
        result = member;
        break;
      }
    }
    return result;
  }

  private leaveRole(member: MemberModel): boolean {
    if (member.id === this.$store.state.user.uid) {
      return false;
    }
    return this.notebook.roles[this.$store.state.user.uid] !== "owner";
  }

  private validationRule(tag: Tag): boolean {
    return this.members.some(member => member.email === tag.text);
  }

  // ==================== Event Handler ===================
  private onChangeEamils(newEmails: Tag[]) {
    const afterEmails = newEmails.filter(
      email => email.tiClasses && email.tiClasses.indexOf("duplication") === -1
    );
    const beforeEmails = this.emails;
    const minus: Tag[] = [];
    const plus: Tag[] = [];
    afterEmails.forEach(after => {
      if (!beforeEmails.some(before => after.text === before.text)) {
        plus.push(after);
      }
    });
    beforeEmails.forEach(before => {
      if (!afterEmails.some(after => after.text === before.text)) {
        minus.push(before);
      }
    });
    this.invitationMembers = this.invitationMembers.filter(
      member => !minus.some(value => value.text === member.email)
    );
    plus.forEach(value => {
      const member = this.getInvitationMember(value);
      if (member) {
        this.invitationMembers.push(member);
      }
    });
    this.emails = afterEmails;
    this.autocompleteEmails = [];
    this.tempInvitationMembers = [];
  }

  private onDeleteMember(member: MemberModel) {
    log.debug("NotebookMember onDeleteMember", member);
    if (this.validDeleteMember(member)) {
      this.$confirm(this.$t("confirm.deleteMember") as string, "Warning", {
        confirmButtonText: this.$t("ok") as string,
        cancelButtonText: this.$t("cancel") as string,
        type: "warning"
      })
        .then(() => {
          const loading = this.$loading({
            lock: true,
            background: COLOR_LOADING,
            text: this.$t("loading.deleting") as string
          });
          deleteMemberById(this.notebook.id, member.id)
            .then(() => {
              this.$notify.success({
                title: "Success",
                message: this.$t("deleted") as string,
                duration: 3000
              });
              if (member.id === this.$store.state.user.uid) {
                this.$router.back();
              } else {
                this.getMembers();
              }
            })
            .catch(err =>
              this.$notify.error({
                title: "Error",
                message: err.message
              })
            )
            .finally(() => loading.close());
        })
        .catch(() => {});
    }
  }

  private onChangeRole(role: Role, member: MemberModel) {
    log.debug("NotebookMember onChangeRole", role);
    if (this.validRole(role, member)) {
      member.role = role;
      memberRoleUpdate(this.notebook.id, member.id, role)
        .then(() => {
          this.notebook.roles[member.id] = role;
          this.getMembers();
        })
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        );
    }
  }

  private onAutocompleteEmail(keyword: string) {
    log.debug("NotebookMember onAutocompleteEmail", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.tempInvitationMembers = [];
      this.autocompleteEmails = querySnapshot.docs.map(doc => {
        const user = new InvitationMemberModelImpl(doc);
        this.tempInvitationMembers.push(user);
        return { text: user.email } as Tag;
      });
    });
  }

  private onInvitation() {
    log.debug("NotebookMember onInvitation");
    if (this.invitationMembers.length === 0) {
      this.$notify.warning({
        title: "Valid",
        message: this.$t("valid.member") as string
      });
      const vm = this.$refs.invitation as Vue;
      const input = vm.$el.querySelector("input");
      if (input) {
        input.focus();
      }
    } else {
      const loading = this.$loading({
        lock: true,
        background: COLOR_LOADING,
        text: this.$t("loading.inviting") as string
      });
      memberInvitation(this.$route.params.id, this.invitationMembers)
        .then(() => {
          this.emails = [];
          this.invitationMembers = [];
          this.getMembers();
        })
        .catch(err =>
          this.$notify.error({
            title: "Error",
            message: err.message
          })
        )
        .finally(() => loading.close());
    }
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.subAutocompleteEmail = this.autocompleteEmail$
      .pipe(
        filter(keyword => keyword.length >= 2),
        debounceTime(300)
      )
      .subscribe(this.onAutocompleteEmail);
    this.getMembers();
  }

  private destroyed() {
    this.subAutocompleteEmail.unsubscribe();
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
