<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import DropdownSmall from '@/components/DropDownLongShort.vue';
import { useGlobalStore } from '../store/global';

const store = useGlobalStore();
const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;
const data = ref();
const time = ref<string[] | number>();
const baseData = ref();
const currentMonth = ref<number>(1);
const currentType = ref<string>('day');
const loading = ref<boolean>(false); // TODO add placeholder spinner
const timeStamp = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const selectedType = ref('Daily');
const themeClass = computed(() =>
  store.themeDark ? 'light-theme' : 'dark-theme'
);

const colorPriceAction = computed(() => (difference: number) => {
  const test = Math.abs(difference);
  let colorLevel;
  if (test < 1) {
    colorLevel = Math.abs(difference * 100);
  } else if (test < 3) {
    colorLevel = Math.abs(difference * 30);
  } else if (test < 20) {
    colorLevel = Math.abs(difference * 12);
  } else {
    colorLevel = Math.abs(difference * 10);
  }

  if (difference > 0) {
    if (colorLevel > 255) {
      console.log(colorLevel);
      return `background-color: rgba( ${
        colorLevel % 7
      }, ${colorLevel}, 70, ${colorLevel});`;
    }
    return `background-color: rgba( ${
      colorLevel % 2
    }, ${colorLevel}, 70, ${colorLevel});`;
  }

  if (difference < 0) {
    return `background-color: rgba(${colorLevel + 70}, ${
      colorLevel / 7
    }, 50, ${colorLevel});`;
  }
  return '';
});

onMounted(() => {
  reqData(currentMonth.value, currentType.value);
});
// DAY => month: 3, type: day, year: 2023 => DAY
// WEEK => month: 0, type: week, year 2023

