<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import AuthPopUpComponent from '../components/AuthPopUpComponent.vue';
import DropdownInputComponent from '../components/DropDownSearchBar.vue';
import { useGlobalStore } from '../store/global';
import hamburger from '../assets/BaseIcons/hamburger.svg';

const store = useGlobalStore();

onMounted(() => {
  store.isLogin();
});

const screenSize = ref(window.innerWidth);
const header = ref(null);

let lastScrollPosition = 0;

const emit = defineEmits(['openSidebar']);

const scrollHandler = () => {
  const currentScrollPosition = window.pageYOffset;
  if (currentScrollPosition < lastScrollPosition) {
    header.value.style.top = '';
  } else {
    header.value.style.top = '-100%';
  }
  lastScrollPosition = currentScrollPosition;
};

onMounted(() => {
  window.addEventListener('scroll', scrollHandler);
});

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler);
});
</script>

<template>
  <header class="header" ref="header">
    <div class="main">
      <div class="search">
        <div
          v-if="screenSize < 768"
          class="search__lines"
          @click="emit('openSidebar')"
        >
          <hamburger
            class="search__lines-icon"
            :class="`${
              store.themeDark
                ? 'search__lines-icon--light'
                : 'search__lines-icon--dark'
            }`"
            alt="hamburger"
          ></hamburger>
        </div>

        <DropdownInputComponent />
      </div>
      <AuthPopUpComponent />
    </div>
  </header>
</template>

<style scoped lang="scss">
.search__lines {
  position: sticky;
  top: 3.4rem;
  left: 2rem;
  margin-left: 1rem;
  cursor: pointer;
  width: 3.7rem;
  z-index: 98;
  height: 0;
  fill: white;
  // padding: 2.4rem;
  // padding-bottom: 2rem;

  &-icon {
    display: block;
    cursor: pointer;

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
