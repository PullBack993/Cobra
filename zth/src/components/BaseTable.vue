<script lang="ts" setup></script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="card-responsive">
        <table
          class="card-table table-row-dashed table-striped align-middle gs-0 gy-3 my-0"
        >
          <thead></thead>
          <tbody>
            <tr class="card__tb-body">
              <td>
                <div class="symbol symbol-50px me-2">
                  <span class="symbol-label">
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
                <div
                  href="/Crypto/Single?symbol=BCH"
                  class="text-dark fw-bold text-hover-primary mb-1 fs-6"
                >
                  <label class="symbol-text">BCH</label>
                  <label class="symbol-text-label">/BTC</label>
                </div>
              </td>
              <td>
                <span class="text-muted fw-semibold d-block fs-7">Tick</span>
                <span class="text-dark fw-bold d-block fs-5 ng-binding">3</span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="text-muted fw-semibold d-block fs-7"
                    >Volume (₿)</span
                  >
                  <!-- ngIf: volume.netvolume < 0 -->
                  <!-- ngIf: volume.netvolume >= 0 --><span
                    class="fw-bold d-block fs-5 ng-binding ng-scope"
                    ng-if="volume.netvolume >= 0"
                    style="color: #0ec56b"
                    >3.71</span
                  ><!-- end ngIf: volume.netvolume >= 0 -->
                </span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="text-muted fw-semibold d-block fs-7"
                    >Volume (%)</span
                  >
                  <!-- ngIf: volume.netvolumepercent < 0 -->
                  <!-- ngIf: volume.netvolumepercent >= 0 --><span
                    class="fw-bold d-block fs-5 ng-binding ng-scope"
                    ng-if="volume.netvolumepercent >= 0"
                    style="color: #0ec56b"
                    >0.61</span
                  ><!-- end ngIf: volume.netvolumepercent >= 0 -->
                </span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="text-muted fw-semibold d-block fs-7"
                    >Total (₿)</span
                  >
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    610.47
                  </span>
                </span>
              </td>
              <td>
                <span class="text-primary fs-7 fw-bold">
                  <span class="text-muted fw-semibold d-block fs-7"
                    >Recent (₿)</span
                  >
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    606.77
                  </span>
                </span>
              </td>
              <td class="text-end">
                <span class="text-primary fs-7 fw-bold">
                  <span class="text-muted fw-semibold d-block fs-7">Date</span>
                  <span class="text-dark fw-bold d-block fs-5 ng-binding">
                    02.07.2023 11:51:08
                  </span>
                </span>
              </td>
              <td class="text-end">
                <a
                  href="#"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary"
                >
                  <span class="svg-icon svg-icon-2">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        opacity="0.5"
                        x="18"
                        y="13"
                        width="13"
                        height="2"
                        rx="1"
                        transform="rotate(-180 18 13)"
                        fill="currentColor"
                      ></rect>
                      <path
                        d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </span>
                </a>
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
  .symbol {
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
  .text-muted {
    display: block;
    color: #565674;
    font-weight: 500;
    padding-bottom: 0.5rem;
  }
}
.card__tb-body:not(:last-child) {
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  border-bottom-color: white;
}
td {
  padding: 0.7rem;
}

tr:nth-child(odd){
  background-color: #a7a5a5;
}

tr:nth-child(even){
  background-color: #2f2c2c;
}
</style>
