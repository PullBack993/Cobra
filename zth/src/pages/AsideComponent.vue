<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Cookies from 'js-cookie';
import bgp from '../assets/BaseIcons/bgp.jpeg';
import hamburger from '../assets/BaseIcons/hamburger.svg';
import { useGlobalStore } from '../store/global';
// import MobileHeaderHamburger from '@/pages/HeaderConponent.vue';

const props = defineProps({
  toggle1: Boolean,
});

const isToggle = ref(false);
const dark = ref(true);
const opacity = ref('');
const store = useGlobalStore();
const screenSize = ref(0);
const width = ref('');
const hamburgerRefs = ref(null);
const lastScrollPosition = 0;

(window as any).ethereum?.on('accountsChanged', () => {
  Cookies.remove('zth_rLt_K6u3hTf');
  Cookies.remove('zth_aSt_1xRg9Jd');
  store.login = false;
});

const switchTheme = () => {
  store.themeDark = !store.themeDark;
  dark.value = store.themeDark;
  if (dark.value) {
    document.body.style.background = 'white';
  } else {
    document.body.style.background =
      'linear-gradient(189deg, rgba(29,12,56,1) 0%, rgba(12,20,68,1) 53%, rgba(44,16,65,1) 100%)';
  }
};

function destroyClickEvent() {
  document.removeEventListener('click', documentClick);
}

const toggle = () => {
  isToggle.value = !isToggle.value;
  console.log('isToggle', isToggle.value);

  if (isToggle.value === true) {
    console.log('addEvent');
    document.addEventListener('click', documentClick);
  } else destroyClickEvent();
};

watch(
  () => props.toggle1,
  () => {
    if (screenSize.value <= 768) {
      console.log('props.toggle1');
      isToggle.value = props.toggle1;
    }
  }
);
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
  '',
];

const checkElements = (clickedElement: string, clickedElementClass: string | '', isMobile: boolean): boolean => {
  let found = false;

  HTMLElementsNotClickable.some((htmlElement) => {
    if (htmlElement === clickedElement) {
      found = true;
    }
  });
  return found;
};

function documentClick(e: Event) {
  const HTMLElementClass = (e.target as HTMLButtonElement).className;
  console.log('HTMLElementClass', HTMLElementClass);
  // console.log('checkElements', !checkElements(HTMLElementClass, '', false));
  // console.log('screensize', screenSize.value > 768);
  if ((screenSize.value > 768 && !checkElements(HTMLElementClass, '', false)) || HTMLElementClass === '') {
    console.log('document click yes');
    isToggle.value = false;
    document.removeEventListener('click', documentClick);
  }
}

function handelEscape(event: KeyboardEvent) {
  if (isToggle.value && event.key === 'Escape') {
    isToggle.value = false;
  }
}

onMounted(() => {
  dark.value = store.themeDark;
  screenSize.value = window.innerWidth;

  document.addEventListener('keydown', handelEscape);
});
</script>

<template>
  <div>
    <div>
      <!-- <MobileHeaderHamburger @openSidebar="toggle()"></MobileHeaderHamburger> -->
    </div>
    <aside
      :style="{ opacity: opacity, width: width }"
      class="sidebar"
      :class="[{ darkUnActive: dark }, `${isToggle ? 'is-expand' : 'shrink'}`, { isOpenAside: isToggle }]"
    >
      <RouterLink to="/" class="image">
        <div>
          <img :src="`${bgp}`" alt="logo" class="hero-image" />
        </div>
      </RouterLink>
      <label for="sidebar-toggle" @click="toggle()" class="sidebar-btn">
        <span :class="[`${isToggle ? 'active' : ''}`, `${dark ? 'sidebar-icon-active' : ''}`]" class="sidebar-icon"
          >&nbsp;</span
        >
      </label>
      <div class="sidebar-container">
        <RouterLink to="/" class="sidebar-home">
          <span class="material-symbols-outlined sidebar-home-icon">home</span>
          <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Home</p>
        </RouterLink>
        <RouterLink to="/volume-monitor" class="sidebar-home">
          <span class="material-symbols-outlined sidebar-home-icon"> data_usage </span>
          <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Global Metrics</p>
        </RouterLink>

        <RouterLink to="/news" class="sidebar-home">
          <span class="material-symbols-outlined sidebar-home-icon"> monitoring </span>
          <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Volume Metrics</p>
        </RouterLink>

        <RouterLink to="/long-short" class="sidebar-home">
          <span class="material-symbols-outlined sidebar-home-icon"> equalizer </span>
          <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Long/Short Ratio</p>
        </RouterLink>
      </div>

      <div
        class="theme"
        @click="switchTheme"
        :class="[`${dark ? 'light-icon' : 'dark-icon'}`, `${isToggle ? '' : 'toggle'}`]"
      >
        <div class="theme-light">
          <button tabindex="-1" class="material-symbols-outlined light" :class="`${isToggle ? '' : 'toggle-light'}`">
            light_mode
          </button>
        </div>
        <div class="theme-dark">
          <button tabindex="-1" class="material-symbols-outlined dark" :class="`${isToggle ? '' : 'toggle-dark'}`">
            dark_mode
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.router-link-active {
  &::after {
    content: '';
    position: absolute;
    height: 3.5rem;
    border-left: 0.3rem solid $main-purple;
    left: 0.1rem;
  }
  &.image {
    &::after {
      border-left: none;
    }
  }
}

