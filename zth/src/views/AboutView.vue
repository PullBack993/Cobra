<script setup lang="ts">
import {ref} from 'vue';
import DropdownSmall from '../components/DropdownSmall.vue';

const data = ['BTC', 'ETH', 'ETC', 'SOL', 'CHZ', 'TWT', 'LINK', 'FTM', 'EOS'];
const currentValue = ref('BTC');
function valueChange(value) {
  currentValue.value = value;
}
</script>

<template>
  <div class="long__short">
    <div class="long__short-col">
      <div class="long__short-title">
        <span>Exchange {{currentValue}} Long/Short Ration</span>
      </div>

      <div class="long__short-chart-select">
        <div class="long__short-chart-select-item">
          <div class="long__short-symbol">Symbol</div>
          <DropdownSmall :data="data" @new-value:input="valueChange" />
        </div>
        <div class="long__short-chart-select-item">
          <div class="long__short-period">Period</div>
          <DropdownSmall
            :data="[
              '5 minutes',
              '15 minutes',
              '30 minutes',
              '1 hour',
              '4 hour',
              '12 hour',
              '24 hour',
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
    margin: auto;
  }

  &-chart-select {
    display: flex;
    flex: 1 0 100%;
    justify-content: flex-end;
    &-item {
      padding-right: 2rem;
      font-weight: 300;
      color: white;
    }
  }
  &-symbol,
  &-period {
    margin-left: 1.1rem;
    margin-bottom: 0.5rem;
    font-size: 1.6rem;
    font-weight: 500;
  }
}
</style>
