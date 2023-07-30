<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';
import AsideComponent from './pages/AsideComponent.vue';
import HeaderComponent from './pages/HeaderConponent.vue';

const isToggle = ref(false);
const screenSize = ref();
const width = ref('');
const opacity = ref('');

const toggle = () => {
  isToggle.value = !isToggle.value;
  console.log(isToggle.value);

  if (isToggle.value === true) {
    document.addEventListener('click', documentClick);
    if (screenSize.value < 768) {
      width.value = '0rem';
      opacity.value = '0';
    }
    destroyClickEvent();
  };
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
  'test',
  '',
];

const checkElements = (
  clickedElement: string | '',
  clickedElementClass: string | '',
  isMobile: boolean
): boolean => {
  let found = false;
  console.log('clickedElement', clickedElement);
  console.log('clickedElementClass', clickedElementClass);
  console.log('isMobile', isMobile);

  HTMLElementsNotClickable.some((htmlElement) => {
    if (!isMobile) {
      HTMLElementsNotClickable.push('search__lines', 'search__lines-icon');
      if (clickedElement === htmlElement) {
        found = true;
        return true;
      }
    } else if (
      new RegExp(htmlElement, 'i').test(clickedElement) ||
      clickedElement === undefined
    ) {
      if (clickedElement === undefined) {
        if (clickedElementClass === htmlElement) {
          found = true;
          return true;
        }
      } else {
        found = true;
        return true;
      }
    }
  });
  return found;
};

function documentClick(e: Event) {
  const HTMLElement = (e.target as HTMLButtonElement).className?.baseVal;
  const HTMLElementClass = (e.target as HTMLButtonElement).className;

  if (
    screenSize.value < 768 &&
    !checkElements(HTMLElement, HTMLElementClass, true)
  ) {
    isToggle.value = false;
    opacity.value = '0';
    width.value = '0rem';
    document.removeEventListener('click', documentClick);
  }

  if (
    (screenSize.value > 768 && !checkElements(HTMLElementClass, '', false)) ||
    HTMLElementClass === ''
  ) {
    isToggle.value = false;
    document.removeEventListener('click', documentClick);
  }
}

onMounted(() => {
  updateScreenWidth();
  onScreenResize();
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
  <AsideComponent :toggle1="isToggle" />
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
