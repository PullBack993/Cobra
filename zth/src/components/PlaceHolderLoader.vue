<template>
  <div class="loader animation--wave" :style="styling" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  borderRadius?: number | string;
  loaderWidth?: number | string;
  loaderHeight?: number;
  widthUnit?: string;
}

const props = withDefaults(defineProps<Props>(), {
  borderRadius: '',
  widthUnit: 'rem',
});

const styling = computed(() => {
  if (!props.loaderWidth || !props.loaderHeight) {
    return '';
  }

  return {
    'border-radius': `${props.borderRadius}rem`,
    width: `${props.loaderWidth}${typeof props.loaderWidth === 'string' ? '' : props.widthUnit}`,
    height: `${props.loaderHeight}rem`,
  };
});
</script>

<style lang="scss" scoped>
.loader {
  overflow: hidden;
  position: relative;
  width: fit-content;
  cursor: wait;
  background-color: var(--bg-grey-5);
}

.loader::after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animation--wave::after {
  background: linear-gradient(90deg, transparent, transparent, var(--light-grey), transparent, transparent);
  transform: translateX(-100%);
  animation: wave 1.5s linear infinite;
}
</style>
