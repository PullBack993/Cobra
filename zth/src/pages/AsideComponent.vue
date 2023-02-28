<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie';
import bgp from '../assets/BaseIcons/bgp.jpeg';
import { useGlobalStore } from '../store/global';

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

const toggle = () => {
  isToggle.value = !isToggle.value;
  if (isToggle.value === true) {
    if (screenSize.value < 768) {
      width.value = '8rem';
      opacity.value = '100';
      document.dispatchEvent(new Event(''));
    }
    document.addEventListener('click', documentClick);
  } else {
    if (screenSize.value < 768) {
      width.value = '0rem';
      opacity.value = '0';
    }
    destroyClickEvent();
  }
};

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
function documentClick() {
  document.onclick = (e) => {
    (e.target as HTMLButtonElement).appendClass = 'active';
    if (
      (e.target as HTMLButtonElement).className === 'sidebar-btn' ||
      (e.target as HTMLButtonElement).className === 'sidebar is-expand' ||
      (e.target as HTMLButtonElement).className === 'active sidebar-icon' ||
      (e.target as HTMLButtonElement).className === 'theme' ||
      (e.target as HTMLButtonElement).className ===
        'material-symbols-outlined light' ||
      (e.target as HTMLButtonElement).className ===
        'material-symbols-outlined dark' ||
      (e.target as HTMLButtonElement).className === 'theme dark-icon' ||
      (e.target as HTMLButtonElement).className === 'theme light-icon' ||
      (e.target as HTMLButtonElement).className ===
        'sidebar darkUnActive is-expand' ||
      (e.target as HTMLButtonElement).className === 'search__lines' ||
      (e.target as HTMLButtonElement).className === 'search__lines-icon'
    ) {
      return;
    }
    isToggle.value = false;
    if (screenSize.value < 768 && isToggle.value === false) {
      opacity.value = '0';
      width.value = '0rem';
    }
    destroyClickEvent();
  };
}

function destroyClickEvent() {
  document.removeEventListener('click', documentClick);
}

function tabEvent(event) {
  if (event.code === 'Tab') {
  }
}
// change to store
function onScreenResize() {
  window.addEventListener('resize', () => {
    updateScreenWidth();
  });
}

function updateScreenWidth() {
  screenSize.value = window.innerWidth;
  if (screenSize.value < 768) {
    opacity.value = '0';
    width.value = '0rem';
  } else {
    width.value = '8rem';
    opacity.value = '100';
    document.dispatchEvent(new Event(''));
  }
}

onMounted(() => {
  dark.value = store.themeDark;
  updateScreenWidth();
  onScreenResize();
});
</script>

<template>
  <div class="search__lines" @click="toggle($event)">
    <span class="search__lines-icon">&nbsp;</span>
  </div>
  <aside
    :style="{ opacity: opacity, width: width }"
    class="sidebar"
    :class="[
      { darkUnActive: dark },
      `${isToggle ? 'is-expand' : ''}`,
      { isOpenAside: isToggle },
    ]"
  >
    <img :src="`${bgp}`" alt="" class="hero-image" />
    <RouterLink to="/" class="image" :key="home"></RouterLink>
    <image />

    <label for="sidebar-toggle" @click="toggle()" class="sidebar-btn">
      <span
        :class="[
          `${isToggle ? 'active' : ''}`,
          `${dark ? 'sidebar-icon-active' : ''}`,
        ]"
        class="sidebar-icon"
        >&nbsp;</span
      >
    </label>
    <div class="sidebar-container">
      <RouterLink to="/" class="sidebar-home" :key="home">
        <span class="material-symbols-outlined sidebar-home-icon">home</span>
        <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Home</p>
      </RouterLink>
      <RouterLink to="/pass" class="sidebar-home">
        <span class="material-symbols-outlined sidebar-home-icon">
          data_usage
        </span>
        <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Global Metrics</p>
      </RouterLink>

      <RouterLink to="/pass" class="sidebar-home">
        <span class="material-symbols-outlined sidebar-home-icon">
          monitoring
        </span>
        <p :class="`${isToggle ? 'visible' : 'notVisible'}`">Volume Metrics</p>
      </RouterLink>

      <RouterLink to="/about" class="sidebar-home">
        <span class="material-symbols-outlined sidebar-home-icon">
          equalizer
        </span>
        <p :class="`${isToggle ? 'visible' : 'notVisible'}`">
          Long/Short Ratio
        </p>
      </RouterLink>
    </div>

    <div
      class="theme"
      @click="switchTheme"
      :class="[
        `${dark ? 'light-icon' : 'dark-icon'}`,
        `${isToggle ? '' : 'toggle'}`,
      ]"
      @keydown="tabEvent($event)"
    >
      <div class="theme-light">
        <button
          tabindex="-1"
          class="material-symbols-outlined light"
          :class="`${isToggle ? '' : 'toggle-light'}`"
        >
          light_mode
        </button>
      </div>
      <div class="theme-dark">
        <button
          tabindex="-1"
          class="material-symbols-outlined dark"
          :class="`${isToggle ? '' : 'toggle-dark'}`"
        >
          dark_mode
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
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
}
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
  background-color: $white !important;

  &.sidebar {
    border-right: 0.1rem solid $grey_black_5 !important;
  }
}

.is-expand {
  width: 25rem !important;
  overflow: hidden;
  backdrop-filter: blur(1rem);
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
  box-shadow: rgba(150, 150, 150, 0.1) 0 2rem 2rem;

  &-container {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 12rem;
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
    animation: text-out-after 0.15s linear;
  }

  &-btn {
    text-align: center;
    padding: 3rem 2rem 3rem 2rem;
    cursor: pointer;
    max-height: 6.2rem;
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
      transition: transform 0.3s ease, background-color 0.15s ease,
        -webkit-transform 0.3s ease;
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
.search__lines {
  animation: leftToRight 0.15s;
  position: absolute;
  top: 10%;
  left: 10%;
  cursor: pointer;
  height: 50%;
  width: 6%;
  z-index: 99;
  &-icon {
    display: block;
    cursor: pointer;

    &,
    &::before,
    &::after {
      width: 3rem;
      height: 0.2rem;
      background-color: $white;
      display: inline-block;
      position: absolute;
      top: 45%;
      left: 11%;
      cursor: pointer;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    &::before {
      top: -0.8rem;
      cursor: pointer;
    }

    &::after {
      top: 0.8rem;
      cursor: pointer;
    }
  }
}

@media (min-width: $breakpoint_small) {
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

@keyframes leftToRight {
  0% {
    left: 0;
  }
}
</style>
