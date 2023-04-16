<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/global';

const emit = defineEmits(['metamask-data']);
const store = useGlobalStore();
const address = ref('');
const isMetamaskSupported = ref(false);
const downloadUrl = ref('');
const isMobile = ref(false);

onMounted(() => {
  isMetamaskSupported.value = typeof (window as any).ethereum !== 'undefined';
});

//TODO implement it
// (window as any).ethereum?.on('accountsChanged', () => {
//   Cookies.remove('auth_token');
//   store.login = false;
// });


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
  try {
    const response = await axios.post(
      'http://localhost:3000/auth/meta-mask',
      { address: address.value },
      { withCredentials: true }
    );

    if (response.data && response.status === 200) {
      store.login = true;
    }
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="meta__mask" @click="connectWallet()">
    <div v-if="!store.login">
      <button class="meta__mask-login">
        <span class="meta__mask-login-container">
          <img
            class="meta__mask-login-container-icon"
            src="../assets/BaseIcons/metamask.png"
            loading="lazy"
            alt="icon"
          />
        </span>
        <span class="meta__mask-login-text">Sign in with Metamask</span>
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

    &-container {
      margin-right: 10px;

      &-icon {
        height: 20px;
      }
    }

    &-text {
      color: white;
    }
  }
}
</style>
