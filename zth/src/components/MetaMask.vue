<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/global';
import Cookies from 'js-cookie'; 

const store = useGlobalStore();
const address = ref('');
const isMetamaskSupported = ref(false);

onMounted(() => {
  isMetamaskSupported.value = typeof (window as any).ethereum !== 'undefined';
});

(window as any).ethereum?.on('accountsChanged', () => {
  Cookies.remove('auth_token')
  store.login = false;
});

async function connectWallet() {
  if(!isMetamaskSupported.value){
    const ua = navigator.userAgent;
    let downloadUrl = '';
    let browserName = '';
    let isMobile = false;
    let platform = '';
    if(ua.indexOf('Chrome') !== -1){
      browserName = 'Chrome';
      downloadUrl = 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
    } else if(ua.indexOf('Firefox') !== -1){
      browserName = 'Firefox';
      downloadUrl = 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/';
    } else if(ua.indexOf('Edge') !== -1){
      browserName = 'Edge';
      downloadUrl = 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm';
    } else if(ua.indexOf('Safari') !== -1){
      browserName = 'Safari';
      downloadUrl = 'https://apps.apple.com/us/app/metamask/id1438144202';
    }
    if (ua.match(/(iPad|iPhone|iPod)/g)) {
      platform = 'iOS';
      isMobile = true;
    } else if (ua.match(/Android/i)) {
      platform = 'Android';
      isMobile = true;
    }
    if (isMobile) {
      window.alert(`Please install MetaMask on your ${platform} device and try again.`);
    } else {
      window.alert(`Please install the MetaMask browser extension on ${browserName} and try again.`);
      window.open(downloadUrl, '_blank');
    }
    return;
  }
  const accounts = await (window as any).ethereum?.request({
    method: 'eth_requestAccounts',
  }); 
  address.value = accounts[0];
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
    <button @click="connectWallet()" class="meta__mask-login">
      <span class="meta__mask-login__icon">
        <img src="../assets/BaseIcons/metamask-icon.png" alt="icon">
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
      color:white;
    }
  }
}
</style>
