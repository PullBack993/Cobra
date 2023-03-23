<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import DropdownSmall from '@/components/DropDownLongShort.vue';

const data = ref();
const days = ref<string[]>();
const currentType = ['a', 'b', 'c'];

onMounted(() => {
  const month = 1;
  const type = 'day';
  const year = '2023';
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
        data.value = Object.values(res.data[0].Timestamp.years['2012']['1']);
        
        days.value = Object.keys(data.value['2012']['1']);
      }
      // loading.value = false;
      // JSON.stringify(res.data)
      // coins.value = res.data;
      // if (!res.data) {
      //     loading.value = false;
      //     coins.value = '';
      //     coinsLength.value = 0;
      //     error.value = true;
      //     return;
      //   }
      //   // TODO remove console.logs
      //   coins.value = res.data;
      //   coinsLength.value = res.data.data.length;

      //   error.value = false;
      //   loading.value = false;
    })
    .catch((err) => {
      // loading.value = false;
      console.error(err);
      //   loading.value = false;
      //   error.value = true;
      //   coinsLength.value = 0;
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

  <table class="returns__table" v-if="data">
    <tr class="returns__table-date">
      <th class="returns__table-date--time">Time</th>
      <th class="returns__table-date--item" v-for="(day, i) in days" :key="i">
        {{ day }}
      </th>
    </tr>
    <tr class="returns__table" v-for="(time, index) in data" :key="index">
      <td class="returns__table-year--item">{{ index }}</td>
      <td class="returns__table-year-percentage--ratio">
        {{ time }}
      </td>
    </tr>

    <tr />
  </table>
</template>

<style lang="scss" scoped>
.returns {
  display: flex;
  flex: 1 0 100%;
  justify-content: flex-end;
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
  border-collapse: collapse;
  width: 100%;
  color: white;
  margin-top: 4rem;

  &-year-percentage {
    &--ratio {
      text-align: center;
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

      padding: 8px;
    }
    &--time {
      text-align: left;
    }
  }
  &-date {
    color: white;
    &--item {
      position: relative;
      height: 3rem;
      width: 14rem;
      margin-bottom: 2rem;
      padding-right: 2rem;
      font-weight: 300;
      color: white;
    }
  }
}
</style>
