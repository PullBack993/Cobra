<script setup>
import { RouterView } from 'vue-router';
import AsideComponent from './pages/AsideComponent.vue';
import HeaderComponent from './pages/HeaderConponent.vue';
</script>

<template>
  <AsideComponent />
  <main>
    <HeaderComponent />
    <div class="main">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in ">
          <component :is="Component" :key="$route.path"></component>
        </transition>
      </router-view>
    </div>
  </main>
</template>

<style scoped lang="scss">
.main {
  margin: 1rem;
}
.slide-enter-active {
  transition: opacity 0.2s, transform 0.5s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-30%);
}
</style>
