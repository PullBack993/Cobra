<script setup lang="ts"></script>
<template>
  <div class="graphic__ratio">
    <div class="graphic__ratio-container">
      <div class="graphic__ratio-exchange">
        <div class="bybt-exname-logo graphic__ratio-exchange--logo">
          <img
            class="graphic__ratio-exchange--image"
            alt="btc"
            src="https://cdn.coinglasscdn.com/static/coins/btc@2x.png"
          />
          <div class="graphic__ratio-exchange-name">BTC Statistics&nbsp;</div>
        </div>
      </div>

      <div class="graphic__ratio-main">
        <div>
          <div class="graphic__ratio-progress">
            <div class="graphic__ratio-long"></div>
            <div class="graphic__ratio-values-container">
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
  margin: 1rem;
  &-container {
    display: flex;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
    row-gap: 2rem;

    position: absolute;
    line-height: 3.5rem;
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
    &--image {
      width: 2.4rem;
      height: 2.4rem;
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
  &-progress {
    background-color: $chart-red;
    position: relative;
    height: 3.5rem;
    display: flex;
    border-radius: 1rem;
  }
  &-long {
    text-align: right;
    -webkit-transition: all 0.3s linear;
    -moz-transition: all 0.3s linear;
    transition: all 0.3s linear;
    background-color: $chart-green;
    width: 50%;
    border-radius: 1rem 0rem 0 1rem;
    border-style: none outset none none;
    border-right-color: $black;
  }
  &-values-container {
    position: absolute;
    line-height: 3.5rem;
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
