<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { Websocket } from '../Interfaces/Websocket';
import BaseTableFrame from '../components/BaseTableFrame.vue';

const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;

const transactions = ref<[Websocket]>([]);
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
    transactions.value = dataObject;
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
    <tr class="card__td-body" v-for="(transaction, i) in transactions" :key="i">
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
        <span class="text-primary">
          <span class="card__td-text-muted">Volume (₿)</span>
          <span class="card__td-text-dynamic" style="color: #0ec56b">
            {{Number(transaction.beq).toFixed(2)}}
          </span>
        </span>
      </td>
      <td>
        <span class="text-primary">
          <span class="card__td-text-muted">Market Maker</span>
          <span class="card__td-text-dynamic"> {{ transaction.m ? 'BUY' : 'SELL' }} </span>
        </span>
      </td>
      <td>
        <span class="text-primary">
          <span class="card__td-text-muted">Current Price</span>
          <span class="card__td-text-dynamic"> {{ Number(transaction.p).toFixed(2) }} </span>
        </span>
      </td>
      <td class="text-end">
        <span class="text-primary">
          <span class="card__td-text-muted">Date</span>
          <span class="card__td-text-dynamic"> {{ transaction.T }} </span>
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
  background-color: #472f4b48;;

}

tr:nth-child(even) {
}
</style>
