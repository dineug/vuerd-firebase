<template>
  <vuerd
    :focus="true"
    :undo="undo"
    :redo="redo"
    :width="width"
    :height="height"
    :value="tempValue"
    @input="onInput"
    @change="onChange"
    @undo="onUndo"
    @redo="onRedo"
  />
</template>

<script lang="ts">
import UndoManager from "undo-manager";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Vuerd } from "vuerd-plugin-erd";

interface Command {
  undo(): void;
  redo(): void;
}

interface UndoRedo {
  add(command: Command): UndoRedo;
  setCallback(callback: () => void): void;
  undo(): UndoRedo;
  redo(): UndoRedo;
  clear(): void;
  hasUndo(): boolean;
  hasRedo(): boolean;
  getCommands(): Command[];
  getIndex(): number;
  setLimit(limit: number): void;
}

@Component({
  components: {
    Vuerd
  }
})
export default class ERD extends Vue {
  @Prop({ type: String, default: "" })
  private value!: string;
  @Prop({ type: Number, default: 1000 })
  private width!: number;
  @Prop({ type: Number, default: 1000 })
  private height!: number;

  private tempValue: string = "";
  private undo: boolean = false;
  private redo: boolean = false;
  private undoManager!: UndoRedo;

  private callback() {
    this.undo = this.undoManager.hasUndo();
    this.redo = this.undoManager.hasRedo();
  }

  private onUndo() {
    this.undoManager.undo();
  }

  private onRedo() {
    this.undoManager.redo();
  }

  private onInput(value: string) {
    if (this.tempValue !== value) {
      const oldValue = this.tempValue;
      this.undoManager.add({
        undo: () => {
          this.tempValue = oldValue;
        },
        redo: () => {
          this.tempValue = value;
        }
      });
    }
    this.tempValue = value;
  }

  private onChange(value: string) {
    if (this.tempValue !== value) {
      const oldValue = this.tempValue;
      this.undoManager.add({
        undo: () => {
          this.tempValue = oldValue;
        },
        redo: () => {
          this.tempValue = value;
        }
      });
    }
    this.tempValue = value;
  }

  private created() {
    this.undoManager = new UndoManager() as UndoRedo;
    this.undoManager.setCallback(this.callback);
  }

  private mounted() {
    this.tempValue = this.value;
  }
}
</script>

<style scoped lang="scss"></style>
