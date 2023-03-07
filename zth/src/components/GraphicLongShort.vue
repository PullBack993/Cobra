<script setup lang="ts"></script>
<template>
  <div class="graphic__ratio">
    <div class="graphic__ratio-container">
      <div class="graphic__ratio-exchange">
        <div class="bybt-exname-logo graphic__ratio-exchange--logo">
          <img
            style="margin-top: -3px; width: 2.4rem; height: 2.4rem"
            alt="a"
            src="https://cdn.coinglasscdn.com/static/coins/btc@2x.png"
          />
          <div class="graphic__ratio-exchange-name">BTC Statistics&nbsp;</div>
        </div>
      </div>

      <div class="graphic__ratio-main">
        <div>
          <div class="graphic__ratio-progress">
            <div class="graphic__ratio-long"></div>
            <div class="bybt-ls-rate graphic__ratio-values-container">
              <div class="graphic__ratio-long-value">68.81%</div>
              <div class="graphic__ratio-short-value">31.19%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.graphic__ratio {
  &-container {
    display: flex;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
    row-gap: 2rem;

    position: absolute;
    line-height: 35px;
    width: 100%;
  }
  &-exchange {
    display: block;
    -webkit-flex: 0 0 16.66666667%;
    -moz-box-flex: 0;
    flex: 0 0 16.66666667%;
    max-width: 16.66666667%;

    &-name {
      font-weight: bold;
      padding-left: 1.5rem;
      color: white;
    }
    &--logo {
      display: -webkit-flex;
      display: -moz-box;
      display: flex;
      -webkit-align-items: center;
      -moz-box-align: center;
      align-items: center;
    }
  }
  &-main {
    display: block;
    -webkit-flex: 0 0 83.33333333%;
    -moz-box-flex: 0;
    flex: 0 0 83.33333333%;
    max-width: 83.33333333%;
    position: relative;
  }
  &-view {
  }
  &-progress {
    background-color: red;
    position: relative;
    height: 35px;
    display: flex;
  }
  &-long {
    text-align: right;
    padding-right: 10px;
    -webkit-transition: all 0.3s linear;
    -moz-transition: all 0.3s linear;
    transition: all 0.3s linear;
    background-color: green;
    color: green;
    width: 68.81%;
  }
  &-values-container {
    position: absolute;
    line-height: 35px;
    width: 100%;
    display: flex;
  }
  &-long-value,
  &-short-value {
    width: 50%;
    text-align: center;
    color: white;
  }
}
</style>
