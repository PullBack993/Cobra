<script lang="ts" setup></script>

<template>
  <div class="tb">
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
  border-radius: 0.7rem;
  // background-color: #090307;
  border: 1px solid $main-purple;
  background-image: linear-gradient(
    225deg,
    #1e07140f 0%,
    #13061e58 50%,
    #0e2b40 100%
  );

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

@media (min-width: $breakpoint_verysmall) {
  .tb__body {
    padding: 0.7rem 2rem 0.7rem 2.25rem;
  }
}
</style>
