<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import axios from 'axios';
import DropdownSmall from '@/components/DropDownLongShort.vue';
import GraphicLongShort from '@/components/GraphicLongShort.vue';
import allCoins from '../components/data/coinglass.json';
import { useGlobalStore } from '../store/global';
import { Coin } from '../Interfaces/ICoinLongShort';

const allowsCoins = allCoins;
const currentValue = ref('BTC');
const currentTime = ref('1 hour');
const coins = ref<Coin | []>([]);
const intervalId = ref(0);
const loading = ref(false);
const store = useGlobalStore();
const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;
// TODO constant => file
const timeMap: { [timeWord: string]: string } = {
  '5 minute': 'm5',
  '15 minute': 'm15',
  '30 minute': 'm30',
  '1 hour': 'h1',
  '4 hour': 'h4',
  '12 hour': 'h12',
  '24 hour': 'h24',
};

// todo implement it
interface Props {
  coins?: Coin;
  loading: boolean;
}

const transformTime = (timeWord: string) => {
  return timeMap[timeWord];
};

const themeClass = computed(() => (store.themeDark ? 'long__short-theme--light' : 'long__short-theme--dark'));

function valueChange(value: string) {
  currentValue.value = value; // ETH req
}

function timeChange(value: string) {
  currentTime.value = value;
}

onMounted(() => {
  reqData();
});

onUnmounted(() => {
  clearInterval(intervalId.value);
});

watch(
  () => [currentTime.value, currentValue.value],
  ([newTime, newSymbol]) => {
    clearInterval(intervalId.value);
    loading.value = true;
    coins.value = [];

    reqData();
    intervalId.value = Number(setInterval(reqData, 13000));
  }
);

function reqData() {
  const ransformedTime = transformTime(currentTime.value);
  const coinData = { time: ransformedTime, coin: currentValue.value };
  axios
    .post(`${baseApiUrl}/exchange/long-short`, coinData)
    .then((res) => {
      coins.value = res.data;
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.error(err);
    });
}

intervalId.value = Number(setInterval(reqData, 13000));
</script>

<template>
  <div class="main-long__short">
    <div class="long__short">
      <div class="long__short-col">
        <div :class="themeClass" class="long__short-title">
          <span>Exchange {{ currentValue }} Long/Short Ration</span>
        </div>

        <div class="long__short-chart-select">
          <div class="long__short-chart-select-item" :class="themeClass">
            <div class="long__short-symbol">Symbol</div>
            <DropdownSmall :data="allowsCoins" @new-value:input="valueChange" />
          </div>
          <div class="long__short-chart-select-item">
            <div class="long__short-period" :class="themeClass">Period</div>
            <div :class="themeClass" class="long__short-dropdown">
              <DropdownSmall
                :with-arrow-icon="true"
                :readonly="true"
                :propsCurrentIndexItem="3"
                :preselected-value="3"
                :data="['5 minute', '15 minute', '30 minute', '1 hour', '4 hour', '12 hour', '24 hour']"
                @new-value:input="timeChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <GraphicLongShort :loading="loading" :coins="coins"></GraphicLongShort>
  </div>
</template>

<style scoped lang="scss">
:deep(.long__short-value){
  width: 13.4rem;
}
:deep(.long__short-chart-select){
  gap: 1rem;
}
.long__short {
  display: flex;
  margin: 1rem;

  &-dropdown {
    width: 14rem;
  }

  &-col {
    display: flex;
    flex: 0 0 100%;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
  }

  &-title {
    margin: 1rem auto;
    font-size: 3rem;
    font-weight: 500;
    padding-bottom: 1rem;
  }

  &-theme--dark {
    color: $white;
    --text-color: $white;
  }

  &-theme--light {
    color: $main-purple;
  }

  &-chart-select {
    display: flex;
    flex: 1 0 100%;
    justify-content: flex-end;
    margin: 1rem 0;

    &-item {
      position: relative;
      height: 3rem;
      width: 14rem;
      margin-bottom: 2rem;
      padding-right: 2rem;
      font-weight: 300;
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
