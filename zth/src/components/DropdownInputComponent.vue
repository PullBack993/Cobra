<script setup>
import { onMounted, ref, nextTick } from 'vue';
import dataCoins from './data/coins.json';
import axios from 'axios';
import HorizontalEllipsisSpinner from './utils/HorizontalEllipsisSpinner.vue';
const allCoins = dataCoins;
const open = ref(false);
const currentItem = ref(0);
let activeScrollItem = 0;
const input = ref(null);
const root = ref('');
const itemList = ref(null);
const list = ref('');
const searchParams = ref('');
const coins = ref(null);
let timeout = ref(0);
let loading = ref(false);
let error = ref(false);
const emit = defineEmits(['click:open'])
const buttonRef = ref(null);

const selectedItem = () => {
  open.value = !open.value;
  if (open.value === true) {
    document.addEventListener('click', documentClick);
  } else {
    clearValues();
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
function clearValues() {
  currentItem.value = 0;
  activeScrollItem = 0;
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
      list.value.querySelectorAll('.search__container-list-current')
    );
    activeScrollItem = Math.min(
      Math.max(0, activeScrollItem + direction),
      items.length - 1
    );

    let top = items[activeScrollItem].offsetTop;
    console.log(top);
    if (top == 71) {
      top = 1;
    }
    list.value.scrollTo({ top, behavior: 'smooth' });
  });
}
function between(a, b, c) {
  return a > b ? c >= b && c <= a : c >= a && c <= b;
}

function isValidKeyCode(code) {
  return between(65, 90, code) || between(97, 122, code);
}

// TODO change after implement chart => rout to chart
function handleEnterEvent() {
  if (open.value) {
    open.value = false;
    input?.value.blur();
    clearValues();
    document.removeEventListener('click', documentClick);
  }
}

function handleEscapeEvent() {
  if (open.value) {
    open.value = false;
    input?.value.blur();
    clearValues();
    document.removeEventListener('click', documentClick);
  }
}

function handleArrowDown() {
  console.log(coins.value.data.length);
  console.log(currentItem.value);
  if (open.value && coins.value.data.length - 2 >= currentItem.value) {
    currentItem.value++;
    scrollPosition(1);
  }
}

function handleArrowUp() {
  if (open.value && currentItem.value > 0) {
    currentItem.value--;
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
          clearValues();
          //TODO after interceptor implementation remove
          axios
            .post('http://localhost:3030/id', searchedCoin)
            .then((res) => {
              if (!res.data) {
                loading.value = false;
                coins.value = '';
                return (error.value = true);
              }
              coins.value = res.data;
              error.value = false;
              loading.value = false;

              console.log(res);
            })
            .catch((err) => {
              console.log(err);
              loading.value = false;
              error.value = true;
            });
        } else {
          loading.value = false;
          error.value = false;

          coins.value = '';
        }
      }
    }, 500);
  } catch (err) {
    console.log(err);
    loading.value = false;
    error.value = true; // check it
  }
}

onMounted(() => {
  window.addEventListener('keydown', documentKey);
  timeout.value = setTimeout(() => {
    //TODO after interceptor implementation remove
    loading.value = true;
    axios
      .post('http://localhost:3030/id', { id: 'bitcoin', symbol: 'btc' })
      .then((res) => {
        if (!res.data) {
          loading.value = false;
          coins.value = '';
          return (error.value = true);
        }
        //TODO remove console.logs
        console.log(res.data);
        coins.value = res.data;
        error.value = false;
        loading.value = false;
      })
      .catch((err) => {
        console.log(err);
        loading.value = false;
        error.value = true;
      });
  }, 500);
});

