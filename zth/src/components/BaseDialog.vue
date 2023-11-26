<template>
  <section>
    <dialog ref="baseDialog" class="dialog">
      <slot> </slot>
    </dialog>
  </section>
</template>

<script lang="ts" setup>
import dialogPolyfill from 'dialog-polyfill';
import { onMounted, onUnmounted, ref } from 'vue';

const isDialogSupported = ref(true);

const baseDialog = ref<HTMLDialogElement>();

const openModal = () => {
  baseDialog.value?.showModal();
  window.history.pushState({ checkoutModal: true }, '');
  document.body.style.overflow = 'hidden';
  if (baseDialog.value) {
    baseDialog.value.style.overflow = 'scroll';
  }
};

const modalExistsAndIsOpen = (): boolean | undefined => baseDialog.value && baseDialog.value.open;

const closeCallback = (): void => {
  if (modalExistsAndIsOpen()) {
    baseDialog.value?.close();
    baseDialog.value?.classList.remove('close');
    baseDialog.value?.removeEventListener('animationend', closeCallback);
    // historyBack();
  }
};
const closeModal = () => {
  if (modalExistsAndIsOpen()) {
    baseDialog.value?.close();
  } else {
    baseDialog.value?.classList.add('close');
    baseDialog.value?.addEventListener('animationend', closeCallback);
  }
  document.body.style.overflow = 'auto';
  if (baseDialog.value) baseDialog.value.style.overflow = 'auto'; 
};

const closeModalWithoutAnimation = (): void => {
  if (modalExistsAndIsOpen()) {
    baseDialog.value?.close();
    if (baseDialog.value) {
      baseDialog.value.style.overflow = 'auto';
    }
  }
  document.body.style.overflow = 'auto';
};

onMounted(() => {
  // dialog polyfill
  isDialogSupported.value =
    typeof baseDialog.value?.showModal === 'function' && baseDialog.value?.showModal !== undefined;
  if (!isDialogSupported.value && !window.HTMLDialogElement) {
    dialogPolyfill.registerDialog(baseDialog.value as HTMLDialogElement);
  }

  // close modal on native back event
  window.addEventListener('popstate', () => {
    closeModalWithoutAnimation();
  });

  // close on ESC to also clear history state
  baseDialog.value?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      const isNotCombinedKey = !(event.ctrlKey || event.altKey || event.shiftKey);
      if (isNotCombinedKey) {
        closeModal();
      }
    }
    openModal();
  });

  // fixes overflow on dialog close event if needed.It is replaced by '!important css'
  baseDialog.value?.addEventListener('close', () => {
    document.body.style.overflow = 'auto';
  });
});

onUnmounted(() => {
  closeModal();
});

defineExpose({
  openModal,
  closeModal,
});
</script>

<style lang="scss" scoped>
.dialog {
  border: none;
  height: 100vh;
  margin: 0;
  max-height: none;
  max-width: none;
  padding: 0;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.6);
  top: 0;
  left: 0;
  position: fixed;
  z-index: 1000;
  overflow: hidden;
}
</style>
