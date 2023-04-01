<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import DropdownSmall from '@/components/DropDownLongShort.vue';

const data = ref();
const days = ref<string[]>();
const baseData = ref();

onMounted(() => {
  const month = 1;
  const type = 'week';
  const year = new Date().getFullYear().toString();
  reqData(month, type, year);
});
// DAY => month: 3, type: day, year: 2023 => DAY
// WEEK => month: 0, type: week, year 2023
function reqData(month: number, type: string, year: string) {
  // const coinData = { time: currentTime.value, symbol: currentValue.value };
  axios
    .post('http://localhost:3000/exchange/daily-return', { month, type, year })
    .then((res) => {
      if (res.status === 200) {
        console.log(res.data);
        // res.data[0].Timestamp => Quarter
        baseData.value = res.data[0].Timestamp.years;
        data.value = Object.values(baseData.value['2012']);

        days.value = Object.keys(baseData.value['2012']['1']);
      }
  
    })
    .catch((err) => {
      console.error(err);
    });
}
</script>

<template>
  <div class="returns">
    <div class="returns__chart-select-item">
      <div class="returns__chart-select-item">Month</div>
      <DropdownSmall
        :data="[
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
        ]"
        :readonly="true"
        :with-arrow-icon="true"
      />
    </div>
    <div class="returns__chart-select-item">
      <div class="returns__chart-select-item">Type</div>

      <DropdownSmall
        :data="['Daily', 'Weekly', 'Monthly', 'Quarterly']"
        :readonly="true"
        :with-arrow-icon="true"
      />
    </div>
    <div class="returns__chart-select-item">
      <div class="returns__chart-select-item">Symbol</div>

      <DropdownSmall :data="['BTC']" :readonly="true" :with-arrow-icon="true" />
    </div>
  </div>
  <div class="returns__container">
    <table class="returns__table" v-if="data">
      <tr class="returns__table-date">
        <th class="returns__table-date--time">Time</th>
        <th class="returns__table-date--item" v-for="(day, i) in days" :key="i">
          {{ day }}
        </th>
      </tr>
      <tr class="returns__table" v-for="(time, index) in baseData" :key="index">
        <td class="returns__table-year--item">{{ index }}</td>
        <td
          class="returns__table-year-percentage--ratio"
          v-for="(d, i) in days"
          :key="i"
        >
          {{ Object.values(baseData[index])[0][d].difference.toFixed(2) }}
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.returns {
  display: flex;
  flex: 1 0 100%;
  justify-content: flex-end;

  &__container {
    display: flex;
    flex-flow: wrap;
    width: 100%;
    overflow: auto;
    @include customHorizontalScrollbar()
  }

  &__chart-select-item {
    margin-left: 1.1rem;
    margin-bottom: 0.5rem;
    font-size: 1.6rem;
    font-weight: 500;
    width: 12rem;
    color: white;
  }
}

.returns__table {
  font-family: arial, sans-serif;
  // border-collapse: collapse;
  width: 100%;
  color: white;
  margin-top: 4rem;

  &-year-percentage {
    &--ratio {
      text-align: center;
      background-color: $chart-green;
    }
  }

  &-year--item {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }

  &-date {
    color: white;
    &--item {
      border: 1px solid #dddddd;
      text-align: center;
      position: relative;
      height: 3rem;
      width: 14rem;
      margin-bottom: 2rem;
      padding-right: 2rem;
      font-weight: 300;
      color: white;
      min-width: 10rem;
    }
  }
}
</style>
