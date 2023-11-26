<script setup lang="ts">
import { ref, watch } from 'vue';
import loginSvg from '../assets/BaseIcons/login.svg';
import emailSvg from '../assets/BaseIcons/email.svg';
import passwordSvg from '../assets/BaseIcons/password.svg';
import xMarkSvg from '../assets/BaseIcons/xmark.svg';
import MetaMask from './MetaMask.vue';
import { useGlobalStore } from '../store/global';
import baseDialog from './BaseDialog.vue';
import HorizontalEllipsisSpinner from './utils/HorizontalEllipsisSpinner.vue';

const showRegForm = ref(false);
const store = useGlobalStore();
const isMetamaskSupported = ref(true);
const downloadUrl = ref('');
const isMetamaskOpen = ref(false);

const handleData = (data: any) => {
  isMetamaskSupported.value = data.supported;
  downloadUrl.value = data.url;
};

const showRegistrationForm = () => {
  showRegForm.value = !showRegForm.value;
};

const modal = ref<InstanceType<typeof baseDialog> | null>(null);

watch(
  () => store.login,
  () => {
    modal.value?.closeModal();
  }
);

const hiddenModal = () => {
  modal.value?.closeModal();
  /* eslint-disable no-use-before-define */
  document.removeEventListener('keydown', handleEscape);
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {

    event.preventDefault();
    hiddenModal();
  }
};
const showModal = () => {
  modal.value?.openModal(); // baseDialog
  document.addEventListener('keydown', handleEscape);
};

const handleLoading = () => {
  isMetamaskOpen.value = !isMetamaskOpen.value;
};
</script>
<template>
  <div>
    <loginSvg
      v-if="!store.login"
      class="dialog__modal-openDialog"
      @click="showModal()"
    ></loginSvg>
    <img v-else :src="store.userImage" loading="lazy" alt="user-image" class="user-image" />
    <Teleport to="#app">
    <baseDialog v-if="!store.login" ref="modal">
      <div class="spinner" v-if="isMetamaskOpen">
        <HorizontalEllipsisSpinner></HorizontalEllipsisSpinner>
      </div>
      <div class="dialog__modal" >
        <div class="dialog__modal-overlay">
          <div class="dialog__modal-container" @click.stop>
            <h3 class="dialog__modal-title">Sign In</h3>
            <p class="dialog__modal-container-signMsg">Connect with your MetaMask Wallet</p>
            <div class="dialog__modal-container-metamask">
              <MetaMask @metamask-data="handleData" @metamsk-loading="handleLoading" />
            </div>
            <div class="dialog__modal-container-errorBlock" v-if="!isMetamaskSupported">
              <p class="dialog__modal-container-errorBlock-errorMsg">Metamask not found.</p>
              <a class="dialog__modal-container-errorBlock-url" :href="downloadUrl" target="_blank"
                >Click here to download and install Metamask</a
              >
            </div>
            <p class="dialog__modal-container-signMsg unavailable-msg">Currently unavailable</p>
            <div class="unavailable" disabled>
              <p class="dialog__modal-container-signMsg">Or Sign in with E-mail</p>
              <div class="dialog__modal-container--login" v-if="!showRegForm">
                <form class="dialog__modal-form" @submit.prevent>
                  <div class="dialog__modal-form-field">
                    <label class="dialog__modal-form-label">
                      <emailSvg class="dialog__modal-form-field-formIcon"></emailSvg>
                      <input
                        type="email"
                        class="dialog__modal-form-input"
                        placeholder="Email"
                        disabled
                        autocomplete="off"
                      />
                    </label>
                  </div>
                  <div class="dialog__modal-form-field">
                    <label class="dialog__modal-form-label">
                      <passwordSvg class="dialog__modal-form-field-formIcon"></passwordSvg>
                      <input
                        type="password"
                        disabled
                        class="dialog__modal-form-input"
                        placeholder="Password"
                        autocomplete="off"
                      />
                    </label>
                  </div>
                  <button class="dialog__modal-form-submit">Sign In</button>
                </form>
                <h4 class="dialog__modal-container-switchBtn">
                  Don't have an account?
                  <!-- @click="showRegistrationForm" -->
                  <button class="dialog__modal-container-signupBtn">Sign Up</button>
                </h4>
              </div>
              <div class="dialog__modal-container--registration" v-if="showRegForm">
                <form class="dialog__modal-form" @submit.prevent>
                  <div class="dialog__modal-form-field">
                    <label class="dialog__modal-form-label">
                      <emailSvg class="dialog__modal-form-field-formIcon"></emailSvg>
                      <input
                        type="email"
                        class="dialog__modal-form-input"
                        placeholder="Email"
                        disabled
                        autocomplete="off"
                      />
                    </label>
                  </div>
                  <div class="dialog__modal-form-field">
                    <label class="dialog__modal-form-label">
                      <passwordSvg class="dialog__modal-form-field-formIcon"></passwordSvg>
                      <input
                        type="password"
                        class="dialog__modal-form-input"
                        placeholder="Password"
                        autocomplete="off"
                        disabled
                      />
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
                        disabled
                      />
                    </label>
                  </div>
                  <button class="dialog__modal-form-submit">Sign Up</button>
                </form>

                <h4 class="dialog__modal-container-switchBtn">
                  Have an account?
                  <!-- <button class="dialog__modal-container-signupBtn" @click="showRegistrationForm">Sign In</button> -->
                </h4>
              </div>
            </div>
            <button class="dialog__modal-container-closeBtn">
              <xMarkSvg @click="hiddenModal" class="dialog__modal-container-closeBtn-icon"></xMarkSvg>
            </button>
          </div>
        </div>
      </div>
    </baseDialog>
  </Teleport>
    </div>
