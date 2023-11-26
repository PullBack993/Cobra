<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import placeHolderLoader from './PlaceHolderLoader.vue';
import { Coin, CombinedCoinexchange } from '../Interfaces/ICoinLongShort';

interface Props {
  coins: Coin | [];
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {});
const coinsData = ref<Coin | []>([]);
const loadingLength = ref(12);

watch(
  () => props.coins,
  (value) => {
    coinsData.value = value;
  }
);

const combinedCoinsData = computed<[CombinedCoinexchange]>(() => {
  if (coinsData.value) {
    return [coinsData.value[0], ...coinsData.value[0]?.list];
  }
  return [];
});
</script>
<template>
  <div v-if="coinsData.length > 0">
    <div class="graphic__ratio" v-for="(data, index) in combinedCoinsData" :key="index">
      <div class="graphic__ratio-container">
        <div class="graphic__ratio-exchange">
          <div class="graphic__ratio-exchange--logo">
            <img
              class="graphic__ratio-exchange--image"
              alt="btc"
              loading="lazy"
              :src="index === 0 ? data.symbolLogo : data.exchangeLogo"
            />
            <div class="graphic__ratio-exchange-name">
              {{ index === 0 ? data.symbol : data.exchangeName }}
            </div>
          </div>
        </div>
        <div class="graphic__ratio-main">
          <div>
            <div class="graphic__ratio-progress" >
              <div
                class="graphic__ratio-long"
                :style="{ width: Number(data.longRate) + '%' }"
              ></div>
              <div class="graphic__ratio-values-container">
                <div class="graphic__ratio-long-value">{{ data.longRate }}%</div>
                <div class="graphic__ratio-short-value">{{ data.shortRate }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-if="!coinsData || loading">
    <div v-for="(_, index) in loadingLength" :key="index">
      <div class="loader">
        <placeHolderLoader
          class="loader-spliter graphic__ratio-exchange"
          :loader-width="'none'"
          :loader-height="3.5"
        ></placeHolderLoader>

        <placeHolderLoader
          class="loader-spliter graphic__ratio-main"
          :loader-width="'none'"
          :loader-height="3.5"
        ></placeHolderLoader>
      </div>
    </div>*-
  </div>
</template>

<style scoped lang="scss">
.loader {
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  display:flex;
  margin: 0.5rem 0;

  @media(min-width: $breakpoint_verysmall){
    flex-direction: row;
    flex-wrap:nowrap;
  }

  &-spliter {
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
    border-radius: 1rem;
    margin-right: 1rem;
  
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: 10rem;
      color: black;
      right: 0;
      bottom: 0;
      top: 0;
    }
  }
}
.graphic__ratio {
  margin: 1rem 0;
  row-gap: 4rem;

  &-container {
    display: flex;
    -webkit-flex-flow: row wrap;
    -moz-box-orient: horizontal;
    -moz-box-direction: normal;
    flex-flow: row wrap;
    line-height: 3.5rem;
    width: 100%;
  }
  &-exchange {
    display: block;
    -webkit-flex: 0 0 50%;
    -moz-box-flex: 0;
    flex: 0 0 50%;
    max-width: 30%;

    &-name{
      color: var(--zth-text);
      font-weight: 600;
      padding-left: 1rem;
      font-size: $clamp-font-small;
    }
  
    &--logo {
      display: -webkit-flex;
      display: -moz-box;
      display: flex;
      -webkit-align-items: center;
      -moz-box-align: center;
      align-items: center;
      margin-bottom: 1rem;
    }
    &--image {
      width: $image-small;
    }
  
  }
  &-main {
    display: block;
    -webkit-flex: 0 0 100%;
    -moz-box-flex: 0;
    flex: 0 0 100%;
    max-width: 100%;
    position: relative;
  }
  &-progress {
    position: relative;
    height: min(3rem, 3.5rem);
    display: flex;
    border-radius: 1rem;
    background: var(--zth-long-short-red);

  }

  &-long {
    text-align: right;
    -webkit-transition: all 0.3s linear;
    -moz-transition: all 0.3s linear;
    transition: all 0.3s linear;
    width: 50%;
    border-radius: 1rem 0rem 0 1rem;
    border-right-color: inherit;
    background: var(--zth-long-short-green);
  }

  &-values-container {
    position: absolute;
    line-height: 3.5rem;
    width: 100%;
    display: flex;
    top: 0.5rem;
  }
  &-long-value,
  &-short-value {
    width: 50%;
    text-align: center;
    vertical-align: center;
    color:  var(--white);
    font-size: $clamp-font-small;
    font-weight: 500;
  }
}

@media (min-width: $breakpoint_verysmall) {
  .graphic__ratio {
    &-exchange {
      display: block;
      -webkit-flex: 0 0 16%;
      -moz-box-flex: 0;
      flex: 0 0 16%;
      max-width: 16%;
    }
    &-main {
      display: block;
      -webkit-flex: 0 0 83.33333333%;
      -moz-box-flex: 0;
      flex: 0 0 83.33333333%;
      max-width: 83.33333333%;
      position: relative;
    }
  }
}
</style>