function onOpen() {
  emit(buttonRef.value, 'click:open')
}
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
          <div class="search__container-list-info">
            <div class="search__container-list-symbol">symbol</div>
            <div class="search__container-list-last">last</div>
            <div class="search__container-list-last">change%</div>
          </div>
          <li
            class="search__container-list-current"
            v-for="(coin, index) in coins.data"
            :currentItem="index"
            :key="index"
            @click="selectedItem"
          >
            <div
              class="search__container-list-item-container"
              :class="
                index == currentItem
                  ? 'search__container-list-current-active'
                  : ''
              "
            >
              <div class="search__container-list-current--base">
                <img
                  :src="coins.image.small"
                  :alt="coins.name"
                  class="search__container-list-current--target search__container-list-current-active"
                />
                <img
                  :src="coin?.baseImage[0]?.image"
                  :alt="coin?.baseImage[0]?.symbol"
                  class="search__container-list-current--baseImg"
                />
                {{ coin?.base }}/{{ coin?.target }}
              </div>
              <div class="search__container-list-current--container">
                <div
                  :class="
                    Number(coin?.percentage) > 0
                      ? 'positive'
                      : Number(coin?.percentage) < 0
                      ? 'negative'
                      : ''
                  "
                  class="search__container-list-current--price"
                >
                  {{ coin?.price }}
                </div>
              </div>

              <div class="search__container-list-current--container">
                <div
                  :class="
                    Number(coin?.percentage) > 0
                      ? 'positive'
                      : Number(coin?.percentage) < 0
                      ? 'negative'
                      : ''
                  "
                  class="search__container-list-current--percentage"
                >
                  {{ coin?.percentage }}
                  {{ coin?.percentage !== undefined ? '%' : '----' }}
                </div>
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
        v-if="!coins && !loading && searchParams.length && !error > 0"
        class="search__container-no-results"
      >
        No results for "{{ searchParams }}"
      </div>
      <div class="search__container-error" v-if="error && !loading">Error</div>
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
    padding-left: 6rem;
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
    background: $bg-dark-purple;
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
    max-height: 33rem;
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
    &-info {
      display: flex;
    }

    &-symbol,
    &-last,
    &-change {
      font-weight: bold;
      color: $medium-purple;
      animation: topToBottom 0.4s ease-in;
      font-size: 1.3rem;
      line-height: 1.71429;
      text-overflow: ellipsis;
      margin: 1rem;
    }

    &-symbol {
      margin-left: 4rem;
    }

    &-last,
    &-change {
      display: flex;
      width: 100%;
      justify-content: flex-end;
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
      animation: topToBottom 0.4s ease-in;
      border-radius: 50%;
      background: $white;
    }

    &-coin-name {
      margin-left: 1rem;
      display: flex;
      align-items: center;
      color: $white;
      font-weight: bold;
      position: relative;
      animation: topToBottom 0.4s ease-in;
    }

    &-top {
      width: 95%;
      border-bottom: 0.1rem solid $main-purple-dark-5;
      margin: auto;
      padding-top: 0.5rem;
    }
    &-item-container {
      display: flex;
    }

    //TODO check current element and index.on match should be like hover efect
    &-current {
      font-size: 2rem;
      color: $white;
      list-style: none;
      &:hover {
        background-color: $input-bg-dark-2;
      }
      &:hover &--base,
      &:hover &--price,
      &:hover &--percentage {
        font-weight: 500;
        font-size: 1.55rem;
      }

      &--container {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }

      &--base {
        display: flex;
      }
      &-active {
        background-color: $white-2;
      }

      &--target {
        height: 2.5rem;
        position: relative;
        margin-right: 2rem;
        border-radius: 50%;
        background-color: $white;
      }

      &--baseImg {
        height: 2.5rem;
        position: absolute;
        left: 1.5rem;
        border-radius: 50%;
        background: $white;
      }

      &--base,
      &--price,
      &--percentage {
        font-weight: 500;
        animation: topToBottom 0.4s ease-in;
        font-size: 1.5rem;
        line-height: 1.71429;
        text-overflow: ellipsis;
        margin: 0.6rem;
      }

      &--base {
        letter-spacing: 0.1rem;
      }
    }
  }

  &-spinner {
    display: flex;
    justify-content: center;
  }
  &-no-results,
  &-error {
    font-weight: 500;
    animation: topToBottom 0.4s ease-in;
    font-size: 1.5rem;
    line-height: 1.71429;
    text-overflow: ellipsis;
    margin: 1rem;
    color: $white;
  }
}


@media (min-width: $breakpoint_small) {
  .search__container-input{
    padding-left: 1rem;
  }
  .search__container-list{
    max-height: 22rem
  }
  .search__container-list-current--base,
  .search__container-list-current--price,
  .search__container-list-current--percentage {
    margin: 1rem;
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
//TODO responsive searchbar after implement login/register
</style>
