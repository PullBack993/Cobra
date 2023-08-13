<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';
import AsideComponent from './pages/AsideComponent.vue';
import HeaderComponent from './pages/HeaderConponent.vue';
import { useGlobalStore } from './store/global';

const store = useGlobalStore();
const isToggle = ref(false);
const screenSize = ref();

const toggle = () => {
  isToggle.value = !isToggle.value;
  console.log('istoggle =>', isToggle.value);

  if (isToggle.value === true) {
    document.addEventListener('click', documentClick);
  } else {
    destroyClickEvent();
  }
};
function destroyClickEvent() {
  document.removeEventListener('click', documentClick);
}

const HTMLElementsNotClickable = [
  'sidebar-btn',
  'sidebar is-expand',
  'active sidebar-icon',
  'theme',
  'material-symbols-outlined light',
  'material-symbols-outlined dark',
  'theme dark-icon',
  'theme light-icon',
  'sidebar darkUnActive is-expand',
  'search__lines-icon search__lines-icon--dark',
  'search__lines-icon search__lines-icon--light',
  'test',
  '',
];

const checkElements = (clickedElement: string): boolean => {
  let found = false;

  HTMLElementsNotClickable.forEach((htmlElement) => {
    if (htmlElement === clickedElement) {
      found = true;
    }
  });
  return found;
};

function documentClick(e: Event) {
  let HTMLElementClass = (e.target as HTMLButtonElement).className?.baseVal;
  if (!HTMLElementClass) {
    HTMLElementClass = (e.target as HTMLButtonElement).className;
  }
  console.log('html element', HTMLElementClass);
  if (
    (screenSize.value < 768 && !checkElements(HTMLElementClass) && !(HTMLElementClass instanceof SVGAnimatedString)) ||
    HTMLElementClass === ''
  ) {
    isToggle.value = false;
    document.removeEventListener('click', documentClick);
  }
}

onMounted(() => {
  updateScreenWidth();
  onScreenResize();
  store.isLogin();
});

function onScreenResize() {
  window.addEventListener('resize', () => {
    updateScreenWidth();
  });
}

function updateScreenWidth() {
  screenSize.value = window.innerWidth;
}
</script>

<template>
  <AsideComponent :toggle-mobile="isToggle" />
  <main>
    <HeaderComponent @openSidebar="toggle()" />
    <div class="main">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
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
