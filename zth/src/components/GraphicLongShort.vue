<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import placeHolderLoader from './utils/PlaceHolderLoader.vue';
import { useGlobalStore } from '../store/global';

const store = useGlobalStore();

interface Props {
  coins?: any;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {});
const coinsData = ref();
const loadingLength = ref(12);

const themeClass = computed(() =>
  store.themeDark
    ? 'graphic__ratio-exchange-name--light'
    : 'graphic__ratio-exchange-name--dark'
);

const progressClass = computed(() =>
  store.themeDark
    ? 'graphic__ratio-progress--light'
    : 'graphic__ratio-progress--dark'
);

const longProgress = computed(() =>
  store.themeDark ? 'graphic__ratio-long--light' : 'graphic__ratio-long--dark'
);

watch(
  () => props.coins,
  (value) => {
    coinsData.value = value;
  }
);
</script>
<template>
  <div v-if="coinsData">
    <div class="graphic__ratio" v-for="(data, index) in coinsData" :key="index">
      <div class="graphic__ratio-container">
        <div class="graphic__ratio-exchange">
          <div class="graphic__ratio-exchange--logo">
            <img
              class="graphic__ratio-exchange--image"
              alt="btc"
              loading="lazy"
              :src="data.exchangeLogo"
            />
            <div :class="themeClass">
              {{ data.exchangeName }}
            </div>
          </div>
        </div>

        <div class="graphic__ratio-main">
          <div>
            <div class="graphic__ratio-progress" :class="progressClass">
              <div
                class="graphic__ratio-long"
                :class="longProgress"
                :style="{ width: Number(data.longRate) + '%' }"
              ></div>
              <div class="graphic__ratio-values-container">
                <div class="graphic__ratio-long-value">
                  {{ data.longRate }}%
                </div>
                <div class="graphic__ratio-short-value">
                  {{ data.shortRate }}%
                </div>
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
          class="loader-spliter"
          :loader-width="15"
          width-unit="%"
          :loader-height="2.5"
        ></placeHolderLoader>

        <placeHolderLoader
          class="loader-spliter"
          :loader-width="82"
          width-unit="%"
          :loader-height="2.5"
        ></placeHolderLoader>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loader {
  display: flex;

  &-spliter {
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
    margin: 1rem;
    border-radius: 1rem;
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
  margin: 1rem;
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
    max-width: 50%;

    &-name--dark {
      font-weight: bold;
      padding-left: 1.5rem;
      color: white;
    }
    &-name--light {
      font-weight: bold;
      padding-left: 1.5rem;
      color: $main-purple;
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
    -webkit-flex: 0 0 100%;
    -moz-box-flex: 0;
    flex: 0 0 100%;
    max-width: 100%;
    position: relative;
  }
  &-progress {
    position: relative;
    height: 3.5rem;
    display: flex;
    border-radius: 1rem;
    &--light {
      // background-color: $chart-red;
      background: linear-gradient(
        to right,
        #ff000022,
        #d32f2f80 90%,
        #d32f2f80
      );
    }
    &--dark {
      // background-color: $chart-dark-red;
      background: linear-gradient(
        to right,
        #ff000000,
        #d32f2f80 90%,
        #d32f2f80
      );
    }
  }

  &-long {
    text-align: right;
    -webkit-transition: all 0.3s linear;
    -moz-transition: all 0.3s linear;
    transition: all 0.3s linear;
    width: 50%;
    border-radius: 1rem 0rem 0 1rem;
    border-right-color: inherit;
    &--light {
      // background-color: $chart-green;
      background: linear-gradient(to left, #449c671d, #5dc7878c 50%, #5dc787);
    }
    &--dark {
      background: linear-gradient(to left, #449c6739, #5dc7878c 50%, #5dc787);
    }
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
// );
</style>
