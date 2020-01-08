<template>
  <el-container class="document-container">
    <explorer
      v-if="show"
      :width="explorerWidth"
      :height="windowHeight"
      :trees="trees"
      :search="search"
      preview
      @changeSearch="onSearch"
    />
    <div class="main" :style="mainStyle">
      <container-view
        :width="contentViewWidth"
        :height="contentViewHeight"
        :tree="treeActive"
      />
      <sash
        v-if="show"
        vertical
        :left="sashLeft"
        @mousemove="onMousemoveSash"
        @mousedown="onMousedownSash"
      />
    </div>
  </el-container>
</template>

<script lang="ts">
import log from "@/ts/Logger";
import { HEADER_HEIGHT, HEADER_WIDTH_MAX, WIDTH_MIN } from "@/data/size";
import { treeList } from "@/api/TreeAPI";
import {
  convertTreeModel,
  findParentTreeByChildren,
  orderByPathLengthASC,
  isEditor,
  findTreeModelById
} from "@/api/TreeHelper";
import { TreeModel, TreeNodeModel, TreeNodeModelImpl } from "@/api/TreeModel";
import { fromEvent, Observable, Subscription } from "rxjs";
import { Commit } from "@/store";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Explorer from "@/components/Document/Explorer.vue";
import Sash from "@/components/common/Sash.vue";
import ContainerView from "@/components/Document/ContainerView.vue";

const SIDEBAR_WIDTH = 0;
const MARGIN = 10;
const EXPLORER_WIDTH = 200;

const enum Direction {
  left = "left",
  right = "right"
}

@Component({
  components: {
    Explorer,
    Sash,
    ContainerView
  }
})
export default class DocumentPreview extends Vue {
  @Prop({ type: String, default: "" })
  private treeActiveId!: string;

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
  private search: string = "";
  private treeActive: TreeModel | null = null;
  private sidebarWidth: number = SIDEBAR_WIDTH;
  private show: boolean = true;
  private headerHeight: number = HEADER_HEIGHT;

  get contentViewWidth(): number {
    if (this.show) {
      return this.windowWidth - this.explorerWidth - this.sidebarWidth - MARGIN;
    } else {
      return this.windowWidth;
    }
  }

  get contentViewHeight(): number {
    if (this.show) {
      return this.windowHeight - MARGIN * 2;
    } else {
      return this.windowHeight - this.headerHeight;
    }
  }

  get sashLeft(): number {
    return this.explorerWidth + this.sidebarWidth;
  }

  get mainStyle(): string {
    if (this.show) {
      return `
        left: ${this.explorerWidth}px;
        width: ${this.contentViewWidth}px;
        height: ${this.contentViewHeight}px;
        margin: 10px 10px 10px 0;
      `;
    } else {
      return `
        left: ${this.explorerWidth}px;
        width: ${this.contentViewWidth}px;
        height: ${this.contentViewHeight}px;
        margin: 0;
      `;
    }
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
    const tree = convertTreeModel(this.treeListFilter);
    this.trees = [];
    if (tree !== null) {
      this.trees.push(tree);
    }
  }

  @Watch("search")
  private watchSearch() {
    log.debug("Document watchSearch");
    this.watchTreeList();
  }

  @Watch("treeActiveId")
  private watchTreeActiveId() {
    let all = true;
    if (this.treeActiveId) {
      const tree = convertTreeModel(this.treeList);
      if (tree !== null) {
        const treeModel = findTreeModelById(tree, this.treeActiveId);
        if (treeModel) {
          this.$store.commit(Commit.setTreeActiveId, this.treeActiveId);
          this.treeActive = treeModel;
          all = false;
        }
      }
    }
    if (all) {
      const tree = convertTreeModel(this.treeList);
      if (tree !== null) {
        const treeModel = findTreeModelById(tree, this.treeList[0].id);
        if (treeModel) {
          this.$store.commit(Commit.setTreeActiveId, this.treeList[0].id);
          this.treeActive = treeModel;
        }
      }
    }
  }

  private getTrees(list: TreeModel[]) {
    const target: TreeNodeModel[] = [];
    list.forEach(treeNode => {
      if (treeNode.value !== undefined && isEditor(treeNode.name)) {
        target.push(treeNode);
      }
    });
    const parent = findParentTreeByChildren(list, target);
    this.treeList = [];
    this.treeList.push.apply(this.treeList, target);
    this.treeList.push.apply(this.treeList, parent);
    this.treeList.sort(orderByPathLengthASC);
    this.watchTreeActiveId();
  }

  // ==================== Event Handler ===================
  private onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.show = this.windowWidth > WIDTH_MIN;
    if (this.show) {
      if (this.explorerWidth === 0) {
        this.explorerWidth = EXPLORER_WIDTH;
      }
    } else {
      this.explorerWidth = 0;
    }
    this.headerHeight =
      this.windowWidth < HEADER_WIDTH_MAX ? HEADER_HEIGHT * 2 : HEADER_HEIGHT;
  }

  private onMousemoveSash(event: MouseEvent) {
    const direction: Direction =
      event.movementX < 0 ? Direction.left : Direction.right;
    const width = this.explorerWidth + event.movementX;
    const contentViewWidth =
      this.windowWidth - width - this.sidebarWidth - MARGIN;
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
    log.debug("Document created");
    this.$store.commit(Commit.setTreeActiveId, null);
    this.subResize = this.resize$.subscribe(this.onResize);
    window.previewSend = (trees: TreeModel[]) => {
      this.$nextTick(() => {
        this.getTrees(trees);
      });
    };
    opener.parent.previewCreated();
  }

  private mounted() {
    window.dispatchEvent(new Event("resize"));
  }

  private destroyed() {
    log.debug("Document destroyed");
    this.subResize.unsubscribe();
    this.$store.commit(Commit.setTreeActiveId, null);
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss">
.document-container {
  background-color: $color-document;

  .main {
    position: relative;
    background-color: white;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    overflow: hidden;
  }
}
</style>
