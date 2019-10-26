<template>
  <v-app class="app">
    <router-view />
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {}
</script>

<style>
</style>
