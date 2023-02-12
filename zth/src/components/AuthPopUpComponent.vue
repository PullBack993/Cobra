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
                <h3 class="title">Log in</h3>
                <div class="dialog-buttons">
                    <button class="dialog-button metamask">
                        <MetaMask />
                    </button>
                    <button class="dialog-button email">
                        <span class="icon">
                            <img src="../assets/BaseIcons/envelope-solid.svg" alt="icon">
                        </span>
                        <span class="meta__mask-login__text">Email</span></button>
                </div>
                <div class="sign-up">
                    <p class="text">Do you want to register with e-mail?Sign up</p>
                </div>
                <button class="close-button" @click="showDialog = false">X</button>
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

    &-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 400px;
        height: 300px;
        background-color: white;
        padding: 20px;
        border-radius: 10px;
    }
}






.dialog-buttons {
    display: flex;
    justify-content: center;
    margin-top: 80px;
}

.dialog-button {
    margin: 0 10px;
}

.close-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
}

.title {

    font-size: 30px;
}

.email {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    padding: 15px;
    height: 50px;
}

.metamask {
    background-color: #E8821E;
}

.icon {
    margin-right: 10px;
}

.icon img {
    height: 35px;
}

.sign-up {
    margin-top: 50px;
}

.text {
    font-size: 13px;
}
</style>
