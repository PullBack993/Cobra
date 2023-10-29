<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios, { AxiosError } from 'axios';
import { useGlobalStore } from '../store/global';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { IArticleDetails } from '../Interfaces/IArticleDetails';
import defaultimage from '../assets/BaseIcons/default-image.png';

const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;

interface Props {
  id: string; // URL params
  title: string;
}

const store = useGlobalStore();
const loading = ref(true);
const props = withDefaults(defineProps<Props>(), {});

const article = ref<IArticleDetails>();

onMounted(async () => {
  await axios
    .get(`${baseApiUrl}/news/article/${props.id}`)
    .then((res) => {
      article.value = res.data;
      loading.value = false;
    })
    .catch((error: AxiosError) => {
      console.log(error.message);
      loading.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <div class="article">
    <div class="article-header" v-if="article">
      <img class="article-header--image" :src="article.titleImage" :alt="article.title" />
      <h1 class="article-header--title">{{ article.title }}</h1>
    </div>
    <div class="article-body">
      <div v-for="(section, index) in article?.sections" :key="index" class="article-section">
        <h2 class="article-title">{{ section?.heading }}</h2>
        <div class="article-content">
          <div :class="{'article-text--big': index === 0}" v-for="(text, i) in section.text" :key="i">
            <p
              ref="text"
              class="article-text"
            >
              {{ text }}
            </p>
            <br />
          </div>
          <blockquote>
            <em>
              <p
                class="article-paragraph"
              >
                {{ section?.paragraph }}
              </p>
            </em>
          </blockquote>
          <ul v-if="section.listItems" class="article-list-container">
            <li
              v-for="(item, index) in section.listItems"
              class="article-list-item"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
          <div v-if="section.image.length > 0" class="article-image">
            <div class="article-image" v-for="(image, i) in section.image">
              <img v-if="image.length > 0" :key="i" :src="image" alt="Section Image" />
              <img v-else :src="defaultimage" :alt="section.title" class="news__image" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
      <p class="article-create-time">Created on {{ article?.createTime }}</p>
    </div>
    <div v-if="loading">
      <div class="loader">
        <div class="loader-content">
          <div class="loader-content-title">
            <placeHolderLoader
              class="loader-spliter"
              :loader-width="20"
              width-unit="%"
              :loader-height="11"
            ></placeHolderLoader>
            <placeHolderLoader
              class="loader-spliter"
              :loader-width="81"
              width-unit="%"
              :loader-height="11"
            ></placeHolderLoader>
          </div>

          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="5"
          ></placeHolderLoader>
          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="10"
          ></placeHolderLoader>
          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="5"
          ></placeHolderLoader>
          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="30"
          ></placeHolderLoader>
          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="10"
          ></placeHolderLoader>
          <br />
          <placeHolderLoader
            class="loader-spliter"
            :loader-width="100"
            width-unit="%"
            :loader-height="30"
          ></placeHolderLoader>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loader-content-title {
  display: flex;
  gap: 3rem;
}
.loader-spliter {
  border-radius: 0.5rem;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
}
.article {
  max-width: 90rem;
  margin: 0 auto;
  padding: 1rem;

  &-header {
    text-align: center;
    margin-bottom: 6rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    @media (min-width: $breakpoint_verysmall) {
      flex-direction: row;
    }

    &--title {
      color: var(--zth-text);
      word-wrap: break-word;
      line-height: 4.5rem;
      font-weight: 900;
      font-size: $clamp-font-large-quite-large;
      position: relative;
      &::after{
        position: absolute;
        content: '';
        background-color: black;
        width:10rem;
        height: 10;
      }
    }

    &--image {
      height: 11rem;
      width: 17rem;
      margin-bottom: 1rem;
      margin-right: 2rem;
      border-radius: 1.5rem;
    }
  }

  &-section {
    margin-bottom: 2rem;
  }
  &-text--big:nth-child(1) {
    margin-top: 4rem;
    & > p:first-child::first-line {
      font-weight: 523;
    }
    & > p:first-child::first-letter {
      font-size: 5em;
      float: left;
      line-height: 0.4;
      margin-right: 0.5rem;
    }
  }
  &-title {
    font-size: $clamp-font-large-quite-large;
    -webkit-background-clip: text;
    background-clip: text;
    font-weight: bold;
    margin-bottom: 1rem;
    word-wrap: break-word;
    line-height: 4rem;
    color: var(--zth-text);
  }
  &-text {
    font-size: $clamp-font-small-medium;
    line-height: 1.5;
    margin-bottom: 1rem;
    word-wrap: break-word;
    color: var(--zth-text);

    &::after {
      content: '\a';
      white-space: pre;
      color: $white;
    }
  }

  &-paragraph {
    font-size: $clamp-font-small-medium;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
    margin-bottom: 1rem;
    word-wrap: break-word;
    line-height: 3rem;
    background-color: var(--zth-text);
  }

  &-list-container {
    margin-bottom: 1rem;
    padding-left: 2.5rem;
  }

  &-list-item {
    margin-bottom: 2.5rem;
    line-height: 1.7;
    word-wrap: break-word;
    color: var(--zth-text);
    &::before {
      content: '';
      display: inline-block;
      border: 0.2rem solid $main-purple;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0);
      color: $white;
      width: 1.3rem;
      height: 1.3rem;
      text-align: center;
      margin-right: 0.5rem;
    }
  }

  .article-image {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    width: 100%;

    img {
      max-width: 100%;
      width: 100%;
    }
  }

  .article-create-time {
    font-size: 1.2rem;
    text-align: center;
    margin-top: 2rem;
  }
}
</style>
