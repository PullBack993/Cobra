<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/global';
import Cookies from 'js-cookie';

const emit = defineEmits(['custom-event']);
const store = useGlobalStore();
const address = ref('');
const isMetamaskSupported = ref(false);
let downloadUrl = ref('');

onMounted(() => {
  isMetamaskSupported.value = typeof (window as any).ethereum !== 'undefined';
});

(window as any).ethereum?.on('accountsChanged', () => {
  Cookies.remove('auth_token');
  store.login = false;
});

async function connectWallet() {
  if (!isMetamaskSupported.value) {
    const ua = navigator.userAgent;
    let isMobile = false;
    let platform = '';

    if (ua.match(/(iPad|iPhone|iPod)/g)) {
      platform = 'IOS';
      isMobile = true;
      downloadUrl.value = 'https://apps.apple.com/us/app/metamask/id1438144202';
    } else if (ua.match(/Android/i)) {
      platform = 'Android';
      isMobile = true;
      downloadUrl.value =
        'https://play.google.com/store/apps/details?id=io.metamask';
    } else {
      downloadUrl.value = 'https://metamask.io/download.html';
    }
    if (isMobile) {
      emit('metamask-data', {
        url: downloadUrl.value,
        supported: isMetamaskSupported.value,
      });
      // window.alert(`Please install MetaMask on your ${platform} device and try again.`);
      // window.open(downloadUrl.value, '_blank');
    } else {
      emit('metamask-data', {
        url: downloadUrl.value,
        supported: isMetamaskSupported.value,
      });
      // window.alert(`Please install the MetaMask browser extension on Browser and try again.`);
      // window.open(downloadUrl.value, '_blank');
    }
    return;
  }
  const accounts = await (window as any).ethereum?.request({
    method: 'eth_requestAccounts',
  });
  [address.value] = accounts;
  axios
    .post(
      'http://localhost:3000/auth/meta-mask',
      { address: address.value },
      { withCredentials: true }
    )
    .then((res) => {
      if (res.data) {
        store.login = true;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>

<template>
  <div class="meta__mask">
    <div v-if="!store.login">
      <button class="meta__mask-login" @click="connectWallet()">
        <span class="meta__mask-login__icon">
          <img src="../assets/BaseIcons/metamask-icon.png" alt="icon" />
        </span>
        <span class="meta__mask-login__text">Sign in with Metamask</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.meta__mask {
  &-login {
    display: flex;
    align-items: center;

    padding: 10px 60px;

    &__icon {
      margin-right: 10px;

      img {
        height: 20px;
      }
    }

    &__text {
      color: white;
    }
  }
}
</style>
