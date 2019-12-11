<template>
  <el-container>
    <sidebar />
    <el-container class="document-container">
      <explorer
        :width="explorerWidth"
        :height="windowHeight"
        :trees="trees"
        :search="search"
        @changeSearch="onSearch"
      />
      <div
        class="main"
        :style="{
          left: `${explorerWidth}px`,
          width: `${contentViewWidth}px`,
          height: `${contentViewHeight}px`
        }"
      >
        <container-view
          :width="contentViewWidth"
          :height="contentViewHeight"
          :treeList="treeList"
        />
        <sash
          vertical
          @mousemove="onMousemoveSash"
          @mousedown="onMousedownSash"
        />
      </div>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { getTreesColRef } from "@/api/TreeAPI";
import { convertTreeModel, findParentTreeByChildren } from "@/api/TreeHelper";
import { TreeModel, TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import { fromEvent, Observable, Subscription } from "rxjs";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Sidebar from "./common/Sidebar.vue";
import Explorer from "@/components/Document/Explorer.vue";
import Sash from "@/components/common/Sash.vue";
import ContainerView from "@/components/Document/ContainerView.vue";

const SIDEBAR_WIDTH = 64;
const MARGIN = 10;
const EXPLORER_WIDTH = 200;

const enum Direction {
  left = "left",
  right = "right"
}

@Component({
  components: {
    Sidebar,
    Explorer,
    Sash,
    ContainerView
  }
})
export default class Document extends Vue {
  private explorerWidth: number = EXPLORER_WIDTH;
  private windowWidth: number = window.innerWidth;
  private windowHeight: number = window.innerHeight;
  private resize$: Observable<Event> = fromEvent(window, "resize");
  private subResize!: Subscription;
  private x: number = 0;
  private y: number = 0;
  private treeList: TreeNodeModel[] = [];
  private treeListFilter: TreeNodeModel[] = [];
  private trees: TreeModel[] = [];
  private unsubscribe: { (): void; (): void } | null = null;
  private search: string = "";

  get contentViewWidth(): number {
    return this.windowWidth - this.explorerWidth - SIDEBAR_WIDTH - MARGIN;
  }

  get contentViewHeight(): number {
    return this.windowHeight - MARGIN * 2;
  }

  @Watch("treeList")
  private watchTreeList() {
    log.debug("Document watchTreeList");
    this.treeListFilter = this.treeList.filter(
      tree => tree.name.indexOf(this.search) !== -1
    );
  }

  @Watch("treeListFilter")
  private watchTreeListFilter() {
    log.debug("Document watchTreeListFilter");
    const list = [...this.treeListFilter];
    const tree = convertTreeModel(list);
    this.trees = [tree];
  }

  @Watch("search")
  private watchSearch() {
    log.debug("Document watchSearch");
    this.watchTreeList();
  }

  private getTrees() {
    this.unsubscribe = getTreesColRef(this.$route.params.id).onSnapshot(
      snapshot => {
        const target: TreeNodeModel[] = [];
        const list: TreeNodeModel[] = [];
        snapshot.forEach(doc => {
          const treeNode = new TreeNodeModelImpl(doc);
          list.push(treeNode);
          if (/\.(md|vuerd)$/i.test(treeNode.name)) {
            target.push(treeNode);
          }
        });
        const parent = findParentTreeByChildren(list, target);
        this.treeList = [];
        this.treeList.push.apply(this.treeList, target);
        this.treeList.push.apply(this.treeList, parent);
      },
      err => {
        this.$message.error(err.message);
        this.$router.back();
      }
    );
  }

  // ==================== Event Handler ===================
  private onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  private onMousemoveSash(event: MouseEvent) {
    const direction: Direction =
      event.movementX < 0 ? Direction.left : Direction.right;
    const width = this.explorerWidth + event.movementX;
    const contentViewWidth = this.windowWidth - width - SIDEBAR_WIDTH - MARGIN;
    switch (direction) {
      case Direction.left:
        if (10 < width && event.x < this.x) {
          this.explorerWidth = width;
          this.x += event.movementX;
        }
        break;
      case Direction.right:
        if (EXPLORER_WIDTH < contentViewWidth && event.x > this.x) {
          this.explorerWidth = width;
          this.x += event.movementX;
        }
        break;
    }
  }

  private onMousedownSash(event: MouseEvent) {
    this.x = event.x;
    this.y = event.y;
  }

  private onSearch(keyword: string) {
    log.debug("Document onSearch", keyword);
    this.search = keyword;
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    this.getTrees();
  }

  private mounted() {
    this.subResize = this.resize$.subscribe(this.onResize);
    window.dispatchEvent(new Event("resize"));
  }

  private destroyed() {
    this.subResize.unsubscribe();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.document-container {
  background-color: $color-document;

  .main {
    position: relative;
    margin: 10px 10px 10px 0;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
}
</style>
