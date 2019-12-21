<template>
  <div ref="editor"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class Summernote extends Vue {
  @Prop({ type: Number, default: 0 })
  private height!: number;
  @Prop({ type: String, default: "" })
  private value!: string;

  private $editor!: any;
  private currentValue: string = "";
  public imageUpload!: (files: File[], callback: (url: string) => void) => void;

  @Watch("height")
  private watchHeight() {
    this.$editor.summernote("destroy");
    this.setupEditor();
  }

  @Watch("value")
  private watchValue(value: string) {
    if (this.currentValue !== value) {
      this.$editor.summernote("code", value);
    }
  }

  private setupEditor() {
    this.$editor.summernote("destroy");
    this.$editor.summernote({
      height: this.height,
      tabsize: 2,
      callbacks: {
        onChange: (value: string) => {
          this.currentValue = value;
          this.$emit("input", value);
        },
        onImageUpload: (files: File[]) => {
          this.imageUpload(files, url => {
            this.$editor.summernote("editor.insertImage", url);
          });
        }
      }
    });
    this.$editor.summernote("code", this.value);
  }

  private mounted() {
    // @ts-ignore
    this.$editor = window.$(this.$refs.editor as HTMLElement);
    this.setupEditor();
  }

  private destroyed() {
    this.$editor.summernote("destroy");
  }
}
</script>

<style scoped lang="scss"></style>
