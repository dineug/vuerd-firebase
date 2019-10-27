<template>
  <div class="debug">
    <router-link v-for="route in routes" :key="route.name" :to="route.path">
      {{ route.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { routes } from "@/router";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Debug extends Vue {
  private routes = routes;
}
</script>

<style scoped lang="scss">
.debug {
  display: flex;
  align-items: center;
  flex-direction: column;

  a {
    padding: 20px;
    display: block;
  }
}
</style>
