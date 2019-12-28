<template>
  <div v-if="show" :style="headerStyle">
    <nav-menu mode="horizontal" :collapse="false" @height="onHeight" />
  </div>
</template>

<script lang="ts">
import eventBus, { Bus } from "@/ts/EventBus";
import { Component, Prop, Vue } from "vue-property-decorator";
import NavMenu from "@/components/common/NavMenu.vue";

const HEADER_HEIGTH = 60;
const WIDTH_MAX = 402;

@Component({
  components: {
    NavMenu
  }
})
export default class NavHeader extends Vue {
  private show: boolean = false;
  private height: number = HEADER_HEIGTH;

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
    if (window.innerWidth < WIDTH_MAX) {
      this.height = HEADER_HEIGTH * 2;
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
