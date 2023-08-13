<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import LoginRegister from '../components/LoginRegister.vue';
import DropdownInputComponent from '../components/DropDownSearchBar.vue';
import hamburger from '../assets/BaseIcons/hamburger.svg';
import { useGlobalStore } from '../store/global';

const store = useGlobalStore();

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
function updateScreenWidth() {
  screenSize.value = window.innerWidth;
}
onMounted(() => {
  window.addEventListener('scroll', scrollHandler);
  updateScreenWidth();
  onScreenResize();
});

function onScreenResize() {
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
        <div v-if="screenSize < 768" class="search__lines" @click="emit('openSidebar')">
          <hamburger
            class="search__lines-icon"
            :class="`${store.themeDark ? 'search__lines-icon--light' : 'search__lines-icon--dark'}`"
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
.search__lines {
  position: absolute;
  left: 0;
  top: 1.8rem;

  &-icon {
    display: block;
    cursor: pointer;
    z-index: 98;

    &--light {
      fill: $main_purple;
    }
    &--dark {
      fill: $white;
    }
  }
}
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
    position: relative;
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
