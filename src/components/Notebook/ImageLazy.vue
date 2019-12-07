<template>
  <div class="image-lazy" :style="imageLazyStyle">
    <el-image
      class="image-box"
      :style="imageStyle"
      :src="src"
      lazy
      @load="onLoad"
      ref="img"
    />
  </div>
</template>

<script lang="ts">
import { IMAGE } from "@/data/image";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ImageLazy extends Vue {
  @Prop({ type: String, default: IMAGE })
  private src!: string;
  @Prop({ type: Number, default: 300 })
  private width!: number;
  @Prop({ type: Number, default: 225 })
  private height!: number;

  private horizontal: boolean = true;
  private currentWidth: number = 0;
  private currentHeight: number = 0;
  private top: number = 0;
  private left: number = 0;

  get imageLazyStyle(): string {
    return `
    width: ${this.width}px;
    height: ${this.height}px;
    `;
  }

  get imageStyle(): string {
    if (this.horizontal) {
      return `
      width: 100%;
      height: ${this.currentHeight}px;
      top: ${this.top}px;
      `;
    }
    return `
    width: ${this.currentWidth}px;
    height: 100%;
    left: ${this.left}px;
    `;
  }

  private onLoad() {
    const vm = this.$refs.img as any;
    const img = (vm.$el as HTMLElement).childNodes[0] as HTMLImageElement;
    if (img && img.naturalWidth && img.naturalHeight) {
      this.horizontal = img.naturalWidth <= img.naturalHeight;
      if (this.horizontal) {
        this.currentHeight =
          (this.width / img.naturalWidth) * img.naturalHeight;
        this.top = (this.height - this.currentHeight) / 2;
      } else {
        this.currentWidth =
          (this.height / img.naturalHeight) * img.naturalWidth;
        this.left = (this.width - this.currentWidth) / 2;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.image-lazy {
  position: relative;
  overflow: hidden;

  .image-box {
    position: absolute;
  }
}
</style>
