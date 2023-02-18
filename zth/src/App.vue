<script setup>
import { RouterView } from 'vue-router';
import AsideComponent from './pages/AsideComponent.vue';
import HeaderComponent from './pages/HeaderConponent.vue';
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
