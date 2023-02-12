<script setup>
import { ref } from 'vue';
import MetaMask from './MetaMask.vue';
const showDialog = ref(false);

</script>


<template>
    <div class="dialog__modal">
        <button @click="showDialog = true" class="dialog__modal-openDialog">Sign In</button>
        <div v-if="showDialog" class="dialog__modal-overlay" @click="showDialog = false">
            <div class="dialog__modal-container" @click.stop>
                <h3 class="dialog__modal-title">Sign In</h3>
                <p>Connect to your MetaMask Wallet</p>
                <button class="dialog__modal-container-metamask">
                    <MetaMask />
                </button>
                <p>Or Sign in with E-mail</p>
                <form class="form">
                    <div class="form__field">
                        <label class="form__label">
                            <!-- <i class="fa fa-envelope form__icon"></i> -->
                            <svg xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                <path
                                    d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                            </svg>
                            <input type="email" class="form__input" placeholder="Email">
                        </label>
                    </div>
                    <div class="form__field">
                        <label class="form__label">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>
                            <input type="password" class="form__input" placeholder="Password">
                        </label>
                    </div>
                    <button class="form__submit">Sign In</button>
                </form>

                <button class="dialog__modal-container-close" @click="showDialog = false">X</button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dialog__modal {
    &-openDialog {
        color: white;
        width: 10rem;
        height: 10rem;
        margin-right: 2rem;
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
        font-size: 30px;
        color: white;
    }

    &-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 400px;
        height: 500px;
        border: 0.1rem solid rgba(255, 255, 255, 0.2705882353);
        border-radius: 10px;
        background: linear-gradient(189deg, rgb(29, 12, 56) 0%, rgb(12, 20, 68) 53%, rgb(44, 16, 65) 100%);
        padding: 20px;

        p {
            margin-top: 40px;
            font-size: 12px;
            color: white;
        }

        &-metamask {
            margin: 20px auto;
            background-color: #E8821E;

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
        height: 25px;
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

.form__icon {}

.form__input {
    width: 100%;
    padding: 10px 40px 10px 60px;
    font-size: 16px;
    border: none;
    border-bottom: 1px solid lightgray;
    transition: all 0.3s ease-in-out;
}

.form__input:focus {
    border-bottom: 1px solid #8a00ff;
}

.form__submit {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    background-color: #8a00ff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.form__submit:hover {
    background-color: darkblue;
}
</style>
