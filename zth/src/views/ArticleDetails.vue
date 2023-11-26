<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios, { AxiosError } from 'axios';
import placeHolderLoader from '../components/utils/PlaceHolderLoader.vue';
import { IArticleDetails } from '../Interfaces/IArticleDetails';
import defaultimage from '../assets/BaseIcons/default-image.png';

const baseApiUrl = import.meta.env.VITE_APP_BASE_URL;

interface Props {
  id: string; // URL params
  title: string;
}
const loading = ref(true);
const props = withDefaults(defineProps<Props>(), {});
const clickedImage = ref();
const isImageVisible = ref(false);

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

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isImageVisible) {
    hideImage();
  }
};

const fullWidth = (e: Event) => {
  clickedImage.value = e.target?.src;
  isImageVisible.value = true;
  document.body.style.overflow = 'hidden'; // Disable scrolling
  document.addEventListener('keydown', onEscape);
};
const hideImage = () => {
  isImageVisible.value = false;
  document.body.style.overflow = 'auto'; // Enable scrolling
  document.removeEventListener('keydown', onEscape);
};

const handleOutsideClick = (e: Event) => {
  if (!e.target?.src && isImageVisible.value) {
    hideImage();
  }
};
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
          <div :class="{ 'article-text--big': index === 0 }" v-for="(text, i) in section.text" :key="i">
            <p ref="text" class="article-text">
              {{ text }}
            </p>
            <br />
          </div>
          <blockquote>
            <em>
              <p class="article-paragraph">
                {{ section?.paragraph }}
              </p>
            </em>
          </blockquote>
          <ul v-if="section.listItems" class="article-list-container">
            <li v-for="(item, index) in section.listItems" class="article-list-item" :key="index">
              {{ item }}
            </li>
          </ul>
          <div v-if="section.image.length > 0" class="article-image">
            <div class="article-image" v-for="(image, i) in section.image">
              <img v-if="image.length > 0" :key="i" :src="image" @click="fullWidth" alt="Section Image" />
              <img v-else :src="defaultimage" :alt="section.title" class="news__image" loading="lazy" />
              <div v-show="isImageVisible" @click="handleOutsideClick" class="fullscreen-image">
                <span class="close-btn" @click="hideImage">&times;</span>
                <img :src="clickedImage" class="quality" alt="Full screen Image" />
              </div>
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
.fullscreen-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.quality {
  image-rendering: optimizeQuality;
  filter: brightness(105%) invert(5%) contrast(110%) sepia(20%);
}
.fullscreen-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  font-size: 5rem;
  color: var(--white);
  cursor: pointer;
  z-index: 999;
}

.close-btn:hover {
  color: var(--zth-hover);
}
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
      &::after {
        position: absolute;
        content: '';
        background-color: black;
        width: 10rem;
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
      color: var(--white);
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
      border: 0.2rem solid var(--brand-purple);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0);
      color: var(--white);
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
    clip-path: inset(0 0 2.8rem 0 round 1rem);

    }
  }

  .article-create-time {
    font-size: 1.2rem;
    text-align: center;
    margin-top: 2rem;
  }
}
</style>
