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
        @tags-changed="onChangeEamils"
      />
    </el-form-item>
    <el-form-item :label="$t('member')">
      <el-table :data="members">
        <el-table-column width="50">
          <template slot-scope="scope">
            <el-avatar :src="scope.row.image" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('name')">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('nickname')">
          <template slot-scope="scope">
            <span>{{ scope.row.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('email')">
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
            <role-select :value="scope.row.role" />
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template slot-scope="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
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
import { Member, findAllMemberBy } from "@/api/NotebookAPI";
import { autocomplete, Member as InvitationMember } from "@/api/InvitationAPI";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import { Tag, Validation } from "@/models/vue-tags-input";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import VueTagsInput from "@johmun/vue-tags-input";
import RoleSelect from "@/components/NotebookSetting/RoleSelect.vue";

@Component({
  components: {
    VueTagsInput,
    RoleSelect
  }
})
export default class NotebookMember extends Vue {
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

  @Watch("email")
  private watchEmail() {
    this.autocompleteEmail$.next(this.email);
  }

  private getMembers() {
    findAllMemberBy(this.$route.params.id).then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        const member = doc.data() as Member;
        if (member) {
          this.members.push(member);
        }
      });
    });
  }

  private validationRule(tag: Tag): boolean {
    return this.members.some(member => member.email === tag.text);
  }

  private onChangeEamils(newEmails: Tag[]) {
    this.emails = newEmails;
    this.autocompleteEmails = [];
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
    log.debug("NotebookSetting onAutocompleteEmail", keyword);
    autocomplete(keyword).then(querySnapshot => {
      this.autocompleteEmails = querySnapshot.docs.map(doc => {
        const user = doc.data() as InvitationMember;
        return { text: user.email } as Tag;
      });
    });
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

<style scoped lang="scss">
.tag-box {
  & /deep/ .ti-tag,
  & /deep/ .ti-selected-item {
    background-color: $color-tag;
  }
  & /deep/ .duplication {
    background-color: $color-tag-duplication;
    text-decoration: line-through;
  }
}
</style>
