<template>
  <el-select :value="value" placeholder="language" @change="onChange">
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
export default class Language extends Vue {
  @Prop({ type: String, default: "en" })
  private value!: string;

  private options: Option[] = [
    {
      label: "English",
      value: "en"
    },
    {
      label: "한국어",
      value: "ko"
    }
  ];

  private onChange(value: string) {
    this.$emit("change", value);
  }
}
</script>

<style scoped lang="scss"></style>
