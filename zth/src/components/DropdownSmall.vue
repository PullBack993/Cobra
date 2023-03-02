<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ArrowIcon from '../assets/BaseIcons/arrow.svg';

interface Props {
  data?: string[]; // symbol or period of time
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ['BTC', 'ETH'],
});

function selectedItem(event: Event) {
  console.log(event.target);
}
const open = ref(true);
</script>

<template>
  <input class="long__short-value" @focus="open = !open" @blur="open = false" />
  <Arrow-Icon
    class="long__short-arrow-icon"
    :class="open ? 'long__short-arrow-rotate' : ''"
  ></Arrow-Icon>
  <div
    class="long__short-dropdown-symbol"
    :class="
      open
        ? 'long__short-dropdown-symbol'
        : 'long__short-dropdown-symbol--is-open'
    "
  >
    <div ref="list" class="long__short-list">
      <ul class="long__short-items">
        <li
          class="long__short-item"
          v-for="(name, index) in props.data"
          :key="index"
          @click="selectedItem"
        >
          {{ name }}
        </li>
      </ul>
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
  &-arrow-icon {
    position: absolute;
    right: 2.8rem;
    top: 2.6rem;
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
