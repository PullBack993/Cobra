<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onUnmounted, onMounted, ref, watch, computed } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { IWebsocket } from '../Interfaces/IWebsocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';
import DropdownSmall from '../components/DropDownLongShort.vue';
import { useGlobalStore } from '../store/global';

interface ITickVolume {
  symbol: string;
  volume: number;
  buy: number;
  sell: number;
  image: string;
}

interface ITick {
  symbol: string;
  count: number;
  buy: number;
  sell: number;
  image: string;
}

const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;
const allowsCoins = ['BTC', 'USDT'];
const transactions = ref<[IWebsocket]>();
const ticks = ref<[ITick]>();
const store = useGlobalStore();
const overlayByWSDisconnect = ref(false);
const best10Coins = 10;
const loading = ref(true);

const themeClass = computed(() => (store.themeDark ? 'volume-monitor__theme-light' : 'volume-monitor__theme-dark'));

const tickVolume = ref<[ITickVolume]>();
let socket: Socket;
const firstResponse = ref(false);

const sortAscending = (data: [ITickVolume] | [ITick], objProperty: string) => {
  data?.sort((a, b) => (b as any)[objProperty] - (a as any)[objProperty]);
};

const onMountedWS = (dataObject: [IWebsocket], objToAssign: [ITickVolume] | [ITick], objType: string): void => {
  const transformedData: {
    [key: string]: {
      symbol: string;
      volume?: number;
      count?: number;
      buy: number;
      sell: number;
    };
  } = {};
  /* eslint-disable no-restricted-syntax */
  for (const obj of dataObject) {
    const symbol = obj.s.split('USDT')[0];
    const volumeEqualBtc = obj.beq;
    const marketMaker = obj.m;
    const img = obj.image;

    if (objType === 'count') {
      if (!transformedData[symbol]) {
        transformedData[symbol] = {
          symbol,
          count: 0,
          buy: 0,
          sell: 0,
          image: img,
        };
      }
      transformedData[symbol].count = (transformedData[symbol].count ?? 0) + 1;
      if (marketMaker) {
        transformedData[symbol].buy += 1;
      } else {
        transformedData[symbol].sell += 1;
      }
    } else if (objType === 'volume') {
      if (!transformedData[symbol]) {
        transformedData[symbol] = {
          symbol,
          volume: 0,
          buy: 0,
          sell: 0,
          image: img,
        };
      }
      transformedData[symbol].volume = (transformedData[symbol].volume ?? 0) + volumeEqualBtc;
      if (marketMaker) {
        transformedData[symbol].buy += volumeEqualBtc;
      } else {
        transformedData[symbol].sell += volumeEqualBtc;
      }
    }
  }

  if (objType === 'count') {
    ticks.value = Object.values(transformedData) as [ITick];
  } else {
    tickVolume.value = Object.values(transformedData) as [ITickVolume];
  }

  sortAscending(objToAssign, objType);
};

const connectToSocket = () => {
  let connectionAttempts = 0;
  const maxConnectionAttempts = 5;

  const attemptConnection = () => {
    socket = io(baseApiUrl, {
      extraHeaders: {
        'my-custom-header': 'test', // TODO Replace with your authentication token value
      },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      connectionAttempts = 0;
    });

    socket.on('message', (responseData) => {
      console.log(responseData);
      const dataObject: [IWebsocket] = JSON.parse(responseData).reverse();
      if (!firstResponse.value) {
        firstResponse.value = true;
        onMountedWS(dataObject, ticks.value, 'count');
        onMountedWS(dataObject, tickVolume.value, 'volume');
      }
      loading.value = false;
      transactions.value = dataObject;
    });

    socket.on('connect_error', (err) => {
      console.error(err.message);
      if (connectionAttempts < maxConnectionAttempts) {
        connectionAttempts++;
      } else {
        overlayByWSDisconnect.value = true;
        loading.value = false;
        console.log('true');
        socket.disconnect();
      }
    });
  };

  attemptConnection();
};

