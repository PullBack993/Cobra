<script setup lang="ts">
import { ref, computed } from 'vue';
import loginSvg from '../assets/BaseIcons/loginIcon.svg';
import emailSvg from '../assets/BaseIcons/email.svg';
import passwordSvg from '../assets/BaseIcons/password.svg';
import xMarkSvg from '../assets/BaseIcons/xmark.svg';
import MetaMask from './MetaMask.vue';
import { useGlobalStore } from '../store/global';

// const showDialog = ref(false);
const showRegForm = ref(false);
const store = useGlobalStore();
const isMetamaskSupported = ref(true);
const downloadUrl = ref('');
const favDialog = ref();

const handleData = (data) => {
  isMetamaskSupported.value = data.supported;
  downloadUrl.value = data.url;
};

const showRegistrationForm = () => {
  showRegForm.value = !showRegForm.value;
};

const themeClass = computed(() =>
  store.themeDark ? 'dialog__modal-openDialog--light' : 'dialog__modal-openDialog--dark'
);

const showDialog = (event: Event) => {
  event.preventDefault();
  favDialog.value.showModal();
};
</script>

<template>
  <div class="dialog__modal">
    <loginSvg class="dialog__modal-openDialog" :class="themeClass" @click="showDialog($event)"></loginSvg>
    <dialog ref="favDialog">
      <div class="dialog__modal-overlay">
        <div class="dialog__modal-container" @click.stop :class="`${store.themeDark ? 'bg-dark' : 'bg-light'}`">
          <h3 class="dialog__modal-title">Sign In</h3>
          <p class="dialog__modal-container-signMsg">Connect to your MetaMask Wallet</p>
          <div class="dialog__modal-container-metamask">
            <MetaMask @metamask-data="handleData" />
          </div>
          <div class="dialog__modal-container-errorBlock" v-if="!isMetamaskSupported">
            <p class="dialog__modal-container-errorBlock-errorMsg">Metamask not found.</p>
            <a class="dialog__modal-container-errorBlock-url" :href="downloadUrl" target="_blank"
              >Click here to download and install Metamask</a
            >
          </div>
          <p class="dialog__modal-container-signMsg">Or Sign in with E-mail</p>
          <div class="dialog__modal-container--login" v-if="!showRegForm">
            <form class="dialog__modal-form" @submit.prevent>
              <div class="dialog__modal-form-field">
                <label class="dialog__modal-form-label">
                  <emailSvg class="dialog__modal-form-field-formIcon"></emailSvg>
                  <input type="email" class="dialog__modal-form-input" placeholder="Email" autocomplete="off" />
                </label>
              </div>
              <div class="dialog__modal-form-field">
                <label class="dialog__modal-form-label">
                  <passwordSvg class="dialog__modal-form-field-formIcon"></passwordSvg>
                  <input type="password" class="dialog__modal-form-input" placeholder="Password" autocomplete="off" />
                </label>
              </div>
              <button class="dialog__modal-form-submit">Sign In</button>
            </form>
            <h4 class="dialog__modal-container-switchBtn">
              Don't have an account?
              <button class="dialog__modal-container-signupBtn" @click="showRegistrationForm">Sign Up</button>
            </h4>
          </div>
          <div class="dialog__modal-container--registration" v-if="showRegForm">
            <form class="dialog__modal-form" @submit.prevent>
              <div class="dialog__modal-form-field">
                <label class="dialog__modal-form-label">
                  <emailSvg class="dialog__modal-form-field-formIcon"></emailSvg>
                  <input type="email" class="dialog__modal-form-input" placeholder="Email" autocomplete="off" />
                </label>
              </div>
              <div class="dialog__modal-form-field">
                <label class="dialog__modal-form-label">
                  <passwordSvg class="dialog__modal-form-field-formIcon"></passwordSvg>
                  <input type="password" class="dialog__modal-form-input" placeholder="Password" autocomplete="off" />
                </label>
              </div>
              <div class="dialog__modal-form-field">
                <label class="dialog__modal-form-label">
                  <passwordSvg class="dialog__modal-form-field-formIcon"></passwordSvg>
                  <input
                    type="password"
                    class="dialog__modal-form-input"
                    placeholder="Repeat Password"
                    autocomplete="off"
                  />
                </label>
              </div>
              <button class="dialog__modal-form-submit">Sign Up</button>
            </form>

            <h4 class="dialog__modal-container-switchBtn">
              Have an account?
              <button class="dialog__modal-container-signupBtn" @click="showRegistrationForm">Sign In</button>
            </h4>
          </div>
          <button class="dialog__modal-container-closeBtn">
            <xMarkSvg class="dialog__modal-container-closeBtn-icon"></xMarkSvg>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped lang="scss">
dialog {
  // position: fixed;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // z-index: 9999;
}
.dialog__modal {
  top: 3.3rem;
  right: 4.5rem;

  &-openDialog {
    // position: absolute;
    height: 2.5rem;
    &--light {
      fill: $main-purple;
    }
    &--dark {
      fill: $white;
    }
  }
  &-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // overflow: auto;
    // z-index: 999;
  }
  &-title {
    margin-top: 3rem;
    font-size: 3rem;
    color: $white;
  }
  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40rem;
    height: 65rem;
    border: 0.1rem solid rgba(255, 255, 255, 0.2705882353);
    border-radius: 1rem;
    background: linear-gradient(189deg, rgb(29, 12, 56) 0%, rgb(12, 20, 68) 53%, rgb(44, 16, 65) 100%);

    padding: 2rem;

    &-metamask {
      margin: 2rem auto;
      background-color: $metamask_yellow;
    }
    &-errorBlock {
      background-color: transparent;
      border: 0.1rem solid black;
      padding: 1.5rem;
      border-radius: 0.4rem;
      padding: 1.6rem;

      &-errorMsg {
        color: $chart-red;
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 700;
        text-align: center;
      }
      &-url {
        font-size: 1.3rem;
        font-weight: 700;
        color: #00aaff;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &-signMsg {
      margin-top: 3rem;
      font-size: 1.4rem;
      color: $white;
    }

    &-signupBtn {
      margin-left: 0.5rem;
      cursor: pointer;
      font-size: 1.8rem;
      color: $main_purple;
      font-weight: 700;
    }
    &-closeBtn {
      position: absolute;
      right: 2rem;
      top: 2rem;
      color: $white;
      font-size: 2rem;
      &-icon {
        height: 2.5rem;
      }
    }
    &-switchBtn {
      display: flex;
      margin: 0 auto;
      color: $white;
      justify-content: center;
      align-items: center;
    }
  }
  &-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 50rem;
    padding: 3rem;
    &-field {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 2rem;
      &-formIcon {
        height: 1.8rem;
        position: absolute;
        left: 1.5rem;
        fill: $main_purple;
      }
    }
    &-label {
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;
    }
    &-input {
      width: 100%;
      padding: 1rem 4rem 1rem 6rem;
      font-size: 1.6rem;
      border: none;
      border-bottom: 0.1rem solid $light_grey;
      transition: all 0.3s ease-in-out;
      &--dark {
        background-color: $light-grey;
      }
      &--light {
        background-color: $input-bg-dark;
      }
      &:focus {
        border-bottom: 0.1rem solid $main_purple;
      }
    }
    &-submit {
      width: 100%;
      padding: 1rem;
      font-size: 1.6rem;
      background-color: $main_purple;
      color: $white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      &:hover {
        background-color: $main_purple-dark-5;
      }
    }
  }
}
</style>
