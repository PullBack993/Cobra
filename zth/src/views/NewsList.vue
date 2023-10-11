<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '../store/global';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import baseButton from '../components/utils/BaseButton.vue';
import { IArticle } from '../Interfaces/IArticle';
import defaultimage from '../assets/BaseIcons/default-image.png';

const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;

const store = useGlobalStore();
const newsListData = ref<Array<IArticle>>([]);
const loading = ref(true);
const loadingLength = ref(12);
const page = ref(0);
const disabledBtn = ref(false);
const buttonText = ref('Show more');

const loadNews = () => {
  page.value += 1;
  loading.value = true;
  try {
    axios
      .get(`${baseApiUrl}/news/newsList?page=${page.value}`)
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            console.log(response.data);
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

onMounted(() => {
  loadingLength.value = Math.ceil(window.innerHeight / 10 / 17);
  loadNews();
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
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''}`;
  }
};
</script>

<template>
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

            <h3 class="news__title">
              {{ section.title }}
            </h3>
            <div class="news__text-container">
              <p
                class="news__list-text"
                :class="`${store.themeDark ? 'news__list-text--light' : 'news__list-text--dark'}`"
              >
                {{ section.sections[0]?.text[0] }}
              </p>
            </div>
          </div>
          <p class="news__time">{{ calculateDateTimeDifference(section.createTime) }} ago</p>
        </li>
      </router-link>
    </ul>
    <div v-if="loading" class="container">
      <div v-for="(_, index) in loadingLength" :key="index">
        <div class="loader">
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="26"
            width-unit="rem"
            :loader-height="12"
          ></placeHolderLoader>
          <div class="loader-content">
            <placeHolderLoader
              class="loader-spliter"
              :loader-width="95"
              width-unit="%"
              :loader-height="5"
            ></placeHolderLoader>

            <placeHolderLoader
              class="loader-spliter"
              :loader-width="95"
              width-unit="%"
              :loader-height="4"
            ></placeHolderLoader>
          </div>
        </div>
      </div>
    </div>
    <div class="button-container">
      <baseButton @onClick="loadNews" :disabled="disabledBtn || loading" :theme="''" :type="undefined">{{
        buttonText
      }}</baseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  margin: auto;
  width: 97%;
  @media (min-width: $breakpoint_large) {
    width: 82%;
  }
}
.loader {
  display: flex;
  height: 12rem;
  margin: 6rem auto;
  align-items: center;
  @media (min-width: $breakpoint_verysmall) {
    align-items: initial;
    height: 10rem;
  }

  &-content {
    display: flex;
    width: 100%;
    flex-direction: column;
    margin-left: 1rem;
    height: 14rem;
    @media (min-width: $breakpoint_medium) {
      margin-left: 3rem;
    }
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
}

.news {
  max-width: $default-max-width;
  width: 100%;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: $breakpoint_container) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 0.7fr;
    gap: 2rem;
  }

  &__list-content {
    // text-align: left;
    // align-items: left;
    color: $main-purple;
    line-height: 2.7rem;
    // flex-direction: column;
    // padding-bottom: 3rem;

    @media (min-width: $breakpoint_verysmall) {
    }
  }

  &__list-items {
    display: flex;
    flex-direction: colum;
    width: 95%;
    cursor: pointer;
    transition: all 0.2s linear;

    @media (min-width: $breakpoint_large) {
      width: 80%;
      margin-inline: auto;
      margin-bottom: 1rem;
      &:hover {
        transform: scale(1.02);
        border-radius: 1rem;
        box-shadow: 2px 2px 5px 3px rgba(250, 250, 250, 0.2);
      }
    }
  }
  &__list-link {
    text-decoration: none;
  }
  &__list-content {
    max-width: 100vw;
  }

  &__image {
    min-width: 10rem;
    min-height: 17rem;
    height: 17rem;
    width: 90%;
    margin-bottom: 5rem;
    border-radius: 1rem;
    float: left;

    @media (min-width: $breakpoint_mobiletabs) {
      width: 90%;
    }

    @media (min-width: $breakpoint_verysmall) {
      width: 70%;
    }

    @media (min-width: $breakpoint_small) {
      min-width: 15rem;
      min-height: 15rem;
      height: 15rem;
      margin: 2rem auto 1rem auto;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin: 0 1.5rem;

    @media (min-width: $breakpoint_small) {
    }

    @media (min-width: $breakpoint_container) {
    }
  }

  &__time {
    font-size: 1.2rem;
    text-align: right;
  }
  &__title {
    // text-align: justify;
    text-align: left;
    font-weight: 500;
    font-size: 2rem;
    margin-bottom: 1rem;
    line-height: 1.2;
    margin-top: 1rem;
    @include trim(2);
  }
  &__text-container {
    @include trim(2);
  }
  &__list-text {
    text-align: justify;
    display: inline;
    &--light {
      color: $black;
    }
    &--dark {
      color: $white;
    }
  }
}
.news__list-link:hover .news__title {
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 5rem;
}
</style>
