<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from 'axios';
import DropdownSmall from '@/components/DropDownLongShort.vue';
import GraphicLongShort from '@/components/GraphicLongShort.vue';
import allCoins from '../components/data/coinglass.json';
import { Coin } from '../Interfaces/ICoinLongShort';

const allowsCoins = allCoins;
const currentValue = ref('BTC');
const currentTime = ref('24 hour');
const coins = ref<Coin | []>([]);
const intervalId = ref(0);
const loading = ref(true);
const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;
// TODO constant => file
const timeMap: { [timeWord: string]: string } = { // TODO implement this
  // '5 minute': 'm5',
  // '15 minute': 'm15',
  // '30 minute': 'm30',
  // '1 hour': 'h1',
  // '4 hour': 'h4',
  // '12 hour': 'h12',
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

const valueChange = (value: string) => {
  currentValue.value = value; // ETH req
};

const timeChange = (value: string) => {
  currentTime.value = value;
};

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
    intervalId.value = Number(setInterval(reqData, 20000));
  }
);

const reqData = () => {
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
};

intervalId.value = Number(setInterval(reqData, 20000));
</script>

<template>
  <div class="main-long__short">
    <div class="long__short">
      <div class="long__short-col">
        <div class="long__short-title long__short-theme">
          <span class="long__short-title--text">{{ currentValue }} Long/Short Ration</span>
        </div>

        <div class="long__short-chart-select">
          <div class="long__short-chart-select-item long__short-theme" >
            <div class="long__short-symbol">Symbol</div>
            <div  class="long__short-dropdown">
              <DropdownSmall :data="allowsCoins" @new-value:input="valueChange" />
            </div>
          </div>
          <div class="long__short-chart-select-item">
            <div class="long__short-period long__short-theme">Period</div>
            <div class="long__short-dropdown long__short-theme">
              <DropdownSmall
                :with-arrow-icon="true"
                :readonly="true"
                :data="[ '24 hour']"
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
:deep(.long__short-value) {
  width: 10rem;
}
:deep(.long__short-dropdown-symbol) {
  width: 10rem;
}

:deep(.long__short-list) {
  width: 10rem;
}

@media (min-width: $breakpoint_mobiletabs) {
  :deep(.long__short-value) {
    width: 13.4rem;
  }
  :deep(.long__short-dropdown-symbol) {
    width: 13.4rem;
  }

  :deep(.long__short-list) {
    width: 13.4rem;
  }
}

:deep(.long__short-chart-select) {
  gap: 0;
}
@media (min-width: $breakpoint_mobiletabs) {
  :deep(.long__short-chart-select) {
    gap: 1rem;
  }
}

:deep(.long__short-icon) {
  right: 0.8rem;
  top: 0.8rem;
}
.main-long__short {
  overflow: hidden;
  max-width: 144rem;
margin: auto;
}

.long__short {
  display: flex;

  &-col {
    display: flex;
    flex: 0 0 100%;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
  }

  &-title {
    padding-bottom: 0.5rem;
    margin: 0;
    margin: 0rem auto;
    @media (min-width: $breakpoint-mobiletabs) {
      padding-bottom: 1rem;
      margin: 1rem auto;
    }
    &--text {
      font-size: clamp($font-almost-large, 2vw + 1rem, $font-large);
      line-height: $line-height-verysmall;
      font-weight: 500;
    }
  }

  &-theme {
    color: var(--zth-text);
  }
  &-chart-select {
    display: flex;
    justify-content: flex-end;
    margin: 1rem 0;
    flex: 1 1 100%;

    &-item {
      position: relative;
      height: 3rem;
      margin-bottom: 2rem;
      padding-right: 2rem;
      font-weight: 300;
    }
  }

  &-symbol,
  &-period {
    margin-left: 1.1rem;
    margin-bottom: 0.5rem;
    font-size: clamp($font-small-tiny, 1vw + 0.8rem, $font-very-small);
    font-weight: 400;
  }
}
</style>
