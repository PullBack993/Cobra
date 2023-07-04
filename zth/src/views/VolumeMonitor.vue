<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { Websocket } from '../Interfaces/Websocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';

const testData = [
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
  },
  {
    e: 'aggTrade',
    E: 1688288508624,
    s: 'ETHUSDT',
    a: 916161363,
    p: '1913.19000000',
    q: '21.83920000',
    f: 1173118525,
    l: 1173118530,
    T: 1688288508624,
    m: true,
    M: true,
  }
];
const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;

const data = ref<[Websocket]>([]);
const test = ref();
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
    data.value = dataObject;
    test.value = dataObject[0].s;
    console.log(' data from server:', dataObject);
  });

  // To send data to the server
}

onMounted(() => {
  connectToSocket();
});

onBeforeUnmount(() => {
  socket.disconnect();
  console.log('Disconnected from WebSocket server');
});
</script>

<template>
  <BaseTableFrame>
    <tr class="card__td-body" v-for="(data, i) in testData" :key="i">
      <td>
        <div class="card__td-symbol">
          <span class="card__td-symbol-label">
            <img
              src="/UIFramework/Core/logos/BCH.png"
              class="img"
              style="border-radius: 50%"
              alt=""
            />
          </span>
        </div>
      </td>
      <td>
        <div href="/Crypto/Single?symbol=BCH" class="image">
          <label class="card__td-symbol-text">{{
            data.s.split('USDT')[0]
          }}</label>
          <label class="card__td-symbol-text-label">/USDT</label>
        </div>
      </td>
      <td>
        <span class="card__td-text-muted">Tick</span>
        <span class="card__td-text-dynamic">3</span>
      </td>
      <td>
        <span class="text-primary">
          <span class="card__td-text-muted">Volume (₿)</span>
          <span class="card__td-text-dynamic" style="color: #0ec56b">
            3.71
          </span>
        </span>
      </td>
      <td>
        <span class="text-primary">
          <span class="card__td-text-muted">Total (₿)</span>
          <span class="card__td-text-dynamic"> 610.47 </span>
        </span>
      </td>
      <td>
        <span class="text-primary">
          <span class="card__td-text-muted">Recent (₿)</span>
          <span class="card__td-text-dynamic"> 606.77 </span>
        </span>
      </td>
      <td class="text-end">
        <span class="text-primary">
          <span class="card__td-text-muted">Date</span>
          <span class="card__td-text-dynamic"> 02.07.2023 11:51:08 </span>
        </span>
      </td>
    </tr>
  </BaseTableFrame>
</template>

<style lang="scss" scoped>
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
}

tr:nth-child(even) {
  background-color: #2f2c2c;
}
</style>
