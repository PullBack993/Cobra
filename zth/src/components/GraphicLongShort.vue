<script setup lang="ts"></script>
<template>
  <div class="graphic__ration">
    <div class="graphic__ration-container">
      <div class="graphic__ratio-exchange">
        <div class="graphic__ratio-main">
          <div class="graphic__ratio-progress">
            <div class="graphic__ration-long"></div>
          </div>
          <div class="graphic__ration-values-container">
            <div class="graphic__ration-long-value">50%</div>
            <div class="graphic__ration-short-value">50%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.graphic__ration {
  &-container {
    display: flex;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
    row-gap: 2rem;
  }
  &-exchange {
    display: block;
    -webkit-flex: 0 0 16.66666667%;
    -moz-box-flex: 0;
    flex: 0 0 16.66666667%;
    max-width: 16.66666667%;
  }
  &-main {
    display: block;
    -webkit-flex: 0 0 83.33333333%;
    -moz-box-flex: 0;
    flex: 0 0 83.33333333%;
    max-width: 83.33333333%;
  }
  &-progress {
    background-color: red;
    position: relative;
    height: 3.5rem;
  }
  &-long {
    width: 29.74%;
    text-align: right;
    padding-right: 10px;
    -webkit-transition: all 0.3s linear;
    -moz-transition: all 0.3s linear;
    transition: all 0.3s linear;
    background-color: green;
    height: 3.5rem;
  }
  &-values-container {
    display: flex;
  }
  &-long-value,
  &-short-value {
    width: 50%;
    text-align: center;
  }
}
</style>
