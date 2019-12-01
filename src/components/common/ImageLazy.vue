<template>
  <div class="image-lazy">
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
import { Component, Prop, Vue } from "vue-property-decorator";

const SIZE_WIDTH = 250;
const SIZE_HEIGHT = 200;

@Component
export default class ImageLazy extends Vue {
  @Prop({
    type: String,
    default:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO89B8AAqkB05ycXjIAAAAASUVORK5CYII="
  })
  private src!: string;

  private horizontal: boolean = true;
  private width: number = 0;
  private height: number = 0;
  private top: number = 0;
  private left: number = 0;

  get imageStyle(): string {
    if (this.horizontal) {
      return `
      width: 100%;
      height: ${this.height}px;
      top: ${this.top}px;
      `;
    }
    return `
    width: ${this.width}px;
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
        this.height = (SIZE_WIDTH / img.naturalWidth) * img.naturalHeight;
        this.top = (SIZE_HEIGHT - this.height) / 2;
      } else {
        this.width = (SIZE_HEIGHT / img.naturalHeight) * img.naturalWidth;
        this.left = (SIZE_WIDTH - this.width) / 2;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.image-lazy {
  margin-bottom: 5px;
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;

  .image-box {
    position: absolute;
  }
}
</style>
