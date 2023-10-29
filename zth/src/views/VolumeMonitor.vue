<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { IWebsocket, ITickVolume, ITick } from '../Interfaces/IWebsocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';
import VolumeMonitorBoard from '../components/VolumeMonitorBoard.vue';
import DropdownSmall from '../components/DropDownLongShort.vue';
import { useGlobalStore } from '../store/global';
import defaultimage from '../assets/BaseIcons/default-image.png';

const store = useGlobalStore();
const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;

const allowsCoins = ['BTC', 'USDT']; // TODO should implement this
const transactions = ref<[IWebsocket]>([]);
const ticks = ref<[ITick]>([]);
const tickVolume = ref<[ITickVolume]>([]);
const overlayByWSDisconnect = ref(false);
const firstResponse = ref(false);
const best20Coins = 20;
const loading = ref(true);
const last20Coins: IWebsocket[] = [];
const btcSelectedVolume = ref(0.5);

const socket = io(baseApiUrl, {
  extraHeaders: {
    'my-custom-header': 'test', // TODO Replace with your authentication token value
  },
});

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
};

const getObjectBySymbol = (newTransaction: IWebsocket) => {
  if (newTransaction) {
    const symbol = newTransaction.s.split('USDT')[0];
    const volumeEqualBtc = newTransaction.beq;
    const marketMaker = newTransaction.m;
    const img = newTransaction.image;
    const matchingSymbol = tickVolume.value?.find((obj) => obj.symbol === symbol);
    if (matchingSymbol) {
      matchingSymbol.volume += volumeEqualBtc;
      if (marketMaker) {
        matchingSymbol.buy += volumeEqualBtc;
      } else {
        matchingSymbol.sell += volumeEqualBtc;
      }
    } else {
      if (tickVolume.value?.length >= best20Coins) {
        tickVolume.value?.pop();
      }
      tickVolume.value?.push({
        symbol,
        volume: volumeEqualBtc,
        buy: marketMaker ? volumeEqualBtc : 0,
        sell: marketMaker ? 0 : volumeEqualBtc,
        image: img,
      });
    }
  }
};

const getVolumeBySymbol = (newTransaction: IWebsocket | undefined) => {
  if (newTransaction) {
    const symbol = newTransaction.s.split('USDT')[0];
    const marketMaker = newTransaction.m;
    const img = newTransaction.image;
    const matchingSymbol = ticks.value.find((obj) => obj.symbol === symbol);
    if (matchingSymbol) {
      matchingSymbol.count += 1;
      if (marketMaker) {
        matchingSymbol.buy += 1;
      } else {
        matchingSymbol.sell += 1;
      }
    } else {
      if (ticks.value?.length >= best20Coins) {
        ticks.value?.pop();
      }
      ticks.value?.push({
        symbol,
        count: 1,
        buy: marketMaker ? 1 : 0,
        sell: marketMaker ? 0 : 1,
        image: img,
      });
    }
  }
};
const updateTableBoard = (): void => {
  onMountedWS(transactions.value, ticks.value, 'count');
  onMountedWS(transactions.value, tickVolume.value, 'volume');
  sortAscending(ticks.value, 'count');
  sortAscending(tickVolume.value, 'volume');
};

const connectToSocket = () => {
  let connectionAttempts = 0;
  const maxConnectionAttempts = 5;

  const attemptConnection = () => {
    socket.on('connect', () => {
      connectionAttempts = 0;
    });

    socket.on('message', (responseData) => {
      const dataObject: [IWebsocket] = JSON.parse(responseData).reverse();
      transactions.value = dataObject.filter((item: IWebsocket) => {
        last20Coins.unshift(item);
        if (last20Coins.length > 100 && item.beq >= btcSelectedVolume.value) {
          last20Coins.pop();
        }
        return item.beq >= btcSelectedVolume.value;
      });

      if (!firstResponse.value) {
        firstResponse.value = true;
        updateTableBoard();
      } else {
        getObjectBySymbol(transactions.value[0]);
        getVolumeBySymbol(transactions.value[0]);
        sortAscending(ticks.value, 'count');
        if (tickVolume.value) {
          sortAscending(tickVolume.value, 'volume');
        }
      }
      loading.value = false;
    });

    socket.on('connect_error', (err) => {
      console.error(err.message);
      if (connectionAttempts < maxConnectionAttempts) {
        connectionAttempts++;
      } else {
        overlayByWSDisconnect.value = true;
        loading.value = false;
        socket.disconnect();
      }
    });
  };
  attemptConnection();
};

const getTickForSymbol = (symbol: string) => {
  const tick = ticks.value?.find((obj) => obj.symbol === symbol);
  return tick?.count;
};

onMounted(() => {
  connectToSocket();
});

onBeforeUnmount(() => {
  socket.disconnect();
});

const btcCountChanged = (value: string) => {
  btcSelectedVolume.value = Number(value.split(' ')[0]);
  transactions.value = last20Coins.filter((item: IWebsocket) => item.beq >= btcSelectedVolume.value).reverse();
  updateTableBoard();
};
</script>

