<script setup lang="ts">
import { computed } from 'vue';

type buttonType = 'button' | 'submit' | 'reset' | undefined;

interface Props {
  type: buttonType;
  disabled: boolean;
  theme: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
});

const emit = defineEmits(['onClick']);

const classes: Record<string, any> = computed(() => ({
  ...(props.theme ? { [`button--${props.theme}`]: true } : {}),
  'is-disabled': props.disabled,
}));

</script>

<template>
  <button
    class="base-button"
    :class="classes"
    :type="type"
    :disabled="disabled"
    @click="emit('onClick')"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  padding: 1rem 3rem;
  border: none;
  border-radius: 0.5rem;
  outline: none;
  background-color: $main-purple;
  color:   var(--white);
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: $main-purple-dark-5;
    background: $main-purple-dark-5;
    color:   var(--white);
  }
}
.is-disabled{
    background-color: var(--white-3);
    color: var(--light-grey);
    pointer-events: none;
}
</style>
