<script setup lang="ts">
import BaseTableFrame from '../components/BaseTableFrame.vue';
import defaultimage from '../assets/BaseIcons/default-image.png';
import { ITickMerged } from '../Interfaces/IWebsocket';
import { onMounted, onUnmounted } from 'vue';
import { handleScrollBoxWheel } from '@/components/utils/helper';

interface Props {
  data: [ITickMerged];
  className?: string;
  boardTitle?: string;
  boardTitleAddition?: string;
}
const volumeMonitor = document.querySelector('.volume-monitor__container');

const props = withDefaults(defineProps<Props>(), {
  className: '',
  boardTitle: '',
  boardTitleAddition: '',
});

onMounted(() => {
    volumeMonitor?.addEventListener('wheel',handleScrollBoxWheel);
})

onUnmounted(() => {
  volumeMonitor?.removeEventListener('wheel',handleScrollBoxWheel);

})
</script>
<template>
  <BaseTableFrame class="volume-monitor__container" v-if="data">
    <span class="volume-monitor__left">
      <h3 class="volume-monitor__title" :class="className">{{ boardTitle }}</h3>
      <small class="volume-monitor__title-small"
        >{{boardTitleAddition}}</small
      >
    </span>
    <table class="tb__table">
      <tbody>
        <tr class="card__td-body" v-for="(tick, i) in data" :key="i">
          <td>
            <div class="card__td-symbol">
              <span class="card__td-symbol-label">
                <img v-if="tick.image" :src="tick?.image" class="card__td-img" :alt="tick.symbol" />
                <img v-else :src="defaultimage" :alt="tick.symbol" class="card__td-img" loading="lazy" />
              </span>
            </div>
          </td>
          <td>
            <span class="card__td-text-muted"></span>
            <span class="card__td-text-dynamic" :class="className"
              >{{ tick.symbol }}
              <label class="card__td-symbol-text-label">/USDT</label>
            </span>
          </td>
          <td>
            <span class="card__td-text-muted">Tick</span>
            <span class="card__td-text-dynamic">{{ tick.count ? tick?.count : tick.volume.toFixed(2) }}</span>
          </td>
          <td>
            <span class="card__td-text-muted">Buy</span>
            <span class="card__td-text-dynamic card__td-text-dynamic--green">{{
              tick.count ? tick.sell : tick.sell.toFixed(2)
            }}</span>
          </td>
          <td>
            <span class="card__td-text-muted">Sell</span>
            <span class="card__td-text-dynamic card__td-text-dynamic--red">{{
              tick.count ? tick.buy : tick.buy.toFixed(2)
            }}</span>
          
          </td>
        </tr>
      </tbody>
    </table>
  </BaseTableFrame>
</template>

<style lang="scss" scoped>
.volume-monitor {
  display: flex;
  flex-direction: column-reverse;

  &__left {
    margin: 1rem;
    display: flex;
    flex-direction: column;
  }

  &__container{
    height: auto;
    width: 100%;
    overflow: auto;
  }
  &__title {
    font-weight: 500;
    color: var(--zth-text);
  }

  small {
    margin-right: 7rem;
    font-size: 1.1rem;
    width: 100%;
    color: var(--space-grey-8);

  }
}

.tb__table {
  width: 100%;
  color:  var(--white);
  caption-side: bottom;
  border-collapse: collapse;
  border-radius: 1rem;
  overflow: hidden;
}
.card__td {
  &-body:not(:last-child) {
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    border-bottom-color:  var(--white);
  }
  &-img {
    border-radius: 50%;
    width: $clamp-font-large-quite-large;
    height: $clamp-font-large-quite-large;
  }
  &-symbol {
    display: inline-block;
    flex-shrink: 0;
    border-radius: 0.475rem;
    &-label {
      width: 5rem;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 0.475rem;
    }
    &-text {
      display: inline-block;
      font-weight: 600;
      font-size:  $clamp-font-very-small-medium;
      &-label {
        color:  var(--white-5);
        font-size: 11px;
        text-decoration: none;
      }
    }
  }
  &-text-muted {
    display: block;
    color:  var(--white-5);
    font-weight: 600;
    font-size: $clamp-font-very-small;
    padding-bottom: 0.5rem;
    white-space: nowrap;
  }
  &-text-dynamic {
    font-weight: 700;
    font-size: $clamp-font-very-small-medium;
    &--date {
      font-size: $clamp-font-small;
    }
    &--green {
      color: var(--chart-light-green);
    }
    &--red {
      color: var(--chart-red);
    }
  }
}

td {
  padding: 0.7rem;
}

tr:nth-child(odd) {
  background-color: var(--bg-input-dark);
}

tr:nth-child(even) {
  background-color: var(--bg-input-dark-8);
}

@media (min-width: $breakpoint_verysmall) {
  .volume-monitor__additional-info {
    width: 100%;
    flex-direction: row;
  }
}

@media (min-width: $breakpoint_medium) {
  .volume-monitor {
    flex-direction: row;

    &__container {
      width: auto;
    }
  }
}
</style>
