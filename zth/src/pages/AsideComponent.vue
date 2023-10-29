<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import Cookies from 'js-cookie';
import bgp from '../assets/BaseIcons/bgp.jpeg';
import newsSVG from '../assets/BaseIcons/news.svg';
import longShortSVG from '../assets/BaseIcons/cryptocurrency.svg';
import homeSVG from '../assets/BaseIcons/home.svg';
import ratioSVG from '../assets/BaseIcons/ratio.svg';
import brightness from '../assets/BaseIcons/brightness.svg';
import nightmode from '../assets/BaseIcons/night-mode.svg';
import { useGlobalStore } from '../store/global';

const HTMLElementsNotClickable = [
  'sidebar-btn',
  'sidebar is-expand',
  'active sidebar-icon',
  'theme',
  'material-symbols-outlined light',
  'material-symbols-outlined dark',
  'theme dark-icon',
  'theme light-icon',
  'search__lines-icon',
  'sidebar darkUnActive is-expand',
  '',
];

const props = defineProps({
  toggleMobile: Boolean,
});

const isToggle = ref(false);
const dark = ref(true);
const opacity = ref('');
const store = useGlobalStore();
const screenSize = ref(0);
const width = ref('');

(window as any).ethereum?.on('accountsChanged', () => {
  Cookies.remove('zth_rLt_K6u3hTf');
  Cookies.remove('zth_aSt_1xRg9Jd');
  store.login = false;
});

const switchTheme = () => {
  store.themeDark = !store.themeDark;
  const theme = document.querySelector(`[data-zth-color-scheme="${store.themeDark ? 'dark' : 'light'}"]`) as HTMLElement;
  theme.dataset.zthColorScheme = !store.themeDark ? 'dark' : 'light';
};

const checkElements = (clickedElement: string): boolean => {
  let found = false;

  HTMLElementsNotClickable.forEach((htmlElement) => {
    if (htmlElement === clickedElement) {
      found = true;
    }
  });
  return found;
};

const documentClick = (e: Event) => {
  const HTMLElementClass = (e.target as HTMLButtonElement).className;

  if ((screenSize.value > 768 && !checkElements(HTMLElementClass)) || HTMLElementClass === '') {
    isToggle.value = false;
    document.removeEventListener('click', documentClick);
  }
};

const destroyClickEvent = () => {
  document.removeEventListener('click', documentClick);
};

const toggle = () => {
  isToggle.value = !isToggle.value;
  console.log('isToggle', isToggle.value);

  if (isToggle.value === true) {
    console.log('addEvent');
    document.addEventListener('click', documentClick);
  } else destroyClickEvent();
};

watch(
  () => props.toggleMobile,
  () => {
    if (screenSize.value <= 768) {
      isToggle.value = props.toggleMobile;
    }
  }
);

const handelEscape = (event: KeyboardEvent) => {
  if (isToggle.value && event.key === 'Escape') {
    isToggle.value = false;
  }
};

const updateScreenWidth = () => {
  screenSize.value = window.innerWidth;
};

// TODO change to store
const onScreenResize = () => {
  window.addEventListener('resize', () => {
    updateScreenWidth();
  });
};

onMounted(() => {
  dark.value = store.themeDark;  // Should be base on user preferences !!!
  screenSize.value = window.innerWidth;
  onScreenResize();
  document.addEventListener('keydown', handelEscape);
});
</script>

