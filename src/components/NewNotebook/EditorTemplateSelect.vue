<template>
  <el-select :value="value" placeholder="template" @change="onChange">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface Option {
  label: string;
  value: string;
}

@Component
export default class EditorTemplateSelect extends Vue {
  @Prop({ type: String, default: "none" })
  private value!: string;

  private options: Option[] = [
    {
      label: "None",
      value: "none"
    },
    {
      label: "All Editor Sample",
      value: "all-editor-sample"
    }
  ];

  private onChange(value: string) {
    this.$emit("change", value);
  }
}
</script>

<style scoped lang="scss"></style>
