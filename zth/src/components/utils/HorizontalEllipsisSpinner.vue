<script setup></script>

<template>
  <div class="horizontal-ellipsis-spinner">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style scoped lang="scss">
.horizontal-ellipsis-spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  & div {
    position: absolute;
    top: 3.3rem;
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background: var(--white);
    animation-timing-function: cubic-bezier(0, 1, 1, 0);

    &:nth-child(1) {
      background: var(--brand-purple-dark-5);
      left: 0.8rem;
      animation: ellipsis-first 0.6s infinite;
    }

    &:nth-child(2) {
      background: var(--brand-purple);
      left: 0.8rem;
      animation: ellipsis-second 0.6s infinite;
    }

    &:nth-child(3) {
      background: var(--brand-purple-light);
      left: 3.2rem;
      animation: ellipsis-second 0.6s infinite;
    }

    &:nth-child(3) {
      background: var(--brand-purple-light);
      left: 3.2rem;
      animation: ellipsis-second 0.6s infinite;
    }

    &:nth-child(4) {
      background: var(--brand-purple-lighter);
      left: 5.6rem;
      animation: ellipsis-last 0.6s infinite;
    }
  }
}

@keyframes ellipsis-first {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes ellipsis-last {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes ellipsis-second {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(3rem, 0);
  }
}
</style>