<template>
  <div>
    <div></div>
    <aside
      :style="{ opacity: opacity, width: width }"
      class="sidebar"
      :class="[ `${isToggle ? 'is-expand' : 'shrink'}`, { isOpenAside: isToggle }]"
    >
      <RouterLink to="/" class="image">
        <div>
          <img :src="`${bgp}`" alt="logo" class="hero-image" />
        </div>
      </RouterLink>
      <label for="sidebar-toggle" @click="toggle()" class="sidebar-btn">
        <span :class="[`${isToggle ? 'active' : ''}`]" class="sidebar-icon"
          >&nbsp;</span
        >
      </label>
      <div class="sidebar-container">
        <RouterLink to="/" class="sidebar-home">
          <homeSVG class="sidebar-home-icon" />
          <p :class="`${isToggle ? 'visible' : 'invisible'}`">Home</p>
        </RouterLink>
        <RouterLink to="/volume-monitor" class="sidebar-home">
          <ratioSVG class="sidebar-home-icon sidebar-home-icon--scale" />

          <p :class="`${isToggle ? 'visible' : 'invisible'}`">Volume Monitor</p>
        </RouterLink>

        <RouterLink to="/news" class="sidebar-home">
          <newsSVG class="material-symbols-outlined sidebar-home-icon"></newsSVG>
          <p :class="`${isToggle ? 'visible' : 'invisible'}`">News</p>
        </RouterLink>

        <RouterLink to="/long-short" class="sidebar-home">
          <longShortSVG class="sidebar-home-icon" />
          <p :class="`${isToggle ? 'visible' : 'invisible'}`">Long/Short Ratio</p>
        </RouterLink>
      </div>

      <div
        class="theme"
        @click="switchTheme"
        :class="[`${ store.themeDark ? 'light-icon' : 'dark-icon'}`, `${isToggle ? '' : 'toggle'}`]"
      >
        <div class="theme-light">
          <button tabindex="-1" class="material-symbols-outlined light" :class="`${isToggle ? '' : 'toggle-light'}`">
            <brightness class="light" :class="`${isToggle ? '' : 'toggle-light'}`" />
          </button>
        </div>
        <div class="theme-dark">
          <button tabindex="-1" class="dark">
            <nightmode class="dark" :class="`${isToggle ? '' : 'toggle-dark'}`" />
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

.search__lines {
  position: sticky;
  top: 3.4rem;
  left: 2rem;
  margin-left: 1rem;
  cursor: pointer;
  width: 3.7rem;
  z-index: 98;
  height: 0;
  fill: var(--zth-text);

  &-icon {
    display: block;
    cursor: pointer;
  }
}

.is-expand {
  width: 25rem !important;
  overflow: hidden;
  backdrop-filter: blur(1rem);
  -webkit-backdrop-filter: blur(1rem);
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
  background-color: var(--bg-aside);
  border-right: 0.1rem solid var(--zth-hover);
  transition: width 0.1s linear;
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
    color: var(--zth-text);

    &,
    &::before,
    &::after {
      width: 3rem;
      height: 0.2rem;
      background-color: var(--zth-text);
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

  }

  &-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 12rem;
    margin-top: 2rem;
  }

  &-home {
    display: flex;
    text-decoration: none;
    padding: 2rem 2rem 2rem 2.5rem;
    align-items: center;
    margin: auto 0;
    height: 6rem;

    &:hover {
      transition: 0.1s all ease-in-out;

      .visible {
        font-weight: 400;
      }

      &::after {
        content: '';
        position: absolute;
        box-shadow: rgba(150, 150, 150, 0.1) 0 2rem 2rem;
      }
    }

    &-icon {
      fill: $main_purple;
      height: clamp(2.1rem, 2vw + 0.26rem, 2.3rem);
      width: 3rem;
      &--scale {
        transform: scale(1.3);
      }

      &:hover {
        color: $main-purple-dark;
      }
    }
  }

  .invisible {
    opacity: 0;
  }

  .visible {
    opacity: 1;
    padding-left: 1rem;
    font-size: $clamp-font-large-almost-large;
    font-weight: 300;
    color: $main_purple;
    animation: topToBottom 0.5s ease-in-out;
    // transition-delay: 3s;
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
  .dark {
    width: 2.5rem;
    height: 5rem;
    cursor: pointer;
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
    cursor: pointer;

    &::before {
      position: absolute;
      width: calc(51%);
      height: 4rem;
      border-radius: 6rem;
      content: '';
      cursor: pointer;

      transition: background-color 0.15s ease, -webkit-transform 0.3s ease;
      transition: transform 0.3s ease, background-color 0.15s ease;
      transition: transform 0.3s ease, background-color 0.15s ease, -webkit-transform 0.3s ease;
    }

    &-light {
      margin-left: 0.8rem;
      display: flex;
      .light {
        fill: var(--zth-text);
        height: clamp(2.1rem, 2vw + 0.26rem, 2.3rem);
        width: 3rem;
        cursor: pointer;
      }
    }

    &-dark {
      margin-right: 0.8rem;

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
      }
    }
  }

  .theme.light-icon::before {
    background-color: $main_purple;
    box-shadow: rgba(149, 157, 165, 0.2) 0 8rem 2.4rem;
    transform: translateX(0%);
  }

  .theme.dark-icon::before {
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
      width: 2.5rem;
    }

    .toggle-dark {
      transform: translateX(-4.5rem);
      width: 2.5rem;
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

// @keyframes text-out-after {
//   0% {
//     opacity: 0;
//   }
//   50% {
//     opacity: 0.5;
//   }
//   100% {
//     opacity: 1;
//   }
// }
</style>
