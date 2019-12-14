<template>
  <div>
    <markdown
      v-if="editor && editor.type === 'markdown'"
      :value="editor.value"
      :width="windowWidth"
    />
    <erd
      v-else-if="editor && editor.type === 'vuerd'"
      :value="editor.value"
      :width="windowWidth"
      :height="windowHeight"
    />
    <h1 v-else class="none">
      {{ message }}
    </h1>
    <div class="mark">
      <el-tooltip effect="dark" content="Full Screen" placement="top-end">
        <a class="link" :href="currentHref" target="_blank">
          <el-button
            type="primary"
            icon="el-icon-full-screen"
            size="mini"
            circle
          />
        </a>
      </el-tooltip>
      <el-link
        class="link"
        type="primary"
        href="https://vuerd.io"
        target="_blank"
      >
        vuerd.io
      </el-link>
    </div>
  </div>
</template>

<script lang="ts">
import { COLOR_LOADING } from "@/data/color";
import { findTreeById } from "@/api/TreeAPI";
import { TreeNodeModelImpl } from "@/api/TreeModel";
import { Editor, treeNodeModelToEditor } from "@/models/Editor";
import { fromEvent, Observable, Subscription } from "rxjs";
import { FirestoreError } from "@/plugins/firebase";
import { Component, Prop, Vue } from "vue-property-decorator";
import Markdown from "@/components/Document/ContainerView/Markdown.vue";
import Erd from "@/components/Export/ERD.vue";

@Component({
  components: {
    Markdown,
    Erd
  }
})
export default class Export extends Vue {
  private editor: Editor | null = null;
  private message: string = "";
  private windowWidth: number = window.innerWidth;
  private windowHeight: number = window.innerHeight;
  private resize$: Observable<Event> = fromEvent(window, "resize");
  private subResize!: Subscription;

  private currentHref: string = window.location.href;

  private getTree() {
    const loading = this.$loading({
      lock: true,
      background: COLOR_LOADING
    });
    findTreeById(this.$route.params.notebookId, this.$route.params.id)
      .then(doc => {
        if (doc.exists) {
          this.editor = treeNodeModelToEditor(new TreeNodeModelImpl(doc));
        } else {
          this.message = "Not found document";
        }
      })
      .catch((err: FirestoreError) => (this.message = err.message))
      .finally(() => loading.close());
  }

  private onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  private created() {
    this.getTree();
  }

  private mounted() {
    this.subResize = this.resize$.subscribe(this.onResize);
    window.dispatchEvent(new Event("resize"));
  }

  private destroyed() {
    this.subResize.unsubscribe();
  }
}
</script>

<style scoped lang="scss">
.none {
  position: absolute;
  text-align: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 43px;
  margin: auto;
}
.mark {
  padding: 5px;
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 999999;

  .link {
    display: block;
    text-align: center;
    margin-top: 5px;
  }
}
</style>
