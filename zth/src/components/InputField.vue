<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useGlobalStore } from '../store/global';

interface Props {
  currentItem?: number;
  open: boolean;
  root: HTMLElement;
  coins?: number;
  prevent?: boolean;
  value?: string;
  noResult?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentItem: 0,
  open: false,
  coins: 0,
  prevent: true,
  value: '',
  noResult: false,
});
const emit = defineEmits([
  'keyArrow',
  'onInput',
  'clearValues',
  'scrollDirection',
  'open',
  'enter:event',
]);
const dropDownOpen = ref(props.open);
const searchParams = ref(props.value);
const selectedItem = ref(props.currentItem);
const input = ref<HTMLInputElement>();
const store = useGlobalStore();
const lengthCoins = ref(0);
const savedValue = ref(props.value);
const isNotResult = ref(false);

watch(
  () => props.noResult,
  (newValue) => {
    isNotResult.value = newValue;
  }
);

watch(
  () => props.currentItem,
  (newValue) => {
    selectedItem.value = newValue;
  }
);

watch(
  () => props.value,
  (newValue) => {
    if (newValue !== 'No results') {
      searchParams.value = newValue;
      savedValue.value = newValue;
    } else {
      isNotResult.value = true;
    }
  }
);

watch(
  () => props.coins,
  (newLength) => {
    lengthCoins.value = newLength;
  }
);

watch(
  () => props.open,
  (newValue) => {
    dropDownOpen.value = newValue;
    addClickEvent();
  }
);

onMounted(() => {
  window.addEventListener('keydown', documentKey);
});

function documentKeyDown(event: KeyboardEvent) {
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
    default:
      break;
  }
}

function selectInput() {
  input?.value?.focus();
  if (dropDownOpen.value === false) {
    addClickEvent();
    emit('open', true);
    emit('scrollDirection', 0);
  } else {
    input?.value?.blur();
    emit('open', false);
    emit('scrollDirection', 0);
    document.removeEventListener('click', documentClick);
  }
}

function addClickEvent() {
  document.addEventListener('click', documentClick);
}

function documentKey(event: KeyboardEvent) {
  const { key } = event as KeyboardEvent;
  if (
    event.ctrlKey &&
    (key === 'f' || key === 'F') &&
    dropDownOpen.value === false &&
    !props.prevent
  ) {
    console.log('fffff')
    emit('open', true);
    event.preventDefault();
    input?.value?.focus();
    addClickEvent();
  }
}

function documentClick(event: Event) {
  if (
    dropDownOpen.value &&
    event.target &&
    !props.root.contains(event.target as HTMLElement)
  ) {
    emit('open', false);
    document.removeEventListener('click', documentClick);
    document.removeEventListener('click', documentKey);
    if (!searchParams.value || isNotResult.value) {
      searchParams.value = savedValue.value;
    }
    if (searchParams.value !== savedValue.value) {
      searchParams.value = savedValue.value;
      emit('onInput', searchParams.value);
    }
  }
  if (isNotResult.value) {
    searchParams.value = savedValue.value;
    emit('onInput', searchParams.value);
  }
}

function handleArrowUp() {
  if (dropDownOpen.value && selectedItem.value > 0) {
    emit('scrollDirection', -1);
  }
}

function handleTabEvent() {
  if (dropDownOpen.value) {
    emit('open', false);
  }
}

function handleArrowDown() {
  if (dropDownOpen.value && props.coins - 2 >= selectedItem.value) {
    emit('scrollDirection', 1);
  }
}

function handleEnterEvent() {
  if (dropDownOpen.value && !isNotResult.value) {
    input?.value?.blur();
    document.removeEventListener('click', documentClick);
    emit('enter:event');
    emit('open', false);
    if (!searchParams.value || isNotResult) {
      searchParams.value = savedValue.value;
    }
  } else {
    selectInput();
    searchParams.value = savedValue.value;
    emit('onInput', searchParams.value);
  }
}

function handleEscapeEvent() {
  if (dropDownOpen.value) {
    // dropDownOpen.value = false;
    emit('open', false);
    input?.value?.blur();
    emit('clearValues', '');
    document.removeEventListener('click', documentClick);
  }
}

function onInput() {
  searchParams.value = searchParams.value.replace(/[^a-zA-Z1234567890]/g, '');
  emit('onInput', searchParams.value);
}
</script>
<template>
  <input
    @click="selectInput()"
    @keydown="documentKeyDown($event)"
    @input="onInput"
    :readonly="readonly"
    type="text"
    class="input"
    ref="input"
    :class="[
      `${open ? 'input-open' : 'input-close'}`,
      `${store.themeDark ? 'bg-dark' : 'bg-light'}`,
    ]"
    v-model="searchParams"
    aria-labelledby="search"
  />
</template>
<style lang="scss" scoped>
//TODO DARK LIGHT !!!

.bg-dark {
  background-color: $main-light-purple;
}
.bg-light {
  background-color: $input-bg-dark;
}
.input {
  width: 100%;
  height: 5rem;
  border-radius: 1rem;
  border: none;
  padding-right: 2.7rem;
  &-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  &-close {
    border-radius: 1rem;
  }
}

@media (min-width: $breakpoint_small) {
  .input {
    padding-left: 1rem;
  }
}
</style>
