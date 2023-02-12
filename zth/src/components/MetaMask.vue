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
  // console.log(document.cookie)
  // const a = Cookies.get('myCookie')
  // console.log(a)
  // axios.get('http://localhost:3000/auth/', {withCredentials: true}).then((res) => {
  //   console.log(res)
  // })

  const accounts = await (window as any).ethereum.request({
    method: 'eth_requestAccounts',
  });
  address.value = accounts[0];
  axios
    .post('http://localhost:3000/auth/meta-mask', { address: address.value })
    .then((res) => {
      const one = new Date(new Date().getTime() + 61 * 60 * 1000);

      Cookies.set('myCookie', address.value, { expires: one });
      store.login = true;
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>

<template>
  <div class="meta__mask">
  <div v-if="!store.login">
    <button @click="connectWallet()" class="meta__mask-login">
      <span class="meta__mask-login__icon">
        <img src="../assets/BaseIcons/metamask-icon.png" alt="icon">
      </span>
      <span class="meta__mask-login__text">Metamask</span>
    </button>
  </div>
</div>
</template>

<style scoped lang="scss">

.meta__mask {
  &-login {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    padding: 15px;
    height: 50px;

    &__icon {
      margin-right: 10px;

      img {
        height: 35px;
      }
    }

    &__text {
      color:white;
    }
  }
}
</style>
