<template>
  <el-select :value="value" placeholder="role" @change="onChange">
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
export default class RoleSelect extends Vue {
  @Prop({ type: String, default: "owner" })
  private value!: string;

  private options: Option[] = [
    {
      label: "Owner",
      value: "owner"
    },
    {
      label: "Writer",
      value: "writer"
    },
    {
      label: "Reader",
      value: "reader"
    }
  ];

  private onChange(value: string) {
    this.$emit("change", value);
  }
}
</script>

<style scoped lang="scss"></style>