const getObjectBySymbol = (newTransaction: [IWebsocket]) => {
  if (newTransaction) {
    const symbol = newTransaction[0].s.split('USDT')[0];
    const volumeEqualBtc = newTransaction[0].beq;
    const marketMaker = newTransaction[0].m;
    const img = newTransaction[0].image;

    const matchingSymbol = tickVolume.value?.find((obj) => obj.symbol === symbol);
    if (matchingSymbol) {
      matchingSymbol.volume += volumeEqualBtc;
      if (marketMaker) {
        matchingSymbol.buy += volumeEqualBtc;
      } else {
        matchingSymbol.sell += volumeEqualBtc;
      }
    } else {
      tickVolume.value?.push({
        symbol,
        volume: volumeEqualBtc,
        buy: marketMaker ? volumeEqualBtc : 0,
        sell: marketMaker ? 0 : volumeEqualBtc,
        image: img,
      });
      if (tickVolume.value?.length > best10Coins) {
        tickVolume.value?.pop();
      }
    }
  }
};

const getVolumeBySymbol = (newTransaction: [IWebsocket] | undefined) => {
  if (newTransaction) {
    const symbol = newTransaction[0].s.split('USDT')[0];
    const marketMaker = newTransaction[0].m;
    const img = newTransaction[0].image;
    const matchingSymbol = ticks.value.find((obj) => obj.symbol === symbol);
    if (matchingSymbol) {
      matchingSymbol.count += 1;
      if (marketMaker) {
        matchingSymbol.buy += 1;
      } else {
        matchingSymbol.sell += 1;
      }
    } else {
      ticks.value?.push({
        symbol,
        count: 1,
        buy: marketMaker ? 1 : 0,
        sell: marketMaker ? 0 : 1,
        image: img,
      });
      if (ticks.value?.length > best10Coins) {
        ticks.value?.pop();
      }
    }
  }
};

const getTickForSymbol = (symbol: string) => {
  const tick = ticks.value?.find((obj) => obj.symbol === symbol);
  return tick?.count;
};

watch(
  () => transactions.value,
  (newTransaction) => {
    getObjectBySymbol(newTransaction);
    getVolumeBySymbol(newTransaction);
    sortAscending(ticks.value, 'count');
    if (tickVolume.value) {
      sortAscending(tickVolume.value, 'volume');
    }
  }
);

onMounted(() => {
  connectToSocket();
});

onUnmounted(() => {
  socket.disconnect();
  console.log('Disconnected from WebSocket server');
});
</script>