.darkUnActive {
  background-color: $grey-5 !important;

  &.sidebar {
    border-right: 0.1rem solid $grey-black-5 !important;
  }
}
.test::after {
  content: '';
  // content: '\a';
  // white-space: pre;
  position: absolute;
  left: 14px;
  top: 27px;
  height: 4rem;
  width: 4rem;
  z-index: 99;
}
// .search__hamburger {
//   position: relative;
// }
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

.is-expand {
  width: 25rem !important;
  overflow: hidden;
  backdrop-filter: blur(1rem);
}
.shrink {
  transform: translateX(-25rem);
}

.sidebar {
  display: flex;
  margin: 0;
  width: 8rem;
  height: 100vh;
  max-height: 100vh;
  z-index: 99;
  flex-direction: column;
  position: fixed;
  overflow: hidden;
  background-color: $dark_blue;
  border-right: 0.1rem solid $grey_5;
  transition: all 0.1s linear;
  margin-top: auto;

  .image {
    display: flex;
    justify-content: center;
  }
  .hero-image {
    -webkit-mask-image: url('../assets/BaseIcons/zth.svg');
    -webkit-mask-size: cover;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: 30%;
    mask-image: url('../assets/BaseIcons/zth.svg');
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: 30%;
    max-height: 6rem;
    margin-top: 2rem;
    cursor: pointer;
    transform: scale(1.8);
  }

  &-btn {
    text-align: center;
    padding: 3rem 2rem 3rem 2rem;
    cursor: pointer;
    max-height: 6.2rem;
  }

  &-icon {
    position: relative;

    &,
    &::before,
    &::after {
      width: 3rem;
      height: 0.2rem;
      background-color: $white;
      display: inline-block;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      transition: all 0.15s ease;
    }

    &::before {
      top: -0.8rem;
    }

    &::after {
      top: 0.8rem;
    }

    &-active {
      &,
      &::before,
      &::after {
        width: 3rem;
        height: 0.2rem;
        background-color: $black;
        display: inline-block;
      }
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 12rem;
    width: 100%;
    margin-top: 2rem;
  }

  &-home {
    display: flex;
    text-decoration: none;
    padding: 2rem 2rem 2rem 2.5rem;
    align-items: center;
    margin: auto 0;

    &:hover {
      transition: 0.1s all ease-in-out;

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
      }

      .visible {
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        box-shadow: rgba(150, 150, 150, 0.1) 0 2rem 2rem;
      }
    }

    &-icon {
      color: $main_purple;

      &:hover {
        color: $main-purple-dark;
      }
    }
  }

  .notVisible {
    display: none;
  }

  .visible {
    padding-left: 1rem;
    font-size: 2rem;
    font-weight: 300;
    color: $main_purple;
  }

  .active {
    float: right;
    background-color: transparent;
  }

  .active::before {
    top: 0;
    transform: rotate(135deg);
  }

  .active::after {
    top: 0;
    transform: rotate(-135deg);
  }

  .theme {
    display: flex;
    border: solid 0.1rem rgb(76, 73, 73);
    width: 16rem;
    margin-left: 1.6rem;
    border-radius: 6rem;
    text-decoration: none;
    height: 4rem;
    position: relative;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4rem;
    position: absolute;
    bottom: 0;

    &::before {
      position: absolute;
      width: calc(51%);
      height: 4rem;
      border-radius: 6rem;
      content: '';
      transition: background-color 0.15s ease, -webkit-transform 0.3s ease;
      transition: transform 0.3s ease, background-color 0.15s ease;
      transition: transform 0.3s ease, background-color 0.15s ease, -webkit-transform 0.3s ease;
    }

    &-light {
      margin-left: 1rem;

      .light {
        color: $white;
      }
    }

    &-dark {
      margin-right: 1rem;

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
      }
    }
  }

  .light-icon::before {
    background-color: $main_purple;
    box-shadow: rgba(149, 157, 165, 0.2) 0 8rem 2.4rem;
    transform: translateX(0%);
  }

  .dark-icon::before {
    background-color: $main_purple-dark;

    box-shadow: rgba(149, 157, 165, 0.2) 0 8rem 2.4rem;
    transform: translateX(100%);
  }

  .toggle.light-icon {
    width: 9rem;
    border: none;

    &::before {
      transform: translateX(0);
    }
  }

  .toggle.dark-icon {
    width: 9rem;
    border: none;

    &::before {
      transform: translateX(0);
    }

    .toggle-light {
      transform: translateX(40rem);
    }

    .toggle-dark {
      transform: translateX(-4.5rem);
    }
  }

  .toggle.light-icon {
    width: 9rem;
    border: none;

    &::before {
      transform: translateX(0);
    }

    .toggle-dark {
      transform: translateX(40rem);
    }
  }
}

@media (min-width: $breakpoint_small) {
  .shrink {
    transform: translateX(0);
  }
  .sidebar {
    display: flex;
  }
  .search__lines {
    display: none;
  }
  .search__lines-icon {
    display: none;
  }
}
</style>