<template>
  <div>
    <div class="volume-monitor" v-if="!loading">
      <div class="volume-monitor__additional-info">
        <VolumeMonitorBoard
          :data="ticks"
          :board-title="'Tick Board'"
          :board-title-addition="'The most ticked'"
        />
        <VolumeMonitorBoard
          :data="tickVolume"
          :board-title="'Volume Board'"
          :board-title-addition="'The most volume'"
        />
      </div>
      <div class="volume-monitor__main">
        <BaseTableFrame class="volume-monitor__container-tb">
          <div class="volume-monitor__additional-items">
            <span class="volume-monitor__left">
              <h3 class="volume-monitor__title volume-monitor__theme">Volume Monitor</h3>
              <small>Thank you Binance</small>
            </span>
            <div class="volume-monitor__dropdown-container">
              <!-- <DropdownSmall :data="allowsCoins" :with-arrow-icon="true" :readonly="true" />  TODO Implement it -->
              <DropdownSmall
                :data="['0.5 BTC', '1 BTC', '2 BTC', '3 BTC', '4 BTC', '5 BTC']"
                :with-arrow-icon="true"
                :readonly="true"
                @new-value:input="btcCountChanged"
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
                      <img
                        v-if="transaction.image"
                        :src="transaction?.image"
                        class="card__td-img"
                        loading="lazy"
                        :alt="transaction.s.split('USDT')[0]"
                      />
                      <img
                        v-else
                        :src="defaultimage"
                        :alt="transaction.s.split('USDT')[0]"
                        class="card__td-img"
                        loading="lazy"
                      />
                    </span>
                  </div>
                </td>
                <td>
                  <div>
                    <span class="card__td-symbol-text volume-monitor__theme">
                      {{ transaction.s.split('USDT')[0] }}
                    <label class="card__td-symbol-text-label">/USDT</label>
                  </span>
                  </div>
                </td>
                <td>
                  <span class="card__td-text-muted">Tick</span>
                  <span class="card__td-text-dynamic">
                    {{ getTickForSymbol(transaction.s.split('USDT')[0]) }}
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Volume (₿)</span>
                    <span class="card__td-text-dynamic" :class="!transaction.m ? 'green' : 'red'">
                      {{ Number(transaction.beq).toFixed(4) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Market Maker</span>
                    <span class="card__td-text-dynamic" :class="!transaction.m ? 'green' : 'red'">
                      {{ transaction.m ? 'SELL' : 'BUY' }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Current Price</span>
                    <span class="card__td-text-dynamic">
                      {{ Number(transaction.p).toFixed(4) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span>
                    <span class="card__td-text-muted">Quantity</span>
                    <span class="card__td-text-dynamic">
                      {{ Number(transaction.q).toFixed(4) }}
                    </span>
                  </span>
                </td>
                <td>
                  <span class="text-primary">
                    <span class="card__td-text-muted">Date</span>
                    <span class="card__td-text-dynamic--date">
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
:deep(.volume-monitor__container:first-of-type) {
  margin-right: 1rem;
}

@media (min-width: $breakpoint_medium) {
  :deep(.root) {
    margin-right: 2rem;
    margin-bottom: 6rem;
  }
  :deep(.volume-monitor__container:first-of-type) {
    margin-right: 0rem;
  }
}
:deep(.tb_responsive) {
  max-height: 100rem;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  backdrop-filter: blur(0.5rem); /* Apply blur effect */
  -webkit-backdrop-filter: blur(0.5rem);
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
  color: $white;
}

.volume-monitor {
  display: flex;
  flex-direction: column;

  &__container {
    height: 30rem;
    overflow: auto;
    @include customHorizontalScrollbar($height: 0.1rem, $width: 0.2rem, $border-radius: 0.5rem);
    @media(min-width: $breakpoint_medium) {
        max-height: auto;
        height: auto;
    }
  }

  &__left {
    margin: 1rem;
    display: flex;
    flex-direction: column;
  }

  &__container-tb {
    max-height: 120rem;
    overflow: auto;
    @include customHorizontalScrollbar($height: 0.1rem, $width: 0.3rem, $border-radius: 0.5rem);
  }

  &__additional-items {
    display: flex;
    justify-content: space-between;
    height: 7rem;
  }

  &__dropdown-container {
    display: flex;
    padding-right: 1rem;
    gap: 1rem;
  }

  &__title {
    font-weight: 500;
    margin-bottom: 0.2rem;
  }
  &__theme{
    color: var(--zth-text);
  }
  small {
    margin-right: 7rem;
    font-size: 1.1rem;
    width: 100%;
    color: $grey-black-8;
  }
  &__additional-info {
    display: flex;
    width: 100%;
    margin-top: 1rem;
    flex-direction: column;

    @media (min-width: $breakpoint_medium) {
      margin-top: 0;
    }
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
  margin-top: 1rem;
  @media(min-width: $breakpoint_medium) {
    margin-top: 0;
  }
}
.card__td {
  &-body:not(:last-child) {
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    border-bottom-color: $white;
  }
  &-img {
    border-radius: 50%;
    width: $clamp-font-large-quite-large;
    height: $clamp-font-large-quite-large;
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
      font-weight: 700;
      font-size:  $clamp-font-very-small-medium;

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
    
    font-size:  $clamp-font-very-small;
    padding-bottom: 0.5rem;
    white-space: nowrap;
  }
  &-text-dynamic {
    font-weight: 700;
    font-size: $clamp-font-very-small-medium;
    &--date {
      font-size: $clamp-font-small;
    }
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
    margin-right: 2rem;
    max-height: 120rem;

    &__additional-info {
      display: flex;
      flex: 0 0 auto;
      width: 33.33%;
      flex-direction: column;
      margin-right: 2rem;
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
    width: 95%;
    flex-direction: column;
  }
  &__placeholder-left {
    margin: 1rem;
    width: 100% !important;
    border-radius: 1rem;
  }
  &__placeholder-right {
    width: 95% !important;
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
