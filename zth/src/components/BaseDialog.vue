<template>
  <loginSvg class="dialog__modal-openDialog" @click="openModal()"></loginSvg>
  <dialog ref="baseDialog" class="dialog">
    <header class="dialog__header" v-if="headerText">
      <button class="dialog__close-upper" @click.prevent="closeModal()"></button>
      <h2 class="dialog__heading">
        {{ headerText }}
      </h2>
    </header>
    <section class="dialog__content">
      <slot> </slot>
    </section>
  </dialog>
</template>

<script lang="ts" setup>
import dialogPolyfill from 'dialog-polyfill';
import { onMounted, onUnmounted, ref } from 'vue';
import loginSvg from '../assets/BaseIcons/loginIcon.svg';
import emailSvg from '../assets/BaseIcons/email.svg';
import passwordSvg from '../assets/BaseIcons/password.svg';
import xMarkSvg from '../assets/BaseIcons/xmark.svg';

interface Props {
  headerText: string;
}

defineProps<Props>();

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
// const historyBack = (): void => {
//   if (window.history.state && window.history.state.checkoutModal) {
//     window.history.back();
//   }
// };
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
    // historyBack();
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
  });

  // fixes overflow on dialog close event
  baseDialog.value?.addEventListener('close', () => {
    document.body.style.overflow = 'auto';
  });
});

onUnmounted(() => {
  closeModal();
});

defineExpose({
  openModal,
});
</script>

<style lang="scss" scoped>
.dialog__modal-openDialog {
  top: 3.3rem;
  right: 4.5rem;
  height: 2.5rem;
  &--light {
    fill: $main-purple;
  }
  &--dark {
    fill: $white;
  }
}
.dialog__arrow {
  height: 1.5rem;
  fill: currentcolor;
  vertical-align: middle;
  transform: rotate(-90deg);
  width: unset;

  @media (min-width: $breakpoint-small) {
    margin-left: 1rem;
  }
}

.dialog {
  border: none;
  height: 100%;
  margin: 0;
  max-height: none;
  max-width: none;
  padding: 0;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.6);

  &__heading {
    // font-size: $font-large;
    // font-weight: $bold-default;
    max-height: 100%;
    text-overflow: ellipsis;
    margin-left: 2rem;
    overflow: hidden;
    padding: 0 2rem;
    width: 88%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__content {
    padding: 2rem;
    margin-bottom: 9.3rem;
  }
}

.dialog__header {
  position: sticky;
  top: 0;
  height: 7.6rem;
  width: 100%;
  // box-shadow: 0 3px 6px $color-box-shadow;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1;

  // background: $color-white;
}

.dialog__footer {
  position: fixed;
  width: 100%;
  bottom: 0;
  z-index: 2;

  // background: $color-white;
  height: 9.3rem;
  // box-shadow: 0 -3px 6px $color-box-shadow;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog__footer-btn {
  width: 16.5rem;
}

.dialog__content-wrap {
  padding: 2rem;
}

.dialog__close-upper {
  outline: inherit;
  border: none;
  background: none;
  position: absolute;
  top: 32%;
  left: 0;
}
</style>
