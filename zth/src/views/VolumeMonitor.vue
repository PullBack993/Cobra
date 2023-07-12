<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { IWebsocket } from '../Interfaces/IWebsocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';
import DropdownSmall from '../components/DropDownLongShort.vue';

const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;
const allowsCoins = ['BTC', 'USDT'];
const transactions = ref<[IWebsocket]>([
  {
    e: 'aggTrade',
    E: 1688288752003,
    s: 'BNBUSDT',
    a: 493574274,
    p: '244.70000000',
    q: '183.05800000',
    f: 659799176,
    l: 659799198,
    T: 1688288752001,
    m: true,
    M: true,
    beq: 15.4,
  },
  {
    e: 'aggTrade',
    E: 1688288600201,
    s: 'BTCUSDT',
    a: 2665713610,
    p: '30500.00000000',
    q: '2.23799000',
    f: 3161217562,
    l: 3161217601,
    T: 1688288600198,
    m: false,
    M: true,
    beq: 12.31,
  },
  {
    e: 'aggTrade',
    E: 1688288596170,
    s: 'SOLUSDT',
    a: 249176099,
    p: '19.11000000',
    q: '1790.97000000',
    f: 367243316,
    l: 367243327,
    T: 1688288596168,
    m: true,
    M: true,
    beq: 1,
  },
]);
const ticks = ref<[ITick]>([
  { symbol: 'BTC', count: 1 },
  { symbol: 'ETH', count: 5 },
  { symbol: 'BNB', count: 155 },
]);
interface ITickVolume {
  symbol: string;
  volume: number;
}

interface ITick {
  symbol: string;
  count: number;
}
const tickVolume = ref<[ITickVolume]>();
let socket: Socket;
const firstResponse = ref(false);

const sortAscending = (data: [ITickVolume] | [ITick], objProperty: string) => {
  data?.sort((a, b) => (b as any)[objProperty] - (a as any)[objProperty]);
};

const onMountedWS = (
  dataObject: [IWebsocket],
  objToAssign: [ITickVolume] | [ITick],
  objType: string
): void => {
  const transformedData = Object.entries(
    dataObject.reduce((acc, obj) => {
      const symbol = obj.s.split('USDT')[0];
      const volumeEqualBtc = obj.beq;
      if (objType === 'count') {
        acc[symbol] = (acc[symbol] || 0) + 1;
      } else {
        acc[symbol] = (acc[symbol] || 0) + volumeEqualBtc;
      }
      return acc;
    }, {} as { [key: string]: number })
  );

  if (objType === 'count') {
    ticks.value = transformedData.map(([symbol, count]) => ({
      symbol,
      count,
    })) as [ITick];
  } else {
    tickVolume.value = transformedData.map(([symbol, volume]) => ({
      symbol,
      volume,
    })) as [ITickVolume];
  }
  sortAscending(objToAssign, objType);
};

