<script setup lang="ts">
import { ref } from 'vue';

const open = ref(true);
</script>

<template>
  <div class="long__short">
    <div class="long__short-col">
      <div class="long__short-title">
        <span>Exchange BTC Long/Short Ration</span>
      </div>

      <div class="long__short-chart-select">
        <div class="long__short-chart-select-item">
          <div>Symbol</div>
          <div
            class="long__short-dropdown-symbol"
            :class="
              open
                ? 'long__short-dropdown-symbol'
                : 'long__short-dropdown-symbol--is-open'
            "
          >
            <div ref="list" class="long__short-list">
              <ul ref="itemList" class="long__short-items">
                <li class="long__short-item">BTC</li>
                <li class="long__short-item">ETH</li>
                <li class="long__short-item">CHZ</li>
                <li class="long__short-item">BNB</li>
                <li class="long__short-item">SOL</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="long__short-chart-select-item">
          <div>Period</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.long__short {
  display: flex;
  margin: 1rem;

  &-col {
    display: flex;
    flex: 0 0 100%;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
  }

  &-title {
    font-size: 2rem;
    font-weight: 500;
    color: white;
    padding-bottom: 1rem;
  }

  &-chart-select {
    display: flex;
    flex: 1 0 75%;
    justify-content: flex-end;
    &-item {
      padding-right: 2rem;
      font-weight: 300;
      color: white;
    }
  }
  &-dropdown-symbol {
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
  }
  &-item {
    font-size: 2rem;
    font-weight: 500;
  }
}
</style>
