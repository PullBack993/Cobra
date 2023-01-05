<script setup>
import { onMounted, ref } from "vue";
import DropdownInputComponentVue from "../components/DropdownInputComponent.vue";
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
  height: 9.5rem;

  .search {
    border-radius: 6px;
    width: 35%;
    display: flex;
    align-items: center;
    display: flex;
    justify-content: center;
    align-content: center;
    height: 9rem;
  }
}
</style>
