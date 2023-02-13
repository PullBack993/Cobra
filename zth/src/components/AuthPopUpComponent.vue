<script setup>
import { ref } from 'vue';
import MetaMask from './MetaMask.vue';
const showDialog = ref(false);

</script>


<template>
    <div class="dialog__modal" >
        <div class="dialog__modal-openDialog"  @click="showDialog = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
        </div>
        <div v-if="showDialog" class="dialog__modal-overlay" @click="showDialog = false">
            <div class="dialog__modal-container" @click.stop>
                <h3 class="dialog__modal-title">Sign In</h3>
                <p>Connect to your MetaMask Wallet</p>
                <button class="dialog__modal-container-metamask">
                    <MetaMask />
                </button>
                <p>Or Sign in with E-mail</p>
                <form class="form" v-on:submit.prevent>
                    <div class="form__field">
                        <label class="form__label">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512">
                                <path
                                    d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                            </svg>
                            <input type="email" class="form__input" placeholder="Email">
                        </label>
                    </div>
                    <div class="form__field">
                        <label class="form__label">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>
                            <input type="password" class="form__input" placeholder="Password">
                        </label>
                    </div>
                    <button class="form__submit">Sign In</button>
                </form>
                <h4>Don't have an account? <button class="dialog__modal-container-signup">Sign Up</button> </h4>
                <button class="dialog__modal-container-close" @click="showDialog = false">X</button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dialog__modal {
    &-openDialog {
        margin-top: 3.5rem;
        margin-right: 3rem;
        svg {
            fill: white;
            height: 25px;
        }
    }

    &-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &-title {
        margin-top:3rem;
        font-size: 30px;
        color: white;
    }

    &-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 400px;
        height: 570px;
        border: 0.1rem solid rgba(255, 255, 255, 0.2705882353);
        border-radius: 10px;
        background: linear-gradient(189deg, rgb(29, 12, 56) 0%, rgb(12, 20, 68) 53%, rgb(44, 16, 65) 100%);
        padding: 20px;

        p {
            margin-top: 2rem;
            font-size: 12px;
            color: white;
        }
        h4 {
            color:white;
        }

        &-metamask {
            margin: 20px auto;
            background-color: #E8821E;

        }
        &-signup{
            cursor:pointer;
            font-size:17px;
            color:$main_purple;
        }



        &-close {
            position: absolute;
            right: 20px;
            bottom: 20px;
            color: white;
            font-size: 20px;
        }
    }
}

.form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
    padding: 30px;
}

.form__field {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;

    svg {
        height: 15px;
        fill: white;
        position: absolute;
        left: 10px;

    }
}

.form__label {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
}


.form__input {
    width: 100%;
    padding: 10px 40px 10px 60px;
    font-size: 16px;
    border: none;
    border-bottom: 1px solid lightgray;
    transition: all 0.3s ease-in-out;
}

.form__input:focus {
    border-bottom: 1px solid $main_purple;
}

.form__submit {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    background-color: $main_purple;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.form__submit:hover {
    background-color: darkblue;
}

@media (max-width: $breakpoint_small){
  .dialog__modal-openDialog {

    position: absolute;
    right: 0;
    margin-right: 5rem;
  }
}
</style>
