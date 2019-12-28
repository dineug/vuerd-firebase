<template>
  <div v-if="show" :style="headerStyle">
    <nav-menu mode="horizontal" :collapse="false" @height="onHeight" />
  </div>
</template>

<script lang="ts">
import { HEADER_HEIGHT, HEADER_WIDTH_MAX } from "@/data/size";
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";
import NavMenu from "@/components/common/NavMenu.vue";

@Component({
  components: {
    NavMenu
  }
})
export default class NavHeader extends Vue {
  private show: boolean = false;
  private height: number = HEADER_HEIGHT;

  get headerStyle(): string {
    return `
    height: ${this.height}px;
    `;
  }

  // ==================== Event Handler ===================
  private onShow() {
    this.show = true;
  }

  private onHide() {
    this.show = false;
  }

  private onHeight(height: number) {
    this.height = height;
  }
  // ==================== Event Handler END ===================

  // ==================== Life Cycle ====================
  private created() {
    eventBus.$on(Bus.NavHeader.show, this.onShow);
    eventBus.$on(Bus.NavHeader.hide, this.onHide);
    if (window.innerWidth < HEADER_WIDTH_MAX) {
      this.height = HEADER_HEIGHT * 2;
    }
  }

  private mounted() {
    window.dispatchEvent(new Event("resize"));
  }

  private destroyed() {
    eventBus.$off(Bus.NavHeader.show, this.onShow);
    eventBus.$off(Bus.NavHeader.hide, this.onHide);
  }
  // ==================== Life Cycle END ====================
}
</script>

<style scoped lang="scss"></style>
