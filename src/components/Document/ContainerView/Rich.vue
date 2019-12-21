<template>
  <div class="rich" :style="`width: ${width}px;`" v-html="value" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Rich extends Vue {
  @Prop({ type: String, default: "" })
  private value!: string;
  @Prop({ type: Number, default: 0 })
  private width!: number;
}
</script>

<style scoped lang="scss">
.rich {
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