<template>
  <div>
    <div class="volume-monitor" v-if="!loading">
      <div class="volume-monitor__additional-info">
        <BaseTableFrame class="volume-monitor__container">
          <span class="volume-monitor__left">
            <h3 class="volume-monitor__title" :class="themeClass">Tick Board</h3>
            <small :class="store.themeDark ? 'volume-monitor__title-small--light' : 'volume-monitor__title-small--dark'"
              >The most ticked</small
            >
          </span>
          <table class="tb__table">
            <tbody>
              <tr class="card__td-body" v-for="(tick, i) in ticks" :key="i">
                <td>
                  <div class="card__td-symbol">
                    <span class="card__td-symbol-label">
                      <img :src="tick?.image" class="card__td-img" :alt="tick.symbol" />
                    </span>
                  </div>
                </td>
                <td>
                  <span class="card__td-text-muted"></span>
                  <span class="card__td-text-dynamic" :class="themeClass"
                    >{{ tick.symbol }}
                    <label class="card__td-symbol-text-label">/USDT</label>
                  </span>
                </td>
                <td>
                  <span class="card__td-text-muted">Tick</span>
                  <span class="card__td-text-dynamic">{{ tick.count }}</span>
                </td>
                <td>
                  <span class="card__td-text-muted">Buy</span>
                  <span class="card__td-text-dynamic green">{{ tick.buy }}</span>
                </td>
                <td>
                  <span class="card__td-text-muted">Sell</span>
                  <span class="card__td-text-dynamic red">{{ tick.sell }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </BaseTableFrame>
        <BaseTableFrame class="volume-monitor__container">
          <span class="volume-monitor__left">
            <h3 class="volume-monitor__title" :class="themeClass">Volume Board</h3>
            <small :class="store.themeDark ? 'volume-monitor__title-small--light' : 'volume-monitor__title-small--dark'"
              >The most volume</small
            >
          </span>
          <table class="tb__table">
            <tbody v-if="tickVolume">
              <tr class="card__td-body" v-for="(tick, i) in tickVolume" :key="i">
                <td>
                  <div class="card__td-symbol">
                    <span class="card__td-symbol-label">
                      <img :src="tick?.image" class="card__td-img" :alt="tick.symbol" />
                    </span>
                  </div>
                </td>
                <td>
                  <span class="card__td-text-muted"></span>
                  <span class="card__td-text-dynamic" :class="themeClass"
                    >{{ tick.symbol }}
                    <label class="card__td-symbol-text-label">/USDT</label>
                  </span>
                </td>
                <td>
                  <span class="card__td-text-muted">Volume (₿)</span>
                  <span class="card__td-text-dynamic">{{ tick.volume.toFixed(2) }}</span>
                </td>
                <td>
                  <span class="card__td-text-muted">Buy (₿)</span>
                  <span class="card__td-text-dynamic green">{{ tick.buy.toFixed(2) }}</span>
                </td>
                <td>
                  <span class="card__td-text-muted">Sell (₿)</span>
                  <span class="card__td-text-dynamic red">{{ tick.sell.toFixed(2) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </BaseTableFrame>
      </div>
      <div class="volume-monitor__main">
        <BaseTableFrame class="volume-monitor__container-tb">
          <div class="volume-monitor__additional-items">
            <span class="volume-monitor__left">
              <h3 class="volume-monitor__title" :class="themeClass">Volume Monitor</h3>
              <small
                :class="store.themeDark ? 'volume-monitor__title-small--light' : 'volume-monitor__title-small--dark'"
                >Thank you Binance</small
              >
            </span>
            <div class="volume-monitor__dropdown-container">
              <DropdownSmall :data="allowsCoins" :with-arrow-icon="true" :readonly="true" />
              <DropdownSmall
                :data="['1 BTC', '2 BTC', '3 BTC', '4 BTC', '5 BTC']"
                :with-arrow-icon="true"
                :readonly="true"
              />
            </div>
          </div>
          <table class="tb__table">
            <thead></thead>
            <tbody>
              <tr class="card__td-body" v-for="(transaction, i) in transactions" :key="i">
                <td>
                  <div class="card__td-symbol">
                    <span class="card__td-symbol-label">
                      <img :src="transaction?.image" class="card__td-img" :alt="transaction.s.split('USDT')[0]" />
                    </span>
                  </div>
                </td>
                <td>
                  <div href="" class="image">
                    <label class="card__td-symbol-text" :class="themeClass">{{ transaction.s.split('USDT')[0] }}</label>
                    <label class="card__td-symbol-text-label">/USDT</label>
                  </div>
                </td>
                <td>
                  <span class="card__td-text-muted">Tick</span>
                  <span class="card__td-text-dynamic">
                    <span>{{ getTickForSymbol(transaction.s.split('USDT')[0]) }}</span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Volume (₿)</span>
                    <span class="card__td-text-dynamic" :class="transaction.m ? 'green' : 'red'">
                      {{ Number(transaction.beq).toFixed(2) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Market Maker</span>
                    <span class="card__td-text-dynamic" :class="transaction.m ? 'green' : 'red'">
                      {{ transaction.m ? 'BUY' : 'SELL' }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Current Price</span>
                    <span class="card__td-text-dynamic">
                      {{ Number(transaction.p).toFixed(2) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Quantity</span>
                    <span class="card__td-text-dynamic">
                      {{ Number(transaction.q).toFixed(2) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span class="text-primary">
                    <span class="card__td-text-muted">Date</span>
                    <span class="card__td-text-dynamic">
                      {{ transaction.T }}
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </BaseTableFrame>
      </div>
    </div>
    <div v-else>
      <div class="volume-monitor__placeholder">
        <div class="volume-monitor__info-container">
          <placeHolderLoader
            class="volume-monitor__placeholder-left"
            :loader-width="100"
            :width-unit="'%'"
            :loader-height="50"
          ></placeHolderLoader>
          <placeHolderLoader
            class="volume-monitor__placeholder-left"
            :loader-width="100"
            :width-unit="'%'"
            :loader-height="50"
          ></placeHolderLoader>
        </div>
        <placeHolderLoader
          class="volume-monitor__placeholder-right"
          :loader-width="66.66"
          :width-unit="'%'"
          :loader-height="102"
        ></placeHolderLoader>
      </div>
    </div>
    <div v-if="overlayByWSDisconnect" :class="{ overlay: overlayByWSDisconnect }">
      <div class="overlay-content">
        <h2 class="overlay-title">Disconnected from WebSocket</h2>
        <p>Sorry, the WebSocket connection has been disconnected.</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.root) {
  margin-bottom: 5rem;
  align-content: rig;
  width: 12rem;
  float: right;
  margin-right: 1rem;
  margin-top: 1rem;
}
@media (min-width: $breakpoint_medium) {
  :deep(.root) {
    margin-right: 2rem;
    margin-bottom: 6rem;
  }
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  backdrop-filter: blur(5px); /* Apply blur effect */
  display: block; /* Initially hidden */
  &-title {
    margin-bottom: 2rem;
  }
}

.overlay-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.volume-monitor {
  display: flex;
  flex-direction: column-reverse;

  &__left {
    margin: 1rem;
    display: flex;
    flex-direction: column;
  }

  &__container {
    margin-right: 2rem;
    height: auto;
    width: 100%;
  }
  &__container-tb {
    overflow: hidden;
  }
  &__additional-items {
    display: flex;
    justify-content: space-between;
  }
  &__dropdown-container {
    display: flex;
    padding-right: 1rem;
  }
  &__title {
    font-weight: bold;
    &-small--dark {
      color: $white-5;
    }
    &-small--light {
      color: $grey-black-8;
    }
  }

  &__theme-light {
    color: $black;
  }

  &__theme-dark {
    color: $white;
  }

  small {
    margin-right: 7rem;
    font-size: 1.1rem;
    width: 100%;
  }
  &__additional-info {
    display: flex;
    width: 100%;
    flex-direction: column;
  }
  &__main {
    width: 100%;
    flex: 0 0 auto;
  }
}

.tb__table {
  width: 100%;
  color: $white;
  caption-side: bottom;
  border-collapse: collapse;
  border-radius: 1rem;
  overflow: hidden;
}
.card__td {
  &-body:not(:last-child) {
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    border-bottom-color: $white;
  }
  &-img {
    border-radius: 50%;
  }
  &-symbol {
    display: inline-block;
    flex-shrink: 0;
    border-radius: 0.475rem;
    &-label {
      width: 5rem;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 0.475rem;
    }
    &-text {
      display: inline-block;
      font-weight: 600;
      &-label {
        color: $white-5;
        font-size: 11px;
        text-decoration: none;
      }
    }
  }
  &-text-muted {
    display: block;
    color: $white-5;
    font-weight: 600;
    font-size: 1.4rem;
    padding-bottom: 0.5rem;
  }
  &-text-dynamic {
    font-weight: 700;
  }
}

td {
  padding: 0.7rem;
}

tr:nth-child(odd) {
  background-color: $input-bg-dark;
}

tr:nth-child(even) {
  background-color: $input-bg-dark-8;
}

.green {
  color: $chart-light-green;
}
.red {
  color: $chart-red;
}

@media (min-width: $breakpoint_verysmall) {
  .volume-monitor__additional-info {
    width: 100%;
    flex-direction: row;
  }
}

@media (min-width: $breakpoint_medium) {
  .volume-monitor {
    flex-direction: row;

    &__container {
      width: auto;
    }

    &__additional-info {
      display: flex;
      flex: 0 0 auto;
      width: 33.33%;
      flex-direction: column;
    }
    &__main {
      width: 66.66%;
      flex: 0 0 auto;
    }
  }
}

// place loader style
.volume-monitor {
  &__placeholder {
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
  }
  &__info-container {
    display: flex;
    width: 97%;
    flex-direction: column;
  }
  &__placeholder-left {
    margin: 1rem;
    width: 100% !important;
    border-radius: 1rem;
  }
  &__placeholder-right {
    width: 97% !important;
    height: 102rem;
    border-radius: 1rem;
    margin: 1rem;
  }
}

@media (min-width: $breakpoint_verysmall) {
  .volume-monitor__info-container {
    width: 100%;
    flex-direction: row;
  }
}
@media (min-width: $breakpoint_medium) {
  .volume-monitor {
    &__placeholder {
      flex-direction: row;
    }
    &__info-container {
      display: flex;
      flex-direction: column;
      width: 33.33%;
    }
    &__placeholder-left {
      margin: 1rem;
      width: 100% !important;
      border-radius: 1rem;
    }
    &__placeholder-right {
      width: 65.66%;
      height: 102rem;
      margin-left: 3rem;
      margin-top: 1rem;
      border-radius: 1rem;
    }
  }
}
</style>
