<template>
  <div
    class="markdown-body"
    :style="`width: ${width}px;`"
    v-html="markdownToHtml"
  />
</template>

<script lang="ts">
import marked from "marked";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Markdown extends Vue {
  @Prop({ type: String, default: "" })
  private value!: string;
  @Prop({ type: Number, default: 0 })
  private width!: number;

  get markdownToHtml(): string {
    return marked(this.value);
  }
}
</script>

<style scoped lang="scss">
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  overflow: auto;
  background-color: white;

  & /deep/ pre {
    padding: 14px 16px;
    color: white;
    background-color: #23241f;
  }
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
