<template>
  <div>
    <vuerd-core
      v-if="load"
      :themeName="themeName"
      @changeTheme="onChangeTheme"
    />
    <export-iframe :height="windowHeight" />
  </div>
</template>

<script lang="ts">
import "@/plugins/vuerd-core";
import { Editor as ConfigEditor } from "@/api/UserModel";
import { editorModify, editorDetail } from "@/api/UserAPI";
import { getTreesColRef } from "@/api/TreeAPI";
import { TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import log from "@/ts/Logger";
import store, { Commit } from "@/store";
import { popupData } from "@/ts/util";
import eventBus, { Bus } from "@/ts/EventBus";
import { fromEvent, Observable, Subscription } from "rxjs";
import { Component, Prop, Vue } from "vue-property-decorator";
import ExportIframe from "@/components/Editor/ExportIframe.vue";

@Component({
  components: {
    ExportIframe
  }
})
export default class Editor extends Vue {
  private themeName: string = "AtomOneDark";
  private load: boolean = true;
  private unsubscribe: { (): void; (): void } | null = null;
  private windowHeight: number = window.innerHeight;
  private resize$: Observable<Event> = fromEvent(window, "resize");
  private subResize!: Subscription;
  private preview: Window | null = null;

  private getConfigEditor() {
    editorDetail().then(doc => {
      if (doc.exists) {
        const editor = doc.data() as ConfigEditor;
        this.themeName = editor.themeName;
      }
    });
  }

  private getTrees() {
    this.unsubscribe = getTreesColRef(this.$route.params.id).onSnapshot(
      snapshot => {
        const treeList: TreeNodeModel[] = [];
        snapshot.forEach(doc => {
          treeList.push(new TreeNodeModelImpl(doc));
        });
        this.$store.commit(Commit.setTreeList, treeList);
        this.previewSend();
      },
      err => {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
        this.$router.back();
      }
    );
  }

  private previewSend() {
    if (this.preview !== null) {
      this.preview.previewSend(this.$store.state.treeList);
    }
  }

  // ==================== Event Handler ===================
  private onResize() {
    this.windowHeight = window.innerHeight;
  }

  private onChangeTheme(themeName: string) {
    editorModify({ themeName });
  }

  private onReload() {
    this.load = false;
    this.$nextTick(() => {
      this.load = true;
    });
  }

  private onPreview() {
    if (this.preview !== null) {
      this.preview.close();
      this.preview = null;
    }
    this.preview = open(
      `/notebooks/${this.$route.params.id}/document/preview`,
      "documentPreview",
      popupData(900, 900).toString()
    );
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    log.debug("Editor created", this.$route.params.id);
    this.$store.commit(Commit.setNotebookId, this.$route.params.id);
    this.getTrees();
    this.getConfigEditor();
    eventBus.$on(Bus.Editor.reload, this.onReload);
    eventBus.$on(Bus.Editor.preview, this.onPreview);
    window.previewCreated = () => {
      this.previewSend();
    };
  }

  private mounted() {
    this.subResize = this.resize$.subscribe(this.onResize);
    window.dispatchEvent(new Event("resize"));
  }

  private destroyed() {
    log.debug("Editor destroyed");
    this.subResize.unsubscribe();
    this.$store.commit(Commit.setTreeList, []);
    eventBus.$off(Bus.Editor.reload, this.onReload);
    eventBus.$off(Bus.Editor.preview, this.onPreview);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.preview !== null) {
      this.preview.close();
      this.preview = null;
    }
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
