<script lang="ts" setup></script>

<template>
  <div class="tb">
    <div class="tb__body">
      <div class="tb__responsive">
        <table class="tb__table">
          <thead></thead>
          <tbody>
            <slot />
          </tbody>
        </table>
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
  background-color: #1e1e2d;
  border-width: 2rem;
  border-radius: 0.7rem;

  &__body {
    padding: 0.7rem 2rem 0.7rem 2.25rem;
    color: $black;
    flex: 1 1 auto;
  }
  &__responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  &__table {
    width: 100%;
    color: $white;
    caption-side: bottom;
    border-collapse: collapse;
  }
}
</style>
