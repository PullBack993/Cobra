<script setup>
import DailyReturns from '../components/DailyReturns.vue';
</script>

<template>
  <div>
    <p class="unavailable-msg">Currently unavailable</p>
    <div class="unavailable" disabled>
    <DailyReturns disabled></DailyReturns>
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.loader) {
  align-content: center;
  align-items: center;
  display: flex;
  filter: blur(0.2rem);
}
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
    left: 5rem;
    rotate: 45grad;
    font-size: clamp(2rem, 3vw, 5rem);
    font-weight: 500;
    z-index: 9;
    color: white;
  }
}
</style>