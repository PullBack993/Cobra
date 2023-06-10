<script setup>
import { onMounted } from 'vue';
import AuthPopUpComponent from '../components/AuthPopUpComponent.vue';
import DropdownInputComponent from '../components/DropDownSearchBar.vue';
import { useGlobalStore } from '../store/global';

const store = useGlobalStore();

onMounted(() => {
  store.isLogin();
});
</script>

<template>
  <header class="header">
    <div class="main">
      <div class="search">
        <DropdownInputComponent />
      </div>
      <AuthPopUpComponent />
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  top: 0;
  position: sticky;
  z-index: 9;
  background: transparent;
  backdrop-filter: blur(9rem);
}
.main {
  border-bottom: 0.1rem solid $main-purple;
  height: 9.5rem;
  display: flex;
  justify-content: space-between;
  .search {
    margin: auto;
    border-radius: 0.6rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    height: 9rem;
    margin: 0 1rem;
    @media (min-width: $breakpoint_small) {
      margin: 0;
      width: 45%;
    }
    @media (min-width: $breakpoint_medium) {
      width: 40%;
    }
  }
}
</style>
