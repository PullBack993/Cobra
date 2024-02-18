<script setup lang="ts">
import axios from 'axios';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/global';
import placeHolderLoader from '../components/PlaceHolderLoader.vue';
import baseButton from '../components/utils/BaseButton.vue';
import { IArticle } from '../Interfaces/IArticle';
import defaultimage from '../assets/BaseIcons/default-image.png';
import generateTwitterCardMetaTags from '../main'
import one2hero from '../assets/BaseIcons/ONE.png'

const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;

const store = useGlobalStore();
const newsListData = ref<Array<IArticle>>([]);
const loading = ref(true);
const loadingLength = ref(18);
const page = ref(0);
const disabledBtn = ref(false);
const buttonText = ref('Show more');
const test = () => {
  store.newsPaginationCounter += 1;
  loadNews();
};
const loadMoreNews = (from = '', onMounted = '') => {
  page.value = store.newsPaginationCounter;
  loading.value = true;
  try {
    axios
      .get(`${baseApiUrl}/news/newsList?range=${page.value}&page=${from}`)
      .then((response) => {
        if (response.status === 200) {
          if (onMounted === 'onMounted') {
            scroll();
          }
          if (response.data.length !== 0) {
            newsListData.value.push(...response.data);
            loading.value = false;
          } else {
            disabledBtn.value = true;
            loading.value = false;
            buttonText.value = 'No more news available';
          }
        }
      })
      .finally(() => {
        loading.value = false;
      });
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
};

const loadNews = (from = '', onMounted = '') => {
  page.value += 1;
  loading.value = true;

  try {
    let axiosRequest;
    if (from) {
      page.value = store.newsPaginationCounter;
      axiosRequest = axios.get(`${baseApiUrl}/news/newsList?range=${page.value}&page=${from}`);
    } else {
      axiosRequest = axios.get(`${baseApiUrl}/news/newsList?page=${page.value}`);
    }
    axiosRequest
      .then((response) => {
        if (response.status === 200) {
          if (onMounted === 'scrollOnMounted') {
            scroll(); // need to scroll first if the date is updated; otherwise scroll not  to the right position
          }
          if (response.data.length !== 0) {
            console.log(response.data)
            newsListData.value.push(...response.data);
            loading.value = false;
          } else {
            disabledBtn.value = true;
            loading.value = false;
            buttonText.value = 'No more news available';
          }
        }
      })
      .finally(() => {
        loading.value = false;
      });
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
};

const scroll = () => {
  setTimeout(() => {
    window.scrollTo(0, store.scrollPosition);
  }, 150);
};

onMounted(() => {
  if (store.newsPaginationCounter > 1) {
    loadNews('back', 'scrollOnMounted');
  } else {
    loadNews();
  }
});

onBeforeUnmount(() => {
  if (store.newsPaginationCounter > 1) {
    store.scrollPosition = window.scrollY;
  }
});

const calculateDateTimeDifference = (dateStr: string): string => {
  const date: Date = new Date(dateStr);

  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();

  const diffYears: number = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const diffMonths: number = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.436875 * 24 * 60 * 60 * 1000));
  const diffDays: number = Math.floor((diff % (30.436875 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  const diffHours: number = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const diffMinutes: number = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const diffSeconds: number = Math.floor((diff % (60 * 1000)) / 1000);

  if (diffYears > 0) {
    return `${diffYears} Year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} Month${diffMonths > 1 ? 's' : ''}`;
  } else if (diffDays > 0) {
    return `${diffDays} D${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} H${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} M`;
  } else {
    return `${diffSeconds} Second${diffSeconds > 1 ? 's' : ''}`;
  }
};
</script>

<template>
  <div class="news-container">
    <div class="news" v-if="newsListData">
      <ul v-for="(section, index) in newsListData" :key="index" class="news__list-items">
        <router-link
          class="news__list-link"
          :to="{
            name: 'ArticleDetails',
            params: { id: section._id, title: section.title },
          }"
        >
          <li class="news__list-content">
            <div class="news__content">
              <img
                v-if="section.titleImage.length > 0"
                :src="section.titleImage"
                :alt="section.title"
                class="news__image"
                loading="lazy"
              />
              <img v-else :src="defaultimage" :alt="section.title" class="news__image" loading="lazy" />
              <div class="news__container">
                <h3 class="news__title">
                  {{ section.title }}
                </h3>
                <div class="news__text-container">
                  <p
                    class="news__list-text" v-if="section.sections[0]?.text[0]">
                    {{ section.sections[0]?.text[0] }}
                  </p>
                  <p
                    class="news__list-text" v-else>
                    {{ section.sections[0]?.listItems[0] }}
                  </p>
                </div>
                <p class="news__time">{{ calculateDateTimeDifference(section.createTime) }} ago</p>
              </div>
            </div>
          </li>
        </router-link>
      </ul>
    </div>

    <div v-if="loading || !newsListData" class="news loading">
      <div v-for="(_, index) in loadingLength" :key="index">
        <div class="news__content">
          <div>
            <placeHolderLoader class="news__image loading__image" :loader-height="13"> </placeHolderLoader>
          </div>
          <div class="loading__container">
            <placeHolderLoader
              class="news__title loading__content"
              :loader-height="2"
              :width-unit="'rem'"
              :loader-width="'auto'"
              :border-radius="1"
            ></placeHolderLoader>
            <placeHolderLoader
              class="news__title loading__content"
              :loader-height="2"
              :loader-width="'auto'"
              :width-unit="'rem'"
              :border-radius="1"
            ></placeHolderLoader>
            <div class="loading__text-container">
              <div v-for="(_, index) in 4" :key="index">
                <placeHolderLoader
                  class="loading__text"
                  :border-radius="1"
                  :width-unit="'rem'"
                  :loader-width="'auto'"
                  :loader-height="1"
                >
                </placeHolderLoader>
              </div>
            </div>
            <placeHolderLoader
              class="loading__time"
              :border-radius="1"
              :width-unit="'rem'"
              :loader-width="4"
              :loader-height="1"
            >
            </placeHolderLoader>
          </div>
        </div>
      </div>
    </div>
    <div class="button-container">
      <baseButton @onClick="test" :disabled="disabledBtn || loading" :theme="''" :type="undefined">{{
        buttonText
      }}</baseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading {
  overflow: hidden;
  &__container {
    width: 100%;
  }
  &__time {
    margin-top: 1rem;
    margin-right: 0.5rem;
    float: right;
  }
  &__text-container {
    margin-top: 2rem;
  }
  &__text {
    margin: 1rem 0;
  }
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
  &__image {
    width: 16rem;
    height: 10rem;
    margin-bottom: 5rem;
    border-radius: 1rem;
    margin-top: 3rem;
    margin-right: 2rem;
    @media (min-width: $breakpoint-medium) {
      width: clamp(16rem, 17vw + 1rem, 23rem);
      height: 13rem;
    }
    @media (min-width: $breakpoint-container) {
      width: clamp(20rem, 12vw + 1rem, 23rem);
    }
  }
}

.news {
  max-width: $max-width;
  width: 100%;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(1, 1fr);

  @media (min-width: $breakpoint_medium) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: $breakpoint_container) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 0.7fr;
    gap: 2rem;
  }

  &__list-content {
    color: var(--brand-purple);
    line-height: 2.7rem;

    @media (min-width: $breakpoint_verysmall) {
    }
  }

  &__list-items {
    display: flex;
    flex-direction: colum;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s linear;

    @media (min-width: $breakpoint_large) {
      width: 95%;
      margin-inline: auto;
      margin-bottom: 1rem;
      &:hover {
        transform: scale(1.02);
        border-radius: 1rem;
      }
    }
  }
  &__list-link {
    text-decoration: none;
    width: 100%;
  }
  &__list-content {
    max-width: 100vw;
  }

  &__image {
    // min-height: 14rem;
    height: 13rem;
    margin-bottom: 2rem;
    border-radius: 1rem;
    margin-top: 3rem;
    margin-right: 2rem;
    margin-inline: auto;
    width: 20rem;
    @media (min-width: $breakpoint_verysmall) {
      margin-inline: unset;
      margin-right: 2rem;
      margin-bottom: 5rem;
    }
    @media (min-width: $breakpoint-medium) {
      height: 13rem;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin: 2rem 1.5rem;
    border-radius: 2rem;
    padding-top: 2rem;
    padding-right: 1.5rem;
    padding-left: 1rem;
    background: linear-gradient(
      to right,
      rgba(158, 158, 158, 0),
      rgba(255, 255, 255, 0) 20%,
      rgba(158, 158, 158, 0.24) 152%
    );

    @media (min-width: $breakpoint_verysmall) {
      flex-direction: row;
    }

    @media (min-width: $breakpoint_container) {
    }
  }

  &__time {
    font-size: $font-small-tiny;
    text-align: right;
    margin: 1rem;
  }
  &__title {
    // text-align: justify;
    text-align: left;
    font-weight: 500;
    font-size: $clamp-font-small-medium;
    margin-bottom: 1rem;
    line-height: 1.2;
    margin-top: 1rem;
    @include trim(2);
  }
  &__text-container {
    @include trim(4);
  }
  &__list-text {
    text-align: justify;
    display: inline;
    font-size: $clamp-font-small-tiny-very-small;
    color: var(--zth-text);
    
  }
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 5rem;
  height: 5rem;
}

@keyframes skeleton-loading {
  0% {
    background-color: rgb(163, 184, 194);
  }

  100% {
    background-color: rgb(240, 243, 245);
  }
}
</style>
