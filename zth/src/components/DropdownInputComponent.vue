<script setup>
import { onMounted, ref, nextTick } from "vue";
import axios from "axios";
let open = ref(false);
let currentItem = ref(0);
let activeItem = 0;
const input = ref(null);
const root = ref("");
const itemList = ref("");
const list = ref("");
let searchParams = "";
let coins = ref({});
const headers = {
  accept: "application/json",
  coinglassSecret: import.meta.env.VITE_VUE_APP_COINGLASS,
};

const selectedItem = () => {
  // todo select value and clear activeitem/currentitem

  open.value = !open.value;
  if (open.value === true) {
    document.addEventListener("click", documentClick);
  } else {
    document.removeEventListener("click", documentClick);
    document.removeEventListener("click", documentKey);
  }
};
function selectInput() {
  input?.value.focus();

  if (open.value === false) {
    document.addEventListener("click", documentClick);
    open.value = true;
  }
}

function documentClick(event) {
  if (open.value && event.target && !root.value.contains(event.target)) {
    open.value = false;
    document.removeEventListener("click", documentClick);
    document.removeEventListener("click", documentKey);
  }
}

function documentKey(event) {
  if (event.keyCode === 70 && open.value === false) {
    open.value = true;
    event.preventDefault();
    input?.value.focus();
    document.addEventListener("click", documentClick);
  }
}
function scrollPosition(direction) {
  nextTick(() => {
    if (!itemList.value) {
      return;
    }
    const items = Array.from(
      list.value.querySelectorAll(".items-list-current")
    );
    activeItem = Math.min(
      Math.max(0, activeItem + direction),
      items.length - 1
    );
    const top = items[activeItem].offsetTop;

    list.value.scrollTo({ top, behavior: "smooth" });
  });
}
function between(a, b, c) {
  return a > b ? c >= b && c <= a : c >= a && c <= b;
}
function getCoin(name) {
  axios
    .get(
      `https://open-api.coinglass.com/public/v2/perpetual_market?symbol=${name.toUpperCase()}`,
      headers
    )
    .then((response => {
      coins.value = response.data
    }))
    .catch((exception) => {
      console.log(exception);
    });
}

function documentKeyDown(event) {
  console.log(event.key);
  if (event.key === "Backspace") {
    searchParams = searchParams.slice(0, -1);
    return;
  }
  let currentKey = event.keyCode;
  if (between(65, 90, currentKey) || between(97, 122, currentKey)) {
    searchParams += event.key;
  }
  if (searchParams >= 3) {
    coins.value = getCoin(searchParams);
  }
  if (event.code === "Escape") {
    open.value = false;
    input?.value.blur();
    document.removeEventListener("click", documentClick);

    return;
  }
  if (open.value) {
    // && currentItem < flags.length - 1 //todo after implement axios all
    if (event.code === "ArrowDown") {
      currentItem.value++;
      scrollPosition(1);
      console.log(currentItem.value);
    }
    if (event.code === "ArrowUp" && currentItem.value > 0) {
      currentItem.value--;
      console.log(currentItem);

      scrollPosition(-1);
    }
    if (event.code === "Enter") {
      // todo select value and clear activeitem/currentitem
      if (open.value === false) {
        open.value = true;
      }
      console.log("enter event target");
    }
  } else {
    if (event.code === "Tab") return;
    open.value = true;
  }
}

onMounted(() => {
  window.addEventListener("keydown", documentKey);
  getCoin("BTC");
  console.log(coins.value);
});

</script>

<template>
  <div class="search-container" ref="root">
    <input
      @click="selectInput($event)"
      @keydown="documentKeyDown($event)"
      type="text"
      class="search-container-input"
      ref="input"
      :class="open ? 'search-container-open' : 'search-container-close'"
    />
    <img
      src="../assets/BaseIcons/key.svg"
      alt="key-f"
      class="key"
      @click="selectInput($event)"
    />
    <div :class="open ? 'dropdown' : 'is-open'">
      <div ref="list" class="dropdown-container">
        <ul ref="itemList" class="items-list">
          <li
            v-for="(coin, index) in ['asd', 'asd', 'asd', 'asd', 'asd', 'asd']"
            :key="index"
            @click="selectedItem()"
            class="items-list-current"
            :index="index"
            :class="{ 'active-item': currentItem === index }"
          >
            <span>{{ coin }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-container {
  width: 90%;
  display: flex;
  align-items: center;

  &-input {
    width: 100%;
    height: 5rem;
    border-radius: 1rem;
    border: none;
  }

  &-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &-close {
    border-radius: 1rem;
  }
}

.items-list {
  padding-top: 1rem;

  &-current {
    padding: 0.8rem;
    font-size: 2.1rem;
    color: wheat;
  }
}

.is-open {
  display: none;
}
.key {
  width: 3rem;
  position: absolute;
  right: 0;
  margin-right: 1rem;
  background-color: $input-bg-dark;
  border-radius: 0.5rem;
}

.dropdown {
  animation: topToBottom 0.35s ease-in;
  animation-fill-mode: forwards;
  position: absolute;
  top: 100%;
  width: auto;
  right: 0;
  left: 0;
  background: #16083e;
  z-index: 1;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;

  &-container {
    border-left: 0.1rem solid $input-bg-dark;
    border-right: 0.1rem solid $input-bg-dark;
    border-bottom: 0.1rem solid $input-bg-dark;
    scrollbar-color: $main-purple transparent;
    overflow: auto;
    display: block;
    scrollbar-width: thin;
    -webkit-tap-highlight-color: transparent;
    overflow-x: hidden;
    max-height: 20rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;

    &::-webkit-scrollbar {
      width: 1.2rem;
    }

    &::-webkit-scrollbar-thumb {
      height: 5rem;
      background-color: $main-purple;
      border: 0.5rem solid transparent;
      background-clip: padding-box;
    }
  }
  .items-list-current:hover {
    background: white;

    .active-item {
      background-color: white;
      color: $black;
    }
  }
}
.active-item {
  background-color: white;
  color: $black;
}

@keyframes topToBottom {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
