<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import LoginRegister from '../components/LoginRegister.vue';
import DropdownInputComponent from '../components/DropDownSearchBar.vue';
import hamburger from '../assets/BaseIcons/hamburger.svg';

const screenSize = ref(window.innerWidth);
const header = ref(null);

let lastScrollPosition = 0;

const emit = defineEmits(['openSidebar']);
screenSize.value = window.innerWidth;

const scrollHandler = () => {
  const currentScrollPosition = window.pageYOffset;
  if (currentScrollPosition < lastScrollPosition) {
    header.value.style.top = '';
  } else {
    header.value.style.top = '-100%';
  }
  lastScrollPosition = currentScrollPosition;
};
const updateScreenWidth = () =>{
  screenSize.value = window.innerWidth;
}
onMounted(() => {
  window.addEventListener('scroll', scrollHandler);
  updateScreenWidth();
  onScreenResize();
});

const onScreenResize = () => {
  window.addEventListener('resize', () => {
    updateScreenWidth();
  });
}

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler);
});
</script>

<template>
  <header class="header" ref="header">
    <div class="main">
      <div class="search">
        <div v-if="screenSize <= 768" class="search__lines" @click="emit('openSidebar')">
          <hamburger
            class="search__lines-icon"
            alt="hamburger"
          ></hamburger>
        </div>
        <DropdownInputComponent />
      </div>
      <LoginRegister />
    </div>
  </header>
</template>

<style scoped lang="scss">
:deep(.input) {
  padding-right: 5rem;
}
.search__lines {
  position: absolute;
  left: 0;
  top: 0;

  &-icon {
    cursor: pointer;
    z-index: 98;
    margin: 0;
    fill: var(--zth-text);
  }
}
.header {
  top: 0;
  position: sticky;
  z-index: 9;
}
.main {
  border-bottom: 0.1rem solid  var(--brand-purple);
  height: 7.5rem;
  display: flex;
  justify-content: space-between;
  .search {
    position: relative;
    border-radius: 0.6rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    height: 5rem;
    margin: auto 1rem;
    @media (min-width: $breakpoint_small) {
      margin: auto 1rem;
      width: 35%;
    }
    @media (min-width: $breakpoint_medium) {
      width: 30%;
    }
  }
}
</style>
