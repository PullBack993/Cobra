<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import DropdownSmall from '@/components/DropDownLongShort.vue';

const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;
const data = ref();
const time = ref<string[] | number>();
const currentMonth = ref<number>(1);
const currentType = ref<string>('day');
const loading = ref<boolean>(false); // TODO add placeholder spinner
//TODO place all constant to file
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
      return `background-color: rgba( ${colorLevel % 7}, ${colorLevel}, 70, ${colorLevel});`;
    }
    return `background-color: rgba( ${colorLevel % 5}, ${colorLevel}, 70, ${colorLevel});`;
  }

  if (difference < 0) {
    if(difference >= -0.01){
    return `background-color: rgba(${colorLevel}, ${colorLevel}, 50, ${colorLevel + 20});`;

    }
    return `background-color: rgba(${colorLevel + 70}, ${colorLevel / 7}, 50, ${colorLevel});`;
  }
  return 'background-color: var(--black);';
});

onMounted(() => {
  reqData(currentMonth.value, currentType.value);
});

const reqData = (month: number, type: string) => {
  data.value = null;
  axios
    .post(`${baseApiUrl}/exchange/daily-return`, {
      month,
      type,
    })
    .then((res) => {
      if (res.status === 200) {
        if (res.data[0].TimeFrameName !== undefined) {
          data.value = res.data[0].Timestamp;

          if(res.data[0].Length.length > 0){
            time.value = res.data[0].Length;
          }else{
            time.value = Object.keys(data.value['2012'][currentMonth.value?.toString()]);
          }
          data.value = { ...Object.entries(data.value).reverse() };
        } 
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const monthChange = (value: string) => {
  months.forEach((month, index) => {
    if (month === value) {
      currentMonth.value = index + 1;
      data.value = null;

      reqData(currentMonth.value, currentType.value);
    }
  });
};

const timeChange = (value: string) => {
  currentType.value = value;
  removeLy();
  reqData(currentMonth.value, currentType.value);
};

const removeLy = () => {
  selectedType.value = currentType.value;
  if (currentType.value === 'Daily') {
    currentType.value = `${currentType.value.slice(0, -3).toLocaleLowerCase()}y`;
  } else {
    currentType.value = currentType.value.slice(0, -2).toLocaleLowerCase();
  }
};

const capitalizeFirstLetter = computed(() => selectedType.value.charAt(0).toUpperCase() + selectedType.value.slice(1));
</script>

<template>
  <div class="returns">
    <p class="returns__title">Bitcoin {{ capitalizeFirstLetter }} returns(%)</p>
    <div class="returns__main">
      <div class="returns__chart-select-item"  v-if="currentType === 'day'">
        <div class="returns__chart-select-item">Month</div>
        <DropdownSmall :data="months" :readonly="true" :with-arrow-icon="true" @new-value:input="monthChange" />
      </div>
      <div class="returns__chart-select-item" >
        <div class="returns__chart-select-item">Type</div>

        <DropdownSmall :data="timeStamp" :readonly="true" :with-arrow-icon="true" @new-value:input="timeChange" />
      </div>
    </div>
  </div>
  <div class="returns__container">
    <table class="returns__table"  v-if="data">
      <tr class="returns__table-date">
        <th class="returns__table-date--time" >Time</th>
        <th class="returns__table-date--item"  v-for="(day, i) in time" :key="i">
          {{ day !== '' ? day : i + 1}}
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
        <tr class="returns__table" v-for="(year, index) in data" :key="index">
          <td class="returns__table-year--item">{{ year[0] }}</td>
          <td
            class="returns__table-year-percentage--ratio"
            :style="colorPriceAction(d.difference)"
            v-for="(d, i) in year[1][`${currentMonth}`]"
            :key="i"
          >
          {{ d.difference.toFixed(2) }}
            <span v-if="d.difference.toFixed(2)">%</span>
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
    color: var(--white);
    display: flex;
    width: 100%;
    justify-content: center;
    margin-bottom: 3.7rem;
    margin-top: 1rem;
    line-height: 3rem;
    font-size: $clamp-font-large-almost-large;
    line-height: $clamp-font-small-medium-large;
  }
  &__main {
    display: flex;
    min-height: 5rem;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0;
    @media(min-width: $breakpoint_mobilelarge){
      margin-right: 2rem;
      gap: 1.5rem;
    }
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
    font-size: clamp($font-small-tiny, 1vw + 0.8rem, $font-very-small);
    width: 12rem;
    color: var(--zth-text);
    &--non {
      margin-top: 0 !important;
    }
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
      font-weight: 500;
      font-size: $clamp-font-small;
    }
  }

  &-year--item {
    text-align: left;
    padding: 0.8rem;
    font-weight: 600;
    position: initial;
    z-index: 1;
    background-color: var(--bg-dark-purple);
    width: 6rem;
    text-align: center;
    left: 0;
    -webkit-transform: translateZ(0);
    border-right: 0.1rem ridge var(--brand-purple);
    position: -webkit-sticky;
    position: sticky;
    font-size: $clamp-font-small-2;
  }

  &-date {
    color: var(--white);

    &--item {
      text-align: center;
      position: relative;
      height: 3rem;
      width: 14rem;
      margin-bottom: 2rem;
      color: var(--zth-text);
      min-width: 10rem;
      font-weight: bold;
      font-size: $clamp-font-small-2;
    }
    &--time{
      color: var(--zth-text);
    }
  }
}

.returns__table-year--item,
.returns__table-year-percentage--ratio{
  color: var(--white);
}
@media (min-width: $breakpoint_mobiletabs) {
  .returns {
    margin-right: 0;

    &__chart-select-item:last-child {
      margin-top: 0;
    }
  }
}

@media (min-width: $breakpoint_medium) {
  .returns__table {
    &-year--item {
      left: 0;
    }
  }
}
</style>
