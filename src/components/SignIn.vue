<template>
  <el-container>
    <ae-aside active="4" />
    <el-container>
      <el-main>Sign in</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AeAside from "./common/VeAside.vue";

@Component({
  components: {
    AeAside
  }
})
export default class SignIn extends Vue {}
</script>

<style scoped lang="scss"></style>
