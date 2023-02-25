<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Cookies from 'js-cookie';
import { useGlobalStore } from '../store/global';
// import { loginSvg } from '../assets/BaseIcons/loginIcon.svg';

const emit = defineEmits(['metamask-data']);
const store = useGlobalStore();
const address = ref('');
const isMetamaskSupported = ref(false);
const downloadUrl = ref('');
const isMobile = ref(false);

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

    if (ua.match(/(iPad|iPhone|iPod)/g)) {
      downloadUrl.value = 'https://apps.apple.com/us/app/metamask/id1438144202';
    } else if (ua.match(/Android/i)) {
      downloadUrl.value =
        'https://play.google.com/store/apps/details?id=io.metamask';
    } else {
      downloadUrl.value = 'https://metamask.io/download.html';
    }
    if (isMobile.value) {
      emit('metamask-data', {
        url: downloadUrl.value,
        supported: isMetamaskSupported.value,
      });
    } else {
      emit('metamask-data', {
        url: downloadUrl.value,
        supported: isMetamaskSupported.value,
      });
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
