<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { Websocket } from '../Interfaces/Websocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';
import DropdownSmall from '@/components/DropDownLongShort.vue';

const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;
const allowsCoins = ['BTC', 'USDT'];
const transactions = ref<[Websocket]>([]);
const ticks = ref();
let socket: Socket;

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
    const dataObject: [Websocket] = JSON.parse(responseData).reverse();
    transactions.value = dataObject;
  });
}

watch(
  () => transactions.value,
  () => {
    ticks.value = Object.entries(
      transactions.value.reduce((acc, obj) => {
        const symbol = obj.s.split('USDT')[0];
        acc[symbol] = (acc[symbol] || 0) + Number(obj.beq);
        return acc;
      }, {})
    ).map(([symbol, count]) => ({ symbol, count })).sort((a, b) => b.count - a.count);
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
  <div class="test">
    <BaseTableFrame>
      <table class="tb__table">
        <tbody>
          <tr class="card__td-body" v-for="(tick, i) in ticks" :key="i">
            <td>
              <span class="card__td-text-muted">Tick</span>
              <span class="card__td-text-dynamic">{{ tick.symbol }}</span>
            </td>
            <td>
              <span class="card__td-text-muted">Tick</span>
              <span class="card__td-text-dynamic">{{ tick.count }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseTableFrame>
    <BaseTableFrame>
      <div class="dropdown-container">
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
              <span class="card__td-text-dynamic">3</span>
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
                <span class="card__td-text-dynamic"> {{ transaction.T }} </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseTableFrame>
  </div>
</template>

<style lang="scss" scoped>
.test {
  display: grid;
  grid-template-columns: 30% 70%;
  margin: 1rem;
}

:deep(.root) {
  margin-bottom: 5rem;
  align-content: rig;
  width: 9rem;
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

.dropdown-container {
  display: flex;
  justify-content: right;
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