</template>

<style scoped lang="scss">
.unavailable {
  // remove after implement login/register
  align-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  filter: blur(0.2rem);
  position: relative;
  &-msg {
    position: absolute;
    top: 35rem;
    rotate: 45grad;
    font-size: 2rem !important;
    font-weight: 500;
    z-index: 9;
  }
}
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  height: 100%;
  width: 100%;
  z-index: 9991;
  background: #0000006e;
  position: fixed;
  // overflow: hidden;
}
.user-image {
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  top: 2.9rem;
  right: 2.3rem;
  position: absolute;
}

.dialog__modal {
  &-openDialog {
    right: 0rem;
    padding-right: 2rem;
    height: 100%;
    width: 5rem;
    position: absolute;
    top: 0;
    cursor: pointer;
    fill: var(--zth-icon);
  
  }
  &-overlay {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 999;
  }
  &-title {
    margin-top: 3rem;
    font-size: 3rem;
    color:  var(--white);
  }
  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40rem;
    height: 95%;
    border: 0.1rem solid rgba(255, 255, 255, 0.2705882353);
    border-radius: 1rem;
    background: linear-gradient(189deg, rgb(29, 12, 56) 0%, rgb(12, 20, 68) 53%, rgb(44, 16, 65) 100%);
    padding: 2rem;

    @media(min-width: $breakpoint_verysmall){
      height: 65rem;
    }

    &-metamask {
      margin: 2rem auto;
      background-color: var(--metamask-yellow);
    }
    &-errorBlock {
      background-color: transparent;
      border: 0.1rem solid var(--black);
      padding: 1.5rem;
      border-radius: 0.4rem;
      padding: 1.6rem;

      &-errorMsg {
        color: var(--chart-red);
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
        z-index: 9;
        pointer-events: auto;
      }
    }

    &-signMsg {
      margin-top: 3rem;
      font-size: 1.4rem;
      color:  var(--white);
    }

    &-signupBtn {
      margin-left: 0.5rem;
      // cursor: pointer;
      pointer-events: none;
      font-size: 1.8rem;
      color: var(--brand-purple);
      font-weight: 700;
    }
    &-closeBtn {
      position: absolute;
      right: 2rem;
      top: 2rem;
      color:  var(--white);
      font-size: 2rem;
      cursor: pointer;
      pointer-events: auto;

      &-icon {
        height: 2.5rem;
      }
    }
    &-switchBtn {
      display: flex;
      margin: 0 auto;
      color:  var(--white);
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
        fill: var(--brand-purple);
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
      border-bottom: 0.1rem solid var(--light-grey);
      transition: all 0.3s ease-in-out;
      background-color: var( --dark-gray-5);
    }
    &-submit {
      width: 100%;
      padding: 1rem;
      font-size: 1.6rem;
      background-color: var(--brand-purple);
      color:  var(--white);
      border: none;
      border-radius: 0.5rem;
      pointer-events: none;
      transition: all 0.3s ease-in-out;
    }
  }
}
</style>
