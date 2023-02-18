<script setup>
import { ref } from 'vue';
import MetaMask from './MetaMask.vue';
const showDialog = ref(false);
const showRegForm = ref(false);
const showRegistrationForm = () => {
  showRegForm.value = !showRegForm.value;
};
</script>

<template>
  <div class="dialog__modal">
    <img
      src="../assets/BaseIcons/loginIcon.svg"
      class="dialog__modal-openDialog"
      @click="showDialog = true"
      alt="login"
    />
    <div
      v-if="showDialog"
      class="dialog__modal-overlay"
      @click="showDialog = false"
    >
      <div class="dialog__modal-container" @click.stop>
        <h3 class="dialog__modal-title">Sign In</h3>
        <p>Connect to your MetaMask Wallet</p>
        <button class="dialog__modal-container-metamask">
          <MetaMask />
        </button>
        <p>Or Sign in with E-mail</p>
        <div class="dialog__modal-container-login" v-if="!showRegForm">
          <form class="dialog__modal-form" v-on:submit.prevent>
            <div class="dialog__modal-form-form__field">
              <label class="dialog__modal-form-form__label">
                <img
                  class="dialog__modal-form-form__field-formIcon"
                  src="../assets/BaseIcons/email.svg"
                  alt=""
                />
                <input
                  type="email"
                  class="dialog__modal-form-form__input"
                  placeholder="Email"
                />
              </label>
            </div>
            <div class="dialog__modal-form-form__field">
              <label class="dialog__modal-form-form__label">
                <img
                  class="dialog__modal-form-form__field-formIcon"
                  src="../assets/BaseIcons/password.svg"
                  alt=""
                />
                <input
                  type="password"
                  class="dialog__modal-form-form__input"
                  placeholder="Password"
                />
              </label>
            </div>
            <button class="dialog__modal-form-form__submit">Sign In</button>
          </form>
          <h4>
            Don't have an account?
            <button
              class="dialog__modal-container-signup"
              @click="showRegistrationForm"
            >
              Sign Up
            </button>
          </h4>
        </div>
        <div class="dialog__modal-container-registration" v-if="showRegForm">
          <form class="dialog__modal-form" v-on:submit.prevent>
            <div class="dialog__modal-form-form__field">
              <label class="dialog__modal-form-form__label">
                <img
                  class="dialog__modal-form-form__field-formIcon"
                  src="../assets/BaseIcons/email.svg"
                  alt=""
                />
                <input
                  type="email"
                  class="dialog__modal-form-form__input"
                  placeholder="Email"
                />
              </label>
            </div>
            <div class="dialog__modal-form-form__field">
              <label class="dialog__modal-form-form__label">
                <img
                  class="dialog__modal-form-form__field-formIcon"
                  src="../assets/BaseIcons/password.svg"
                  alt=""
                />
                <input
                  type="password"
                  class="dialog__modal-form-form__input"
                  placeholder="Password"
                />
              </label>
            </div>
            <div class="dialog__modal-form-form__field">
              <label class="dialog__modal-form-form__label">
                <img
                  class="dialog__modal-form-form__field-formIcon"
                  src="../assets/BaseIcons/password.svg"
                  alt=""
                />
                <input
                  type="password"
                  class="dialog__modal-form-form__input"
                  placeholder="Repeat Password"
                />
              </label>
            </div>
            <button class="dialog__modal-form-form__submit">Sign Up</button>
          </form>

          <h4>
            Have an account?
            <button
              class="dialog__modal-container-signup"
              @click="showRegistrationForm"
            >
              Sign In
            </button>
          </h4>
        </div>
        <button
          class="dialog__modal-container-close"
          @click="showDialog = false"
        >
          X
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dialog__modal {
  &-openDialog {
    margin-top: 3.5rem;
    margin-right: 3rem;

    height: 25px;
  }
  &-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  &-title {
    margin-top: 3rem;
    font-size: 30px;
    color: $white;
  }
  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    height: 570px;
    border: 0.1rem solid rgba(255, 255, 255, 0.2705882353);
    border-radius: 10px;
    background: linear-gradient(
      189deg,
      rgb(29, 12, 56) 0%,
      rgb(12, 20, 68) 53%,
      rgb(44, 16, 65) 100%
    );
    padding: 20px;
    p {
      margin-top: 2rem;
      font-size: 12px;
      color: $white;
    }
    h4 {
      color: $white;
    }
    &-metamask {
      margin: 20px auto;
      background-color: $metamask_yellow;
    }

    &-signup {
      cursor: pointer;
      font-size: 17px;
      color: $main_purple;
    }
    &-close {
      position: absolute;
      right: 20px;
      bottom: 20px;
      color: $white;
      font-size: 20px;
    }
  }
  &-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
    padding: 30px;
    &-form__field {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 20px;
      &-formIcon {
        height: 15px;
        position: absolute;
        left: 10px;
      }
    }
    &-form__label {
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;
    }
    &-form__input {
      width: 100%;
      padding: 10px 40px 10px 60px;
      font-size: 16px;
      border: none;
      border-bottom: 1px solid $light_grey;
      transition: all 0.3s ease-in-out;
      &:focus {
        border-bottom: 1px solid $main_purple;
      }
    }
    &-form__submit {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      background-color: $main_purple;
      color: $white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      &:hover {
        background-color: $main_purple-dark-5;
      }
    }
  }
}

@media (max-width: $breakpoint_small) {
  .dialog__modal-openDialog {
    position: absolute;
    right: 0;
    margin-right: 5rem;
  }
}
</style>
