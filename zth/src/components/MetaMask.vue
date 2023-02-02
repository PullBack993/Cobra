<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref, nextTick } from 'vue';

const isLoggedIn = ref(false);
const dialog2 = ref(null);
const address = ref('');
const isMetamaskSupported = ref(false);
const ip = ref(null);
const location = ref('');

onMounted(() => {
  isMetamaskSupported.value = typeof (window as any).ethereum !== 'undefined';
});
async function connectWallet() {
  const accounts = await (window as any).ethereum.request({
    method: 'eth_requestAccounts',
  });
  address.value = accounts[0];
  axios
      .post('http://localhost:3000/balance', { name: address.value })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
    getLocation()
}

function getLocation() {

  axios
    .post('http://localhost:3000/balance')
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });

  // Define a RTCPeerConnection object
  // axios.get('https://ipapi.co/json/').then( res => {
  //   console.log(res)
  // })


  // axios.get('https://cors-anywhere.herokuapp.com/https://api.ipify.org?format=json', {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  //   .then(response => {
  //     console.log( response.data.ip)
  //     // return axios.get(`https://ipapi.co/${ip.value}/json/`);
  //   })
  //   // .then(response => {
  //     // location.value = `${response.data.city}, ${response.data.region}`;
  //   // })
  //   .catch(error => {
  //     console.error(error);
  //   });
}
function dialog() {
  // dialog2.value.showModal()
}
</script>

<template>
  <div class="meta__mask">
    <div v-if="!isLoggedIn">
      <button @click="connectWallet()" class="meta__mask-login">
        Metamask Login
      </button>
      <dialog ref="dialog2"></dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.meta__mask {
  &-login {
    color: white;
    width: 10rem;
    height: 10rem;
    margin-right: 2rem;
  }
}
</style>
