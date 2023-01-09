<script setup>
import { onMounted, ref, nextTick } from "vue";
import dataCoins from "./data/coins.json";
import axios from "axios";
let allCoins = dataCoins;
let open = ref(false);
let currentItem = ref(0);
let activeItem = 0;
const input = ref(null);
const root = ref("");
const itemList = ref("");
const list = ref("");
let searchParams = ref("");
let coin = ref(null);

// const selectedItem = () => {
//   // todo select value and clear activeitem/currentitem
//   open.value = !open.value;
//   if (open.value === true) {
//     document.addEventListener("click", documentClick);
//   } else {
//     document.removeEventListener("click", documentClick);
//     document.removeEventListener("click", documentKey);
//   }
// };
function selectInput() {
  console.log(input.value);
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
      //TODO change to ref
      list.value.querySelectorAll(".search__container-list-items-current")
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

function documentKeyDown(event) {
  let currentKey = event.keyCode;
  if (between(65, 90, currentKey) || between(97, 122, currentKey)) {
    // event.preventDefault();
  }

  if (event.code === "Escape") {
    open.value = false;
    input?.value.blur();
    document.removeEventListener("click", documentClick);

    return;
  }
  if (open.value) {
    // TODO currentItem < length - 1 of all elements( after implement axios all )
    if (event.code === "ArrowDown") {
      currentItem.value++;
      scrollPosition(1);
      // console.log(currentItem.value);
    }
    if (event.code === "ArrowUp" && currentItem.value > 0) {
      currentItem.value--;
      // console.log(currentItem);
      scrollPosition(-1);
    }
    if (event.code === "Enter") {
      // todo select value and clear activeitem/currentitem
      if (open.value === true) {
        open.value = false;
      }
      // console.log("enter event target");
    }
  } else {
    if (event.code === "Tab") {
      return;
    }
    open.value = true;
  }
}
function onInput() {

  if (searchParams.value.length >= 3) {

    const searchedCoin = allCoins.find((coin) => {
     
      if (
        coin.id === searchParams.value.toLowerCase() ||
        coin.symbol === searchParams.value.toLocaleLowerCase()
      ) {
        return coin;
      }
    });
  console.log(searchedCoin);
    if (searchedCoin) {
      axios
        .post("http://localhost:3030/id", searchedCoin)
        .then((res) => {
          coin.value = res.data;
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
  }
}

// onMounted(() => {
//   window.addEventListener("keydown", documentKey);
//   axios
//     .post("http://localhost:3030/id", { id: "bitcoin", symbol: "btc" })
//     .then((res) => {
//       coin.value = res.data;
//       console.log(res.data);
//     })
//     .catch((err) => console.log(err));
// });
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
      <div ref="list" class="search__container-list">
        <ul v-if="coin" ref="itemList" class="search__container-list-items">
          <li
            style="display: flex; padding: 9px 5px"
            class="search__container-list-items-current"
          >
            <img
              src="../assets/BaseIcons/usdt.png"
              style="height: 16px"
              alt=""
            />
            <p style="font-size: 14px; margin-top: 3px">USDT Price</p>
          </li>
          <hr style="color: darkmagenta" />
          <li
            style="display: flex; padding: 25px 5px"
            class="search__container-list-items-current"
          >
            <img :src="coin?.image.thumb" alt="" />
            <p style="font-size: 13px; margin-top: 3px; font-weight: 600">
              {{ coin.symbol.toUpperCase() }}/ USDT
            </p>
            <p
              style="
                margin: 0 auto;
                font-size: 13px;
                font-weight: 600;
                margin-top: 3px;
              "
            >
             <p>dasdas</p>
            </p>
            <p
              style="
                color: green;
                font-size: 14px;
                font-weight: 600;
                margin-top: 3px;
              "
            >
              +{{ coin?.market_data.price_change_percentage_24h.toFixed(2) }}%
            </p>
          </li>
          <hr style="color: darkmagenta" />
          <li
            style="display: flex; margin-top: 10px; padding: 5px 5px"
            class="search__container-list-items-current"
          >
            <img
              src="https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
              alt=""
            />
            <p style="font-size: 14px; margin-top: 3px">
              <strong>BTC</strong> Price
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
    //todo ma-heidht should be 21;
    max-height: 18rem;
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

    &-items {
      //TODO check current element and index.on match should be like hover efekt
      &-current {
        padding: 0.8rem;
        font-size: 2rem;
        color: wheat;
        list-style: none;
        &:hover {
          background: white;
          color: $black;
        }
        &-active {
          background-color: white;
          color: $black;
        }
      }
    }
  }
}
.search__container-list-items-active {
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
