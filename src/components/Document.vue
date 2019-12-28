<template>
  <el-container>
    <sidebar />
    <el-container class="document-container">
      <explorer
        v-if="show"
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
        <container-tool-bar :height="windowHeight" />
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
  </el-container>
</template>

<script lang="ts">
import log from "@/ts/Logger";
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
import Sidebar from "@/components/common/Sidebar.vue";
import Explorer from "@/components/Document/Explorer.vue";
import Sash from "@/components/common/Sash.vue";
import ContainerView from "@/components/Document/ContainerView.vue";
import ContainerToolBar from "@/components/Document/ContainerToolBar.vue";

const SIDEBAR_WIDTH = 64;
const MARGIN = 10;
const EXPLORER_WIDTH = 200;
const WIDTH_MIN = 768;

const enum Direction {
  left = "left",
  right = "right"
}

@Component({
  components: {
    Sidebar,
    Explorer,
    Sash,
    ContainerView,
    ContainerToolBar
  }
})
export default class Document extends Vue {
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

  get contentViewWidth(): number {
    return this.windowWidth - this.explorerWidth - this.sidebarWidth - MARGIN;
  }

  get contentViewHeight(): number {
    return this.windowHeight - MARGIN * 2;
  }

  get sashLeft(): number {
    return this.explorerWidth + this.sidebarWidth;
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

  private getTrees() {
    treeList(this.$route.params.id)
      .then(querySnapshot => {
        const target: TreeNodeModel[] = [];
        const list: TreeNodeModel[] = [];
        querySnapshot.forEach(doc => {
          const treeNode = new TreeNodeModelImpl(doc);
          list.push(treeNode);
          if (treeNode.value !== undefined && isEditor(treeNode.name)) {
            target.push(treeNode);
          }
        });
        const parent = findParentTreeByChildren(list, target);
        this.treeList = [];
        this.treeList.push.apply(this.treeList, target);
        this.treeList.push.apply(this.treeList, parent);
        this.treeList.sort(orderByPathLengthASC);
        if (this.$store.state.treeActiveId === null) {
          this.watchTreeActiveId();
        }
      })
      .catch(err => {
        this.$notify.error({
          title: "Error",
          message: err.message
        });
        this.$router.back();
      });
  }

  // ==================== Event Handler ===================
  private onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.show = this.windowWidth > WIDTH_MIN;
    if (this.show) {
      this.sidebarWidth = SIDEBAR_WIDTH;
      if (this.explorerWidth === 10) {
        this.explorerWidth = EXPLORER_WIDTH;
      }
    } else {
      this.explorerWidth = 10;
      this.sidebarWidth = 0;
    }
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
    this.getTrees();
    this.subResize = this.resize$.subscribe(this.onResize);
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
    margin: 10px 10px 10px 0;
    background-color: white;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
}
</style>