// test =>
function reqData(month: number, type: string) {
  data.value = null;
  axios
    .post(`${baseApiUrl}/exchange/daily-return`, {
      month,
      type,
    })
    .then((res) => {
      if (res.status === 200) {
        // WEEK BASED
        if (res.data[0].TimeFrameName !== undefined) {
          data.value = res.data[0].Timestamp;
          time.value = res.data[0].Length;
          data.value = { ...Object.entries(data.value).reverse() };
        } else {
          // DAY BASED
          baseData.value = res.data[0].Timestamp.years;
          data.value = Object.values(baseData.value['2012']).reverse();

          time.value = Object.keys(
            baseData.value['2012'][currentMonth.value?.toString()]
          );
          // Reverse object to take first year
          baseData.value = { ...Object.entries(baseData.value).reverse() };
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function monthChange(value: string) {
  months.forEach((month, index) => {
    if (month === value) {
      currentMonth.value = index + 1;
      data.value = null;

      reqData(currentMonth.value, currentType.value);
    }
  });
}

function timeChange(value: string) {
  currentType.value = value;
  removeLy();
  reqData(currentMonth.value, currentType.value);
}

function removeLy() {
  selectedType.value = currentType.value;
  if (currentType.value === 'Daily') {
    currentType.value = `${currentType.value
      .slice(0, -3)
      .toLocaleLowerCase()}y`;
  } else {
    currentType.value = currentType.value.slice(0, -2).toLocaleLowerCase();
  }
}

const capitalizeFirstLetter = computed(
  () => selectedType.value.charAt(0).toUpperCase() + selectedType.value.slice(1)
);
</script>

<template>
  <div class="returns">
    <p class="returns__title">Bitcoin {{ capitalizeFirstLetter }} returns(%)</p>
    <div class="returns__main">
      <div
        class="returns__chart-select-item"
        :class="themeClass"
        v-if="currentType === 'day'"
      >
        <div class="returns__chart-select-item">Month</div>
        <DropdownSmall
          :data="months"
          :readonly="true"
          :with-arrow-icon="true"
          @new-value:input="monthChange"
        />
      </div>
      <div class="returns__chart-select-item" :class="themeClass">
        <div class="returns__chart-select-item">Type</div>

        <DropdownSmall
          :data="timeStamp"
          :readonly="true"
          :with-arrow-icon="true"
          @new-value:input="timeChange"
        />
      </div>
      <div
        class="returns__chart-select-item"
        :class="[
          themeClass,
          currentType != 'day' ? 'returns__chart-select-item--non' : '',
        ]"
      >
        <div class="returns__chart-select-item">Symbol</div>

        <DropdownSmall
          :data="['BTC']"
          :readonly="true"
          :with-arrow-icon="true"
        />
      </div>
    </div>
  </div>
  <div class="returns__container">
    <table class="returns__table" :class="themeClass" v-if="data">
      <tr class="returns__table-date">
        <th class="returns__table-date--time" :class="themeClass">Time</th>
        <th
          class="returns__table-date--item"
          :class="themeClass"
          v-for="(day, i) in time"
          :key="i"
        >
          {{ day !== '' ? day : i + 1 }}
        </th>
      </tr>
      <tbody v-if="currentType !== 'day'">
        <tr class="returns__table" v-for="(year, index) in data" :key="index">
          <td class="returns__table-year--item">{{ year[0] }}</td>
          <td
            class="returns__table-year-percentage--ratio"
            :style="colorPriceAction(year[1][y]?.difference?.toFixed(2))"
            v-for="(y, i) in Object.values(year[1])?.length"
            :key="i"
          >
            {{ year[1][y]?.difference?.toFixed(2) }}
            <span v-if="year[1][y]?.difference">%</span>
          </td>
        </tr>
      </tbody>
      <tbody v-if="currentType === 'day'">
        <tr
          class="returns__table"
          v-for="(year, index) in baseData"
          :key="index"
        >
          <td class="returns__table-year--item">{{ year[0] }}</td>
          <td
            class="returns__table-year-percentage--ratio"
            :style="colorPriceAction(year[1][`${currentMonth}`][d]?.difference)"
            v-for="(d, i) in time"
            :key="i"
          >
            {{ year[1][`${currentMonth}`][d]?.difference?.toFixed(2) }}
            <span v-if="year[1][`${currentMonth}`][d]?.difference">%</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.returns {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-right: 2rem;
  min-height: 5rem;

  &__title {
    color: $white;
    display: flex;
    width: 100%;
    font-size: 3rem;
    justify-content: center;
    margin-bottom: 3.7rem;
    margin-top: 1rem;
    line-height: 3rem;
  }
  &__main {
    display: flex;
    min-height: 5rem;
    flex-wrap: wrap;
  }

  &__container {
    display: flex;
    flex-flow: wrap;
    width: 100%;
    overflow: auto;
    @include customHorizontalScrollbar($height: 1rem);
  }
  &__chart-select-item {
    margin-left: 1.1rem;
    margin-bottom: 0.5rem;
    font-size: 1.6rem;
    width: 12rem;
    &--non {
      margin-top: 0 !important;
    }
  }
  &__chart-select-item:last-child {
    margin-top: 1.5rem;
  }
}

.returns__table {
  font-family: arial, sans-serif;
  margin-top: 4rem;
  margin-bottom: 1rem;
  height: 3rem;

  &-year-percentage {
    &--ratio {
      text-align: center;
      font-weight: bold;
    }
    &--positive {
      background: $chart-dark-green;
      font-weight: 600;
      color: $chart-light-green;
    }
    &--positive-light {
      background: $chart-light-green;
      font-weight: 600;
      color: $chart-dark-green;
    }

    &--negative {
      color: $chart-dark-red;
      font-weight: 600;
      background-color: $chart-red;
    }
  }

  &-year--item {
    text-align: left;
    padding: 0.8rem;
    font-weight: 600;
    position: initial;
    z-index: 1;
    background-color: $bg-dark-purple;
    width: 6rem;
    text-align: center;
    left: 0;
    -webkit-transform: translateZ(0);
    border-right: 0.1rem ridge $main-purple;
  }

  &-date {
    color: $white;

    &--item {
      text-align: center;
      position: relative;
      height: 3rem;
      width: 14rem;
      margin-bottom: 2rem;
      color: $white;
      min-width: 10rem;
      font-weight: bold;
    }
  }
}
.light-theme {
  color: $main-purple;
  font-weight: 600;
}

.dark-theme {
  --text-color: $white;
  color: $white;
}

@media (min-width: $breakpoint_mobiletabs) {
  .returns {
    margin-right: 0;

    &__chart-select-item:last-child {
      margin-top: 0;
    }
  }
}

@media (min-width: $breakpoint_small) {
  .returns__table {
    &-year--item {
      left: 8rem;
      -webkit-transform: translateZ(8rem);
    }
  }
}
</style>
