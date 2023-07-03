<script lang="ts" setup></script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="card-responsive">
        <table class="card-table">
          <thead></thead>
          <tbody>
            <tr class="card__td-body">
              <td>
                <div class="card__td-symbol symbol-50px me-2">
                  <span class="card__td-symbol-label">
                    <img
                      src="/UIFramework/Core/logos/BCH.png"
                      class="h-50"
                      style="border-radius: 50%"
                      alt=""
                    />
                  </span>
                </div>
              </td>
              <td>
                <div href="/Crypto/Single?symbol=BCH" class="image">
                  <label class="card__td-symbol-text">BCH</label>
                  <label class="card__td-symbol-text-label">/BTC</label>
                </div>
              </td>
              <td>
                <span class="card__td-text-muted fw-semibold d-block fs-7"
                  >Tick</span
                >
                <span class="">3</span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="card__td-text-muted fw-semibold d-block fs-7"
                    >Volume (₿)</span
                  >
                  ><span
                    class="fw-bold d-block fs-5 ng-binding ng-scope"
                    ng-if="volume.netvolume >= 0"
                    style="color: #0ec56b"
                    >3.71</span
                  ><!-- end ngIf: volume.netvolume >= 0 -->
                </span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="card__td-text-muted fw-semibold d-block fs-7"
                    >Total (₿)</span
                  >
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    610.47
                  </span>
                </span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="card__td-text-muted fw-semibold d-block fs-7"
                    >Recent (₿)</span
                  >
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    606.77
                  </span>
                </span>
              </td>
              <td class="text-end">
                <span class="text-primary fs-7 fw-bold">
                  <span class="card__td-text-muted fw-semibold d-block fs-7"
                    >Date</span
                  >
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    02.07.2023 11:51:08
                  </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  height: calc(100% - 2rem);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  background-color: #1e1e2d;
  border-width: 2rem;
  border-radius: 0.7rem;

  &-body {
    padding: 0.7rem 2rem 0.7rem 2.25rem;
    color: $black;
    flex: 1 1 auto;
  }
  &-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  &-table {
    width: 100%;
    color: $white;
    caption-side: bottom;
    border-collapse: collapse;
  }
  &__td-body:not(:last-child) {
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    border-bottom-color: white;
  }
  &__td-symbol {
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
      color: #cdcdce;
      background-color: #1b1b29;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 0.475rem;
    }
    &-text {
      display: inline-block;
      color: $white;
      font-weight: 600;
      &-label {
        color: #848e9c;
        font-size: 11px;
        text-decoration: none;
      }
    }
  }
  &-text-muted {
    display: block;
    color: #565674;
    font-weight: 500;
    padding-bottom: 0.5rem;
  }
}

td {
  padding: 0.7rem;
}

tr:nth-child(odd) {
  background-color: #a7a5a5;
}

tr:nth-child(even) {
  background-color: #2f2c2c;
}
</style>
