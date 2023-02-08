<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/global';
import Cookies from 'js-cookie'; // todo !!!!

const store = useGlobalStore();
const isLoggedIn = ref(false);
const address = ref('');
const isMetamaskSupported = ref(false);

onMounted(() => {
  isMetamaskSupported.value = typeof (window as any).ethereum !== 'undefined';
});

async function connectWallet() {
console.log(document.cookie)

  // const accounts = await (window as any).ethereum.request({
  //   method: 'eth_requestAccounts',
  // });
  // address.value = accounts[0];
  // axios
  //     .post('http://localhost:3000/auth/meta-mask', { address: address.value })
  //   .then((res) => {
  //     const one = new Date(new Date().getTime() + 60 * 60 * 1000);

  //     Cookies.set('myCookie', 'value of my cookie', { expires: one });
  //     store.login = true;
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
}

</script>

<template>
  <div class="meta__mask">
    <div v-if="!store.login">
      <button @click="connectWallet()" class="meta__mask-login">
        Metamask Login
      </button>
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
