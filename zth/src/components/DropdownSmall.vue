<script setup lang="ts">
import { ref, nextTick } from 'vue';
import ArrowIcon from '../assets/BaseIcons/arrow.svg';
import SearchIcon from '../assets/BaseIcons/search.svg';
import InputField from './InputField.vue';

interface Props {
  data: string[]; // symbol or period of time
  withArrowIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  withArrowIcon: false,
});
const emit = defineEmits(['newValue:input']);

let activeScrollItem = 0;
const currentIndexItem = ref(0);
const itemList = ref(null);
const list = ref<HTMLElement>();
const coinsLength = ref(props.data.length);
const open = ref(false);
const root = ref<HTMLElement>();
const topElement = ref<HTMLElement>();
const currentValue = ref(props.data[0]);
const data = ref<string | string[]>(props.data);
const savedValue = ref(props.data[0]);
const noResult = ref(false);

function selectedItem(event: Event) {
  const currentItemValue = (event.target as HTMLElement)?.getAttribute(
    'currentItem'
  );
  if (currentItemValue !== null) {
    const currentItemNumber = Number(currentItemValue);
    if (!Number.isNaN(currentItemNumber)) {
      currentIndexItem.value = currentItemNumber;
      activeScrollItem = currentIndexItem.value;
    }
  }
  currentValue.value = (event.target as HTMLElement).textContent || '';
  emit('newValue:input', currentValue.value);
  open.value = false;

  scrollPosition(0);
}
function scrollPosition(direction: number) {
  if (direction === 1) {
    currentIndexItem.value++;
  } else if (direction === -1) {
    currentIndexItem.value--;
  }
  nextTick(() => {
    if (!itemList.value) {
      return;
    }
    const items = Array.from(itemList.value) as Node[];
    activeScrollItem = Math.min(
      Math.max(0, activeScrollItem + direction),
      items.length - 1
    );
    let top = (items[activeScrollItem] as HTMLElement).offsetTop;
    if (top === 71) {
      top = 1;
    }
    if (list.value) {
      list.value.scrollTo({ top, behavior: 'smooth' });
    }
  });
}
function onInput(value: string) {
  if (value) {
    const searchedCoin = findCoin(value);
    if (searchedCoin.length > 0) {
      data.value = searchedCoin;
      noResult.value = false;
    } else {
      data.value = ['No results'];
      noResult.value = true;
    }
  } else {
    noResult.value = false;
    currentValue.value = savedValue.value;
    data.value = props.data;
  }
}

function onOpen(value: boolean) {
  topElement?.value?.scrollIntoView();
  open.value = value;
}

function handelClearValue() {
  topElement?.value?.scrollIntoView();
  currentIndexItem.value = 0;
  activeScrollItem = 0;
}

function enterEvent() {
  if (itemList.value) {
    const selectedValue = (
      itemList.value[currentIndexItem.value] as HTMLElement
    ).textContent;
    currentValue.value = selectedValue || '';
    emit('newValue:input', currentValue.value);
    currentIndexItem.value = Number(
      (
        itemList.value[currentIndexItem.value] as HTMLElement
      )?.attributes.getNamedItem('currentItem')?.value
    );
    activeScrollItem = currentIndexItem.value;
    scrollPosition(0);
  }
}

function findCoin(value: string) {
  const searchedCoins = props.data.filter((coin: string) =>
    coin?.includes(value.toUpperCase())
  );
  return searchedCoins;
}

function selectInput() {
  open.value = true;
}
</script>

<template>
  <div ref="root">
    <InputField
      class="long__short-value"
      :current-item="currentIndexItem"
      v-if="root"
      :no-result="noResult"
      :root="root"
      :open="open"
      :coins="coinsLength"
      :value="currentValue"
      @on-input="onInput"
      @open="onOpen"
      @clear-values="handelClearValue"
      @scroll-direction="scrollPosition"
      @enter:event="enterEvent"
    />
    <Arrow-Icon
      @click="selectInput"
      :class="[
        open && !withArrowIcon
          ? 'long__short-arrow-invisible'
          : 'long__short-icon long__short-changed-icon',
        open ? 'long__short-arrow-rotate' : 'long__short-arrow-icon',
      ]"
    ></Arrow-Icon>
    <Search-Icon
      :class="[
        open && !withArrowIcon
          ? 'long__short-icon long__short-changed-icon'
          : 'long__short-arrow-invisible',
      ]"
    ></Search-Icon>
    <div
      class="long__short-dropdown-symbol"
      :class="
        open
          ? 'long__short-dropdown-symbol'
          : 'long__short-dropdown-symbol--is-open'
      "
    >
      <div ref="list" class="long__short-list">
        <ul ref="topElement" class="long__short-items">
          <li
            class="long__short-item"
            ref="itemList"
            v-for="(name, index) in data"
            :currentItem="index"
            :key="index"
            @click="selectedItem"
            :class="index === currentIndexItem ? 'long__short-active' : ''"
          >
            {{ name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.long__short {
  &-value {
    max-width: 11rem;
    cursor: pointer;
    font-size: 1.6rem;
    font-weight: 500;
    height: 3rem;
    position: relative;
  }
  &-active {
    background-color: $white-2;
    transition: all 0.3s ease;
  }
  &-icon {
    display: block;
    position: absolute;
    right: 0.8rem;
    top: 0.8rem;
    cursor: pointer;
  }
  &-changed-icon {
    animation: topToBottom 0.35s ease-in;
  }
  &-arrow-icon {
    transform: rotate(0);
    transition: all 0.3s ease;
  }
  &-arrow-rotate {
    transform: rotate(-180deg);
    transition: all 0.3s ease;
  }
  &-arrow-invisible {
    display: none;
  }

  &-dropdown-symbol {
    animation: topToBottom 0.35s ease-in;
    margin-top: 0.3rem;
    width: 11rem;
    background: $bg-dark-purple;
    border-radius: $border-light;

    &--is-open {
      display: none;
    }
  }

  &-symbol {
    margin-left: 1.1rem;
    margin-bottom: 0.3rem;
    font-size: 1.6rem;
    font-weight: 500;
  }
  &-list {
    border-top: none;
    scrollbar-color: $main-purple transparent;
    padding: 0.5rem 0;
    display: block;
    scrollbar-width: thin;
    -webkit-tap-highlight-color: transparent;
    overflow: auto;
    overflow-x: hidden;
    max-height: 19.5rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;

    &::-webkit-scrollbar {
      width: 1.2rem;
      border-radius: 5rem;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $main-purple;
      border: 0.5rem solid transparent;
      background-clip: padding-box;
      border-radius: 5rem;
    }
  }

  &-items {
    list-style: none;
  }
  &-item {
    font-size: 2rem;
    font-weight: 400;
    cursor: pointer;
    font-size: 1.6rem;
    font-weight: 500;
    padding: 0.5rem 1.1rem;

    &:hover {
      background-color: $main-purple-dark;
      border-radius: 0.4rem;
    }
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
</style>