function connectToSocket() {
  socket = io(baseApiUrl, {
    extraHeaders: {
      'my-custom-header': 'test', // Replace with your authentication token value
    },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('message', (responseData) => {
    const dataObject: [IWebsocket] = JSON.parse(responseData).reverse();
    if (!firstResponse.value) {
      firstResponse.value = true;
      onMountedWS(dataObject, ticks.value, 'count');
      onMountedWS(dataObject, tickVolume.value, 'value');
    }
    transactions.value = dataObject;
  });
}

const getObjectBySymbol = (newTransaction: [IWebsocket]) => {
  if (newTransaction) {
    const symbol = newTransaction[0].s.split('USDT')[0];
    const volumeEqualBtc = newTransaction[0].beq;
    const matchingSymbol = tickVolume.value?.find(
      (obj) => obj.symbol === symbol
    );
    if (matchingSymbol) {
      matchingSymbol.volume += volumeEqualBtc;
    } else {
      tickVolume.value?.push({ symbol, volume: volumeEqualBtc });
      if (tickVolume.value?.length > 12) {
        tickVolume.value?.pop();
      }
    }
  }
};

const getVolumeBySymbol = (newTransaction: [IWebsocket] | undefined) => {
  if (newTransaction) {
    const symbol = newTransaction[0].s.split('USDT')[0];

    const matchingSymbol = ticks.value.find((obj) => obj.symbol === symbol);
    if (matchingSymbol) {
      matchingSymbol.count += 1;
    } else {
      ticks.value.push({ symbol, count: 1 });
      if (ticks.value?.length > 12) {
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

onBeforeUnmount(() => {
  socket.disconnect();
  console.log('Disconnected from WebSocket server');
});
</script>

<template>
  <div class="volume-monitor">
    <div class="volume-monitor__additional-info">
      <BaseTableFrame class="volume-monitor__container">
        <span class="volume-monitor__left">
          <h3 class="volume-monitor__title">Tick Board</h3>
          <small>The most ticked</small>
        </span>
        <table class="tb__table">
          <tbody>
            <tr class="card__td-body" v-for="(tick, i) in ticks" :key="i">
              <td>
                <span class="card__td-text-muted"></span>
                <span class="card__td-text-dynamic"
                  >{{ tick.symbol }}
                  <label class="card__td-symbol-text-label">/USDT</label>
                </span>
              </td>
              <td>
                <span class="card__td-text-muted">Tick</span>
                <span class="card__td-text-dynamic">{{ tick.count }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </BaseTableFrame>
      <BaseTableFrame class="volume-monitor__container">
        <span class="volume-monitor__left">
          <h3 class="volume-monitor__title">Volume Board</h3>
          <small>The most volume</small>
        </span>
        <table class="tb__table">
          <tbody v-if="tickVolume">
            <tr class="card__td-body" v-for="(tick, i) in tickVolume" :key="i">
              <td>
                <span class="card__td-text-muted"></span>
                <span class="card__td-text-dynamic"
                  >{{ tick.symbol }}
                  <label class="card__td-symbol-text-label">/USDT</label>
                </span>
              </td>
              <td>
                <span class="card__td-text-muted">Volume</span>
                <span class="card__td-text-dynamic">{{
                  tick.volume.toFixed(2)
                }}</span>
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
            <h3 class="volume-monitor__title">Volume Monitor</h3>
            <small>Thank you Binance</small>
          </span>
          <div class="volume-monitor__dropdown-container">
            <DropdownSmall
              :data="allowsCoins"
              :with-arrow-icon="true"
              :readonly="true"
            />
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
            <tr
              class="card__td-body"
              v-for="(transaction, i) in transactions"
              :key="i"
            >
              <td>
                <div class="card__td-symbol">
                  <span class="card__td-symbol-label">
                    <img src="" class="img" style="border-radius: 50%" alt="" />
                  </span>
                </div>
              </td>
              <td>
                <div href="" class="image">
                  <label class="card__td-symbol-text">{{
                    transaction.s.split('USDT')[0]
                  }}</label>
                  <label class="card__td-symbol-text-label">/USDT</label>
                </div>
              </td>
              <td>
                <span class="card__td-text-muted">Tick</span>
                <span class="card__td-text-dynamic">
                  <span>{{
                    getTickForSymbol(transaction.s.split('USDT')[0])
                  }}</span>
                </span>
              </td>
              <td>
                <span>
                  <span class="card__td-text-muted">Volume (₿)</span>
                  <span
                    class="card__td-text-dynamic"
                    :class="transaction.m ? 'green' : 'red'"
                  >
                    {{ Number(transaction.beq).toFixed(2) }}
                  </span>
                </span>
              </td>
              <td>
                <span>
                  <span class="card__td-text-muted">Market Maker</span>
                  <span
                    class="card__td-text-dynamic"
                    :class="transaction.m ? 'green' : 'red'"
                  >
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

.volume-monitor {
  display: flex;

  &__container {
    margin-right: 2rem;
    height: auto;
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
    color: $white;
    font-weight: bold;
  }
  small {
    color: $white-5;
    font-size: 1.1rem;
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

.tb__table {
  width: 100%;
  color: $white;
  caption-side: bottom;
  border-collapse: collapse;
}
.card__td {
  &-body:not(:last-child) {
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    border-bottom-color: white;
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
      color: #cdcdce;
      background-color: #1b1b29;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 0.475rem;
    }
    &-text {
      display: inline-block;
      color: $white;
      font-weight: 600;
      &-label {
        color: #848e9c;
        font-size: 11px;
        text-decoration: none;
      }
    }
  }
  &-text-muted {
    display: block;
    color: #565674;
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
  // background-color: #484747;
  background-color: #07074a6f;
}

tr:nth-child(even) {
}

.green {
  color: $chart-light-green;
}
.red {
  color: $chart-red;
}
</style>
