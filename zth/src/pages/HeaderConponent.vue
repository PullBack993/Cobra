<script setup>
import { onMounted, ref } from 'vue';
import DropdownInputComponentVue from '../components/DropdownInputComponent.vue';
</script>

<template>
  <header>
    <div class="main">
      <div class="search">
        <DropdownInputComponentVue />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.key {
  width: 3rem;
  position: absolute;
  right: 0;
  margin-right: 1rem;
  background-color: $input-bg-dark;
  border-radius: 0.5rem;
}
.main {
  background: linear-gradient(
    rgba(12, 20, 68, 0.37) 0%,
    rgba(12, 20, 68, 1) 78%,
    rgba(44, 16, 65, 1) 99%
  );
  height: 9.5rem;
  .search {
    margin: auto;
    border-radius: 0.6rem;
    width: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    height: 9rem;
    @media (min-width: $breakpoint_small) {
      width: 45%;
    }
    @media (min-width: $breakpoint_medium) {
      width: 40%;
    }
  }
}
</style>
