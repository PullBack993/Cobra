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
}

const props = withDefaults(defineProps<Props>(), {
  currentItem: 0,
  open: false,
  coins: 0,
  prevent: true,
  value: '',
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

watch(
  () => props.currentItem,
  (newValue) => {
    selectedItem.value = newValue;
  }
);

watch(
  () => props.value,
  (newValue) => {
    searchParams.value = newValue;
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
  }
);
onMounted(() => {
  window.addEventListener('keydown', documentKey);
});

const selectInput = () => {
  input?.value?.focus();
  if (dropDownOpen.value === false) {
    addClickEvent();
    emit('open', true);
    emit('scrollDirection', 0);

  }
};
function addClickEvent() {
  document.addEventListener('click', documentClick);
}

function documentKey(event: Event) {
  const { key } = event as KeyboardEvent;
  if (
    (key === 'f' || key === 'F') &&
    dropDownOpen.value === false &&
    !props.prevent
  ) {
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
  }
}
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

function handleArrowUp() {
  if (dropDownOpen.value && selectedItem.value > 0) {
    emit('scrollDirection', -1);
  }
}
function handleTabEvent() {
  if (!dropDownOpen.value) {
    emit('open', true);
  }
}
function handleArrowDown() {
  if (dropDownOpen.value && props.coins - 2 >= selectedItem.value) {
    emit('scrollDirection', 1);
  }
}

function handleEnterEvent() {
  if (dropDownOpen.value) {
    input?.value?.blur();
    document.removeEventListener('click', documentClick);
    emit('enter:event');
    emit('open', false);
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
  searchParams.value = searchParams.value.replace(/[^a-zA-Z1]/g, '');
  emit('onInput', searchParams.value);
}
</script>
<template>
  <input
    @click="selectInput()"
    @keydown="documentKeyDown($event)"
    @input="onInput"
    type="text"
    class="input"
    ref="input"
    :class="[
      `${open ? 'input-open' : 'input-close'}`,
      `${store.themeDark ? 'bg-dark' : 'bg-light'}`,
    ]"
    pattern="[a-zA-Z]+"
    v-model="searchParams"
    aria-labelledby="search"
  />
</template>
<style lang="scss" scoped>
//TODO DARK LIGHT !!!

// .bg-dark {
//   background-color: black;
// }
// .bg-light {
//   background-color: wheat;
// }
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
