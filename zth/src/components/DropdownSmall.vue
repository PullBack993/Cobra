<script setup lang="ts">
import { ref, nextTick } from 'vue';
import ArrowIcon from '../assets/BaseIcons/arrow.svg';
import InputField from './InputField.vue';

interface Props {
  data: string[]; // symbol or period of time
}

const props = withDefaults(defineProps<Props>(), {});

let activeScrollItem = 0;
const currentIndexItem = ref(0);
const itemList = ref(null);
const list = ref<HTMLElement>();
const coinsLength = ref(props.data.length);
const open = ref(false);
const root = ref<HTMLElement>();
const topElement = ref<HTMLElement>();
const currentValue = ref(props.data[0]);

function selectedItem(event: Event) {
  currentIndexItem.value = (
    event.target as HTMLElement
  )?.attributes?.currentItem?.value;

  currentValue.value = (event.target as HTMLElement).textContent || '';
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
function onInput() {
  console.log('on input');
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
    const selectedValue = (itemList.value[currentIndexItem.value] as HTMLElement)
      .textContent;

    currentValue.value = selectedValue || '';
    currentIndexItem.value = (
      itemList.value[currentIndexItem.value] as HTMLElement
    )?.attributes?.currentItem?.value;
    scrollPosition(0);
  }
}
</script>

<template>
  <div ref="root">
    <InputField
      class="long__short-value"
      :current-item="currentIndexItem"
      v-if="root"
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
            v-for="(name, index) in props.data"
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
  }
  &-arrow-icon {
    position: absolute;
    right: 2.8rem;
    top: 2.9rem;
    transition: all 0.3s ease;
  }
  &-arrow-rotate {
    transform: rotate(180deg);
    transition: all 0.3s ease;
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
    max-height: 20rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    height: 19.5rem;

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
