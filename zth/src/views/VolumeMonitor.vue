<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onUnmounted, onMounted, ref } from 'vue';

const baseApiUrl = import.meta.env.VITE_APP_WEBSOCKET;

const data = ref([]);
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
    const dataObject = JSON.parse(responseData);
    data.value = dataObject;
    console.log(' data from server:', dataObject);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  // To send data to the server
  socket.emit('message', JSON.stringify({ message: 'Hello server' }));
}

onMounted(() => {
  connectToSocket();
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div>test</div>
  <div v-if="data.length > 0">
    <div v-for="(coins, i) in data" :key="i" class="test">{{ coins }}</div>
  </div>
</template>

<style lang="scss" scoped>
.test{
  color:white;
}
</style>
