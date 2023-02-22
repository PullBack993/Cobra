<template>
  <component :is="iconComponent">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value: string) => Object.keys(icons).includes(value),
  },
});
const iconComponent = computed(() => icons[props.name]);
console.log(iconComponent);
</script>

<script lang="ts">
/* eslint-disable import/first */
import email from '../../assets/BaseIcons/email.svg';
interface IconMap {
  [key: string]: string;
}

const icons: IconMap = {
  email,
};
export default {};
</script>

<!-- <template>
  <component :is="iconComponent">
    <slot />
  </component>
</template>

<script lang="ts" setup>
/* eslint-disable global-require */

import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator(value: string) {
      return Object.prototype.hasOwnProperty.call(icons, value);
    },
  },
});

const iconComponent = computed(() => icons[props.name]);
</script>

<script lang="ts">
/* eslint-disable global-require */
type Icons = {
  [key: string]: NodeRequire;
};

const icons: Icons = {
  email: require('../../assets/BaseIcons/email.svg?inline'),
};

export default {};
</script> -->
