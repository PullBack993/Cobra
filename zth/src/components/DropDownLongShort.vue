<script setup lang="ts">
import { ref, nextTick } from 'vue';
import ArrowIcon from '../assets/BaseIcons/arrow.svg';
import SearchIcon from '../assets/BaseIcons/search.svg';
import InputField from './InputField.vue';

interface Props {
  data: string[]; // symbol or period of time
  withArrowIcon?: boolean;
  readonly?: boolean;
  propsCurrentIndexItem?: number;
  preselectedValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  withArrowIcon: false,
  readonly: false,
  propsCurrentIndexItem: 0,
  preselectedValue: 0,
});
const emit = defineEmits(['newValue:input']);

let activeScrollItem = 0;
const currentIndexItem = ref(props.propsCurrentIndexItem);
const savedValue = ref();
const itemList = ref(null);
const list = ref<HTMLElement>();
const coinsLength = ref(props.data.length);
const open = ref(false);
const root = ref<HTMLElement>();
const topElement = ref<HTMLElement>();
const currentValue = ref(props.data[props.preselectedValue]);
const data = ref<string | string[]>(props.data);
const noResult = ref(false);

const selectedItem = (event: Event) => {
  const currentItemValue = (event.target as HTMLElement)?.getAttribute('currentItem');
  if (currentItemValue !== null) {
    const currentItemNumber = Number(currentItemValue);
    if (!Number.isNaN(currentItemNumber)) {
      currentIndexItem.value = currentItemNumber;
      activeScrollItem = currentIndexItem.value;
      savedValue.value = currentIndexItem.value;
    }
  }
  currentValue.value = (event.target as HTMLElement).textContent || '';
  emit('newValue:input', currentValue.value);
  open.value = false;
  scrollPosition(0);
};

const scrollPosition = (direction: number) => {
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
    activeScrollItem = Math.min(Math.max(0, activeScrollItem + direction), items.length - 1);
    let top = (items[activeScrollItem] as HTMLElement).offsetTop;
    if (top === 71) {
      top = 1;
    }
    if (list.value) {
      list.value.scrollTo({ top, behavior: 'smooth' });
    }
  });
};

const onInput = (value: string) => {
  if (currentIndexItem.value !== 0) {
    savedValue.value = currentIndexItem.value;
  }
  if (value) {
    const searchedCoin = findCoin(value);
    if (searchedCoin.length > 0) {
      data.value = searchedCoin;
      noResult.value = false;
      currentIndexItem.value = 0;
    } else {
      currentIndexItem.value = savedValue.value;
      data.value = ['No results'];
      noResult.value = true;
    }
  } else {
    currentIndexItem.value = savedValue.value;
    data.value = props.data;
    scrollPosition(0);
  }
};

const onOpen = (value: boolean) => {
  open.value = value;
};

const handelClearValue = () => {
  topElement?.value?.scrollIntoView();
  currentIndexItem.value = 0;
  activeScrollItem = 0;
};

const enterEvent = () => {
  if (itemList.value) {
    const selectedValue = (itemList?.value[currentIndexItem?.value] as HTMLElement).textContent;
    currentValue.value = selectedValue || '';
    emit('newValue:input', currentValue.value);
    currentIndexItem.value = Number(
      (itemList?.value[currentIndexItem?.value] as HTMLElement)?.attributes.getNamedItem('currentItem')?.value
    );
    activeScrollItem = currentIndexItem.value;
    savedValue.value = currentIndexItem.value;
    scrollPosition(0);
  }
};

const findCoin = (value: string) => {
  const searchedCoins = props.data.filter((coin: string) => coin?.includes(value.toUpperCase()));
  return searchedCoins;
};

const selectInput = () => {
  open.value = !open.value;
};
</script>

<template>
  <div class="root" ref="root">
    <InputField
      class="long__short-value"
      :current-item="currentIndexItem"
      v-if="root"
      :no-result="noResult"
      :root="root"
      :open="open"
      :coins="coinsLength"
      :value="currentValue"
      :readonly="readonly"
      @on-input="onInput"
      @open="onOpen"
      @clear-values="handelClearValue"
      @scroll-direction="scrollPosition"
      @enter:event="enterEvent"
    />
    <Arrow-Icon
      @click="selectInput"
      :class="[
        open && !withArrowIcon ? 'long__short-arrow-invisible' : 'long__short-icon long__short-changed-icon',
        open ? 'long__short-arrow-rotate' : 'long__short-arrow-icon',
      ]"
    ></Arrow-Icon>
    <Search-Icon
      @click="selectInput"
      :class="[open && !withArrowIcon ? 'long__short-icon long__short-changed-icon' : 'long__short-arrow-invisible']"
    ></Search-Icon>
    <div
      class="long__short-dropdown-symbol"
      :class="open ? 'long__short-dropdown-symbol' : 'long__short-dropdown-symbol--is-open'"
    >
      <div
        ref="list"
        class="long__short-list"
      >
        <ul ref="topElement" class="long__short-items">
          <li
            class="long__short-item"
            ref="itemList"
            v-for="(name, index) in data"
            :currentItem="index"
            :key="index"
            :class="{ 'long__short-active--item': index === currentIndexItem }"
            @click="selectedItem"
          >
            {{ name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <br />
</template>

<style scoped lang="scss">
.long__short {
  &-value {
    max-width: 14rem;
    width: 13rem;
    cursor: pointer;
    font-size: $clamp-font-small;
    font-weight: 500;
    height: 3rem;
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
    fill: var(--white-black);
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
    @include customHorizontalScrollbar($height: 200rem);
    padding: 0.5rem 0;
    display: block;
    overflow: auto;
    overflow-x: hidden;
    max-height: 19.5rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    position: absolute;
    z-index: 3;
    width: 13rem;
    background-color: var(--bg-color-dark);
    border: 1px solid var(--zth-border);
    border-top: none;
    box-shadow: 0rem 0rem 2rem var(--zth-box-shadow);
  }

  &-items {
    list-style: none;
  }
  &-item {
    font-weight: 400;
    cursor: pointer;
    font-size: $clamp-font-small;
    font-weight: 500;
    padding: 0.5rem 1.1rem;
    color: var(--zth-text);
    &:hover:not(.long__short-active--item) {
      background-color: var(--zth-hover);
      border-radius: 0.4rem;
    }
  }
  &-active--item {
    background-color: var(--bg-color-dark-soft-purple);
    transition: all 0.3s ease;
    padding-left: 1rem;
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
