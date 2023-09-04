<script lang="ts" setup>
import { useGlobalStore } from '../store/global';

const store = useGlobalStore();
</script>

<template>
  <div class="tb" :class="store.themeDark ? 'tb-light' : 'tb-dark'">
    <div class="tb__body">
      <div class="tb__responsive">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tb {
  height: calc(100% - 2rem);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  border-width: 2rem;
  border-radius: 1rem;

  &-dark {
    // background-image: linear-gradient(
    //   225deg,
    //   #1e07140f 0%,
    //   #13061e58 50%,
    //   #0e2b40 100%
    // );
    &.tb {
      border: 0.1rem solid $white-2;
    }
    box-shadow: 0rem 0rem 2rem $white-2;
  }

  &-light {
    &.tb {
      border: 0.1rem solid $black-2;
    }
    box-shadow: 0rem 0rem 2rem $input-bg-dark;
  }

  &__body {
    color: $black;
    flex: 1 1 auto;
  }
  &__responsive {
    overflow-x: auto;
    @include customHorizontalScrollbar($height: 0.2rem);
    -webkit-overflow-scrolling: touch;
    min-height: 25rem;
    margin-top: 1rem;
  }
}
</style>
