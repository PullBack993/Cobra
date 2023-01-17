<script setup>
import { onMounted, ref, nextTick } from 'vue';
import dataCoins from './data/coins.json';
import axios from 'axios';
import HorizontalEllipsisSpinner from './utils/HorizontalEllipsisSpinner.vue';
const allCoins = dataCoins;
const open = ref(false);
const currentItem = ref(null);
const positiveNegativeColor = ref(null);
let activeScrollItem = 0;
const input = ref(null);
const root = ref('');
const itemList = ref(null);
const list = ref('');
const searchParams = ref('');
const coins = ref(null);
let timeout = ref(0);
let loading = ref(false);

const selectedItem = () => {
  open.value = !open.value;
  if (open.value === true) {
    document.addEventListener('click', documentClick);
  } else {
    document.removeEventListener('click', documentClick);
    document.removeEventListener('click', documentKey);
  }
};

function selectInput() {
  input?.value.focus();
  if (open.value === false) {
    addClickEvent();
    open.value = true;
  }
}

function documentClick(event) {
  if (open.value && event.target && !root.value.contains(event.target)) {
    open.value = false;
    document.removeEventListener('click', documentClick);
    document.removeEventListener('click', documentKey);
  }
}

function addClickEvent() {
  document.addEventListener('click', documentClick);
}

function documentKey(event) {
  if (event.keyCode === 70 && open.value === false) {
    open.value = true;
    event.preventDefault();
    input?.value.focus();
    addClickEvent();
  }
}
function scrollPosition(direction) {
  nextTick(() => {
    if (!itemList.value) {
      return;
    }
    const items = Array.from(
      // TODO change to ref
      list.value.querySelectorAll('.search__container-list-items-current')
    );
    activeScrollItem = Math.min(
      Math.max(0, activeScrollItem + direction),
      items.length - 1
    );
    const top = items[activeScrollItem].offsetTop;

    list.value.scrollTo({ top, behavior: 'smooth' });
  });
}
function between(a, b, c) {
  return a > b ? c >= b && c <= a : c >= a && c <= b;
}

function isValidKeyCode(code) {
  return between(65, 90, code) || between(97, 122, code);
}
function handleEnterEvent() {
  if (open.value) {
    open.value = !open.value;
  }
}

function handleEscapeEvent() {
  open.value = false;
  input?.value.blur();
  document.removeEventListener('click', documentClick);
}

function handleArrowDown() {
  if (open.value) {
    // console.log(currentItem.value)
    currentItem.value++;
    scrollPosition(1);
  }
}

function handleArrowUp() {
  if (open.value && currentItem.value > 0) {
    currentItem.value--;
    // console.log(currentItem.value)
    scrollPosition(-1);
  }
}

function handleTabEvent() {
  if (!open.value) {
    open.value = true;
  }
}

function documentKeyDown(event) {
  if (isValidKeyCode(event.keycode)) event.preventDefault();

  switch (event.key) {
    case 'Escape':
      handleEscapeEvent();
      break;
    case 'Enter':
      handleEnterEvent();
      break;
    case 'ArrowDown':
      handleArrowDown();
      break;
    case 'ArrowUp':
      handleArrowUp();
      break;
    case 'Tab':
      handleTabEvent();
      break;
  }
}

function onInput() {
  loading.value = true;

  clearTimeout(timeout?.value);
  try {
    if (timeout?.value === 0 || searchParams?.value.length <= 2) {
      loading.value = false;
    }
    timeout.value = setTimeout(() => {
      if (searchParams?.value.length >= 3) {
        let searchedCoin = allCoins.find((coin, index) => {
          if (
            coin?.id === searchParams.value.toLowerCase() ||
            coin?.symbol === searchParams.value.toLocaleLowerCase()
          ) {
            return coin;
          }
        });
        console.log(searchedCoin);

        if (searchedCoin) {
          axios
            .post('http://localhost:3030/id', searchedCoin)
            .then((res) => {
              coins.value = res.data;
              loading.value = false;

              console.log(res);
            })
            .catch((err) => {
              console.log(err);
              loading.value = false;
            });
        } else {
          loading.value = false;
          coins.value = '';
        }
      }
    }, 500);
  } catch (err) {
    console.log(err);
    loading.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', documentKey);
  timeout.value = setTimeout(() => {
    loading.value = true;

    axios
      .post('http://localhost:3030/id', { id: 'bitcoin', symbol: 'btc' })
      .then((res) => {
        console.log(res.data);
        coins.value = res.data;
        loading.value = false;
      })
      .catch((err) => {
        console.log(err);
        loading.value = false;
      });
  }, 500);
});
</script>

