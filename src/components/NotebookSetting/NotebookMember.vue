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
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('role')" width="150">
          <template slot-scope="scope">
            <role-select :value="scope.row.role" :disabled="ownerRole" />
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
import log from "@/ts/Logger";
import {
  Member,
  MemberAdd,
  Notebook,
  findAllMemberBy,
  memberInvitation
} from "@/api/NotebookAPI";
import { autocomplete, Member as InvitationMember } from "@/api/InvitationAPI";
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
  private notebook!: Notebook;

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
  private members: Member[] = [];
  private tempInvitationMembers: InvitationMember[] = [];
  private invitationMembers: InvitationMember[] = [];

  get ownerRole(): boolean {
    return this.notebook.roles[this.$store.state.user.uid] !== "owner";
  }

  @Watch("email")
  private watchEmail() {
    this.autocompleteEmail$.next(this.email);
  }

  private getMembers() {
    findAllMemberBy(this.$route.params.id).then(querySnapshot => {
      this.members = [];
      querySnapshot.docs.forEach(doc => {
        const member = doc.data() as Member;
        if (member) {
          member.id = doc.id;
          this.members.push(member);
        }
      });
    });
  }

  private getInvitationMember(tag: Tag): InvitationMember | null {
    let result: InvitationMember | null = null;
    for (const member of this.tempInvitationMembers) {
      if (member.email === tag.text) {
        result = member;
        break;
      }
    }
    return result;
  }

  private leaveRole(member: Member): boolean {
    if (member.id === this.$store.state.user.uid) {
      return false;
    }
    return this.notebook.roles[this.$store.state.user.uid] !== "owner";
  }

  private validationRule(tag: Tag): boolean {
    return this.members.some(member => member.email === tag.text);
  }

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

  private onDeleteMember(member: Member) {
    log.debug("NotebookMember onDeleteMember", member);
    this.$confirm(this.$t("confirm.deleteMember") as string, "Warning", {
      confirmButtonText: this.$t("ok") as string,
      cancelButtonText: this.$t("cancel") as string,
      type: "warning"
    })
      .then(() => {
        this.$message({
          type: "success",
          message: this.$t("deleted") as string
        });
      })
      .catch(() => {});
  }

  private onAutocompleteEmail(keyword: string) {
    log.debug("NotebookMember onAutocompleteEmail", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.tempInvitationMembers = [];
      this.autocompleteEmails = querySnapshot.docs.map(doc => {
        const user = doc.data() as InvitationMember;
        user.id = doc.id;
        this.tempInvitationMembers.push(user);
        return { text: user.email } as Tag;
      });
    });
  }

  private onInvitation() {
    log.debug("NotebookMember onInvitation");
    if (this.invitationMembers.length === 0) {
      this.$message.warning(this.$t("valid.member") as string);
      log.debug(this.$refs.invitation);
      const vm = this.$refs.invitation as Vue;
      const input = vm.$el.querySelector("input");
      if (input) {
        input.focus();
      }
    } else {
      const loading = this.$loading({
        lock: true,
        text: this.$t("loading.inviting") as string,
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      memberInvitation(this.$route.params.id, this
        .invitationMembers as MemberAdd[])
        .then(() => {
          this.getMembers();
        })
        .catch(err => {
          this.$message.error(err.message);
        })
        .finally(() => loading.close());
    }
  }

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
}
</script>

<style scoped lang="scss"></style>
