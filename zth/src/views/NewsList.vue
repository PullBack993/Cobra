<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '../store/global';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';

const route = useRoute();

const store = useGlobalStore();
const newsListData = ref();
const loading = ref(true);
const loadingLength = ref(12);

onMounted(async () => {
  loadingLength.value = Math.ceil(window.innerHeight / 10 / 17);
  try {
    axios.get('http://localhost:3000/news/newsList').then((response) => {
      if (response.status === 200) {
        newsListData.value = response.data;
        setTimeout(() => {
          loading.value = false;
        }, 5000);
      }
    });
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
});
</script>

<template>
  <div class="news" v-if="newsListData">
    <ul
      v-for="(section, index) in newsListData"
      :key="index"
      class="news__list-items"
    >
      <router-link
        class="news__list-link"
        :to="{
          name: 'ArticleDetails',
          params: { id: section._id },
        }"
      >
        <li class="news__list-content">
          <div>
            <img
              :src="section.titleImage"
              :alt="section.title"
              class="news__image"
              loading="lazy"
            />
          </div>
          <div class="news__content">
            <h3 class="news__title">
              {{ section.title }}
            </h3>
            <p
              class="news__list-text"
              :class="`${
                store.themeDark
                  ? 'news__list-text--light'
                  : 'news__list-text--dark'
              }`"
            >
              {{ section.sections[0]?.text[0] }}..
            </p>
          </div>
        </li>
      </router-link>
    </ul>
  </div>

  <div v-if="!newsListData && loading" class="container">
    <div v-for="(_, index) in loadingLength" :key="index">
      <div class="loader">
        <placeHolderLoader
          class="loader-spliter"
          :loader-width="10"
          width-unit="rem"
          :loader-height="8.5"
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
</template>

<style scoped lang="scss">
.container {
  margin: auto;
  width: 97%;
  @media (min-width: $breakpoint_large) {
    width: 82%;
  }
  @media (min-width: $breakpoint_container) {
    width: 65%;
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
  max-width: 100%;
  margin: auto;
  cursor: pointer;
  @media (min-width: $breakpoint_container) {
    width: 80%;
  }

  &__list-items {
    display: flex;
    flex-direction: colum;
    margin: 6rem auto;
    width: 95%;
    @media (min-width: $breakpoint_large) {
      width: 80%;
    }
  }
  &__list-link {
    text-decoration: none;
  }
  &__image {
    margin-right: 1rem;
    height: 8rem;
    border-radius: 1rem;
  }

  &__list-content {
    display: flex;
    text-align: center;
    align-items: center;
    font-size: 2rem;
    color: $main-purple;
    line-height: 2.7rem;
  }
  &__content {
    @media (min-width: $breakpoint_container) {
      margin-left: 3rem;
    }
  }
  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 600;
    line-height: 1.2;
  }
  &__list-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Number of lines to show */
    -webkit-box-orient: vertical;
    &--light {
      color: $black;
    }
    &--dark {
      color: $white;
    }
  }
}
.news__list-link:hover .news__title {
  text-decoration: underline;
}
</style>
