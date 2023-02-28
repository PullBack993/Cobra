<script setup lang="ts"></script>

<template>
  <div class="long__short">
    <div class="long__short-col">
      <div class="long__short-title">
        <span>Exchange BTC Long/Short Ration</span>
      </div>

      <div class="long__short-chart-select">
        <div class="long__short-chart-select-item">
          <div>Symbol</div>
          <div class="long__short-select-symbol"></div>
        </div>
        <div class="long__short-chart-select-item">
          <div>Period</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.long__short {
  display: flex;
  margin: 1rem;

  &-col {
    display: flex;
    flex: 0 0 100%;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
  }

  &-title {
    font-size: 2.1rem;
    font-weight: 500;
    color: white;
    padding-bottom: 1rem;
  }

  &-chart-select {
    display: flex;
    flex: 0 0 100%;
    justify-content: flex-end;
    &-item {
      padding-right: 2rem;
      font-weight: 300;
      color: white;
    }
  }
  
}
</style>
