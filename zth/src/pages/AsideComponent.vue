<script setup>
import { RouterLink } from "vue-router";
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import bgp from "../assets/BaseIcons/bgp.jpeg";

let isToggle = ref(false);
let dark = ref(true);

const store = useStore();

const toggle = () => {
  isToggle.value = !isToggle.value;
  console.log(isToggle.value);
  if (isToggle.value === true) {
    document.addEventListener("click", documentClick);
  } else {
    destroyClickEvent();
  }
};

const switchTheme = () => {
  store.commit("TOGGLE");
  dark.value = store.state.themeDark;
  if (dark.value) {
    document.body.style.background = "white";
  } else {
    document.body.style.background =
      "linear-gradient(189deg, rgba(29,12,56,1) 0%, rgba(12,20,68,1) 53%, rgba(44,16,65,1) 100%)";
  }
};

function documentClick() {
  document.onclick = (e) => {
    e.target.appendClass = "active";
    if (
      e.target.className === "sidebar-btn" ||
      e.target.className === "sidebar is-expand" ||
      e.target.className === "active sidebar-icon" ||
      e.target.className === "theme" ||
      e.target.className === "material-symbols-outlined light" ||
      e.target.className === "material-symbols-outlined dark" ||
      e.target.className === "theme dark-icon" ||
      e.target.className === "theme light-icon" ||
      e.target.className === "sidebar darkUnActive is-expand"
    ) {
      return;
    }
    isToggle.value = false;
    destroyClickEvent();
  };
}

function destroyClickEvent() {
  document.removeEventListener("click", documentClick);
}

function tabEvent(event) {
  if (event.code === "Tab") {
    console.log("tabevent");
    return;
  }
}

onMounted(() => {
  dark.value = store.state.themeDark;
});
</script>

<template>
  <aside
    class="sidebar"
    :class="[{ darkUnActive: dark }, `${isToggle ? 'is-expand' : ''}`]"
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
  -webkit-mask-image: url("../assets/BaseIcons/zth.svg");
  -webkit-mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 30%;
  mask-image: url("../assets/BaseIcons/zth.svg");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: 30%;
  max-height: 6rem;
  margin-top: 2rem;
  cursor: pointer;
}
.router-link-active {
  &::after {
    content: "";
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
  margin: 0;
  width: 8rem;
  height: 100vh;
  max-height: 100vh;
  z-index: 999;
  flex-direction: column;
  display: flex;
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
        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
      }

      &::after {
        content: "";
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
      content: "";
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
      content: "";
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
        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
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
</style>
