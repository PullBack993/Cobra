<script setup>
import AsideComponent from "./pages/AsideComponent.vue";
import HeaderComponent from "./pages/HeaderConponent.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <AsideComponent />
  <main>
    <HeaderComponent />
    <div>
      <router-view></router-view>
    </div>
  </main>
</template>
