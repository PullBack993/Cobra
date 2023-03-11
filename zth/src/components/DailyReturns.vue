<script setup lang="ts"></script>

<template>
  <table class="returns">
    <tr class="returns-date">
      <th class="returns-date--item">Time</th>
      <th class="returns-date--item">January</th>
      <th class="returns-date--item">February</th>
      <th class="returns-date--item">March</th>
      <th class="returns-date--item">April</th>
      <th class="returns-date--item"><span>May</span></th>
      <th class="returns-date--item"><span>June</span></th>
      <th class="returns-date--item"><span>July</span></th>
      <th class="returns-date--item"><span>August</span></th>
      <th class="returns-date--item"><span>September</span></th>
      <th class="returns-date--item"><span>October</span></th>
      <th class="returns-date--item"><span>November</span></th>
      <th class="returns-date--item"><span>December</span></th>
    </tr>
    <tr class="returns-year1">
      <td class="returns-year--item">2023</td>
      <td class="returns-percentage--ratio">39.63%</td>
      <td class="returns-percentage--ratio">0.03%</td>
      <td class="returns-percentage--ratio">-13.53%</td>
    </tr>
    <tr class="returns-year1">
      <td class="returns-year--item">2022</td>
      <td class="returns-percentage--ratio">-15.6%</td>
      <td class="returns-percentage--ratio">-15.6%</td>
      <td class="returns-percentage--ratio">-15.6%</td>
      <td class="returns-percentage--ratio">-15.6%</td>
      <td class="returns-percentage--ratio">-15.6%</td>
      <td class="returns-percentage--ratio">-37.28%</td>
      <td class="returns-percentage--ratio">16.8%</td>
      <td class="returns-percentage--ratio">-13.88%</td>
      <td class="returns-percentage--ratio">-3.12%</td>
      <td class="returns-percentage--ratio">-5.56%</td>
      <td class="returns-percentage--ratio">-16.23%</td>
      <td class="returns-percentage--ratio">-3.59%</td>
    </tr>
  </table>
</template>

<style lang="scss" scoped>
.returns {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
  color: white;
  &-year {
    color: wheat;
    // float: left;
    // margin-right: 2rem;
    &--item {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
      // padding: 1rem;
    }
  }
  &-date {
    // display: flex;
    // list-style: none;
    color: white;
    // padding: 1rem;
    &--item {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
      text-align: center;

      // margin-right: 1rem;
      // padding-right: 1rem;
    }
  }
  &-percentage {
    // display: flex;
    &--ratio {
      text-align: center;
      // visibility: unset;
      // padding: 1rem;
      // background: green;
      // margin-right: 1rem;
    }
  }
}
</style>
