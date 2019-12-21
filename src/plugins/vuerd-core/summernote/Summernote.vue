<template>
  <div ref="editor"></div>
</template>

<script lang="ts">
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
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

  private height$: Subject<void> = new Subject();
  private subHeight!: Subscription;

  @Watch("height")
  private watchHeight() {
    this.height$.next();
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

  private onHeight() {
    this.$editor.summernote("destroy");
    this.setupEditor();
  }

  private created() {
    this.subHeight = this.height$
      .pipe(debounceTime(300))
      .subscribe(this.onHeight);
  }

  private mounted() {
    // @ts-ignore
    this.$editor = window.$(this.$refs.editor as HTMLElement);
    this.setupEditor();
  }

  private destroyed() {
    this.$editor.summernote("destroy");
    this.subHeight.unsubscribe();
  }
}
</script>

<style scoped lang="scss"></style>
