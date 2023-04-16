<script setup>
import { onMounted, ref, nextTick } from 'vue';
import axios from 'axios';
import HorizontalEllipsisSpinner from './utils/HorizontalEllipsisSpinner.vue';
import InputField from './InputField.vue';
import ctrlKey from '../assets/BaseIcons/ctrl+f.svg';

const currentItem = ref(0);
let activeScrollItem = 0;
const root = ref('');
const itemList = ref(null);
const list = ref('');
const searchParams = ref('');
const coins = ref(null);
const timeout = ref(0);
const loading = ref(false);
const error = ref(false);
const open = ref(false);
const coinsLength = ref(0);
const topElement = ref();

function scrollPosition(direction) {
  if (direction === 1) {
    currentItem.value++;
  } else {
    currentItem.value--;
  }
  nextTick(() => {
    if (!itemList.value) {
      return;
    }

    const items = Array.from(itemList.value);
    activeScrollItem = Math.min(
      Math.max(0, activeScrollItem + direction),
      items.length - 1
    );
    let top = items[activeScrollItem].offsetTop;
    console.log('top dropdown', top);
    if (top === 71) {
      top = 1;
    }
    list.value.scrollTo({ top, behavior: 'smooth' });
  });
}

function handelClearValue() {
  currentItem.value = 0;
  activeScrollItem = 0;
  topElement?.value?.scrollIntoView();
}
function documentClick(event) {
  if (open.value && event.target) {
    open.value = false;
    document.removeEventListener('click', documentClick);
  }
}

const selectedItem = () => {
  open.value = !open.value;
  if (open.value === true) {
    document.addEventListener('click', documentClick);
  } else {
    handelClearValue();
    document.removeEventListener('click', documentClick);
  }
};

function findCoin(allCoins) {
  const searchedCoin = allCoins.find((coin) => {
    if (
      coin?.id === searchParams.value.toLowerCase() ||
      coin?.symbol === searchParams.value.toLocaleLowerCase()
    ) {
      return coin;
    }
    return null;
  });
  return searchedCoin;
}

function onInput(value) {
  searchParams.value = value;
  loading.value = true;
  clearTimeout(timeout?.value);
  try {
    if (timeout?.value === 0 || searchParams?.value.length <= 2) {
      loading.value = false;
    }
    timeout.value = setTimeout(async () => {
      if (searchParams?.value.length >= 3) {
        const { default: allCoins } = await import('./data/coins.json');
        const searchedCoin = findCoin(allCoins);
        console.log(searchedCoin);
        if (searchedCoin) {
          handelClearValue();
          axios
            .post('http://localhost:3000/id', searchedCoin)
            .then((res) => {
              if (!res.data) {
                loading.value = false;
                coins.value = '';
                coinsLength.value = 0;
                error.value = true;
                return;
              }
              coins.value = res.data;
              coinsLength.value = res.data.data.length;

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
          coinsLength.value = 0;
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
  timeout.value = setTimeout(() => {
    loading.value = true;
    axios
      .post('http://localhost:3000/id', { id: 'bitcoin', symbol: 'btc' })
      .then((res) => {
        if (!res.data) {
          loading.value = false;
          coins.value = '';
          coinsLength.value = 0;
          error.value = true;
          return;
        }
        // TODO remove console.logs
        coins.value = res.data;
        coinsLength.value = res.data.data.length;

        error.value = false;
        loading.value = false;
      })
      .catch((err) => {
        console.log(err);
        loading.value = false;
        error.value = true;
        coinsLength.value = 0;
      });
  }, 500);
});

function onOpen(value) {
  open.value = value;
}
</script>
<template>
  <div class="search__container" ref="root">
    <InputField
      :current-item="currentItem"
      :root="root"
      :open="open"
      :coins="coinsLength"
      :prevent="false"
      @on-input="onInput"
      @open="onOpen"
      @clear-values="handelClearValue"
      @scroll-direction="scrollPosition"
    />
    <ctrlKey alt="key-f" class="search__container-key"></ctrlKey>
    <!-- @click="selectInput($event)" -->
    <div
      :class="
        open
          ? 'search__container-dropdown'
          : 'search__container-dropdown--is-open'
      "
    >
      <div ref="list" class="search__container-list" v-if="coins && !loading">
        <ul class="search__container-list-items">
          <div ref="topElement" class="search__container-list-container">
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
            v-for="(coin, index) in coins.data"
            class="search__container-list-current"
            ref="itemList"
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
//TODO adjust f butto
:deep(.input) {
  padding-left: 5rem;
}
.positive {
  color: $chart-green;
}
.negative {
  color: $chart-red;
}
.search__container {
  width: 100%;
  display: flex;
  align-items: center;

  &-key {
    width: 5rem;
    position: absolute;
    right: 0;
    margin-right: 1rem;
    background-color: transparent;
    border-radius: 0.5rem;
    transform: scale(2.2);
    right: 1.6rem;
    fill: $main-purple;
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
    z-index: 20;
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
      border-radius: 5rem;
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
  :deep(.input) {
    padding-left: 1rem;
  }
  .search__container-list {
    max-height: 27rem;
  }

  .search__container-list-current--base,
  .search__container-list-current--price,
  .search__container-list-current--percentage {
    margin: 1rem;
  }
}
@media (max-width: $breakpoint_small) {
  .search__container-key {
    display: none;
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