<template>
  <div class="search__container" ref="root">
    <input
      @click="selectInput($event)"
      @keydown="documentKeyDown($event)"
      @input="onInput"
      type="text"
      class="search__container-input"
      ref="input"
      :class="open ? 'search__container-open' : 'search__container-close'"
      v-model="searchParams"
    />
    <img
      src="../assets/BaseIcons/key.svg"
      alt="key-f"
      class="search__container-key"
      @click="selectInput($event)"
    />
    <div
      :class="
        open
          ? 'search__container-dropdown'
          : 'search__container-dropdown--is-open'
      "
    >
      <div ref="list" class="search__container-list" v-if="coins && !loading">
        <ul ref="itemList" class="search__container-list-items">
          <div class="search__container-list-container">
            <img
              class="search__container-list-image"
              loading="lazy"
              :src="coins.image.small"
              :alt="coins.name"
            />
            <div class="search__container-list-coin-name">
              {{ coins.name }}
            </div>
          </div>
          <div class="search__container-list-line-top"></div>
          <li
            class="search__container-list-current"
            v-for="(coin, index) in coins.data"
            :currentItem="index"
            :key="index"
          >
            <div class="search__container-list-item-container">
              <div class="search__container-list-current--base">
                {{ coin?.base }}/{{ coin?.target }}
              </div>
              <div
                :class="Number(coin?.percentage) > 0 ? 'positive' : 'negative'"
                class="search__container-list-current--price"
              >
                {{ coin?.price }}
              </div>
              <div
                :class="Number(coin?.percentage) > 0 ? 'positive' : 'negative'"
                class="search__container-list-current--percentage"
              >
                {{ coin?.percentage }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="loading" class="search__container-spinner">
        <HorizontalEllipsisSpinner />
      </div>
      <!-- TODO set class/style -->
      <div
        v-if="!coins && !loading && searchParams.length > 0"
        class="search__container-list-current--base"
      >
        No results for "{{ searchParams }}"
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.positive {
  color: $chart-green;
}
.negative {
  color: $chart-red;
}
.search__container {
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

  &-key {
    width: 3rem;
    position: absolute;
    right: 0;
    margin-right: 1rem;
    background-color: $input-bg-dark;
    border-radius: 0.5rem;
  }

  &-dropdown {
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

    &--is-open {
      display: none;
    }
  }

  &-list {
    border: 0.1rem solid $input-bg-dark;
    border-top: none;
    scrollbar-color: $main-purple transparent;
    padding: 0.5rem 0;
    display: block;
    scrollbar-width: thin;
    -webkit-tap-highlight-color: transparent;
    overflow: auto;
    overflow-x: hidden;
    max-height: 21rem;
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

    &-container {
      display: flex;
      min-height: 2.4rem;
      margin: 0.5rem 0;
    }
    &-image {
      width: 2rem;
      min-width: 2rem;
      margin: 0.2rem;
      margin-left: 1rem;
    }

    &-coin-name {
      margin-left: 1rem;
      display: flex;
      align-items: center;
      color: $white;
      font-weight: bold;
      position: relative;
    }

    &-top {
      width: 95%;
      border-bottom: 0.1rem solid $main-purple-dark-5;
      margin: auto;
      padding-top: 0.5rem;
    }
    &-item-container {
      display: flex;
      justify-content: space-between;
    }

    //TODO check current element and index.on match should be like hover efect
    &-current {
      font-size: 2rem;
      color: wheat;
      list-style: none;
      &:hover{
        background-color: $main-purple-dark-5;
      }
      &:hover &--base {
        color: $white;
        font-weight: 400;
      }
      &:hover &--price {
        color: $chart-green;
        font-weight: 400;
      }
      &:hover &--percentage {
        color: $chart-green;
        font-weight: 400;
      }

      &--base,
      &--price,
      &--percentage {
        font-weight: 300;
        font-size: 2rem;
        line-height: 1.71429;
        text-overflow: ellipsis;
        margin: 1rem;
        position: relative;
      }
      &--base {
        width: 50%;
      }
      &--price {
        width: 50%;
      }
      &--percentage {
        width: 20%;
      }

      &-active {
        background-color: white;
        color: $black;
      }
    }
  }
  &-spinner {
    display: flex;
    justify-content: center;
  }
}

@keyframes topToBottom {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
@keyframes leftToRightOpacity {
  0% {
    opacity: 0.1;
    width: 5%;
  }

  30% {
    opacity: 0.3;
    width: 15%;
  }

  50% {
    opacity: 0.5;
    width: 20%;
  }
  70% {
    opacity: 0.5;
    width: 25%;
  }
  80% {
    opacity: 0.8;
    width: 30%;
  }

  100% {
    opacity: 1;
    width: 39%;
  }
}

//TODO responsive searchbar after implement login/register
</style>
