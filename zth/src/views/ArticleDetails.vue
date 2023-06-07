<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

interface ArticleDetails {
  title: string;
  titleImage: string;
  sections: [
    {
      heading: string;
      text: string;
      paragraph: string;
      image: [string];
      listItems: [string];
    }
  ];
  createTime: string;
}
interface Props {
  id: string; // URL params
}

const props = withDefaults(defineProps<Props>(), {});

const article = ref<ArticleDetails>();
const a  = ref()

const formattedText = () => {
  if (article.value) {
    article.value.sections.forEach((section, index) => {
      if (section.text) {
        a.value += section.text.replace(/\./g, '.</br>');
        console.log('yes')
      }
    });
  }
};

onMounted(async () => {
  try {
    console.log(props.id);
    const response = await axios.get(
      `http://localhost:3000/news/article/${props.id}`
    );
    article.value = response.data;
    formattedText();
  } catch (err: any) {
    console.error(err);
  }
});
</script>

<template>
  <div class="article" v-if="article">
    <div class="article-header">
      <img
        class="article-header--image"
        :src="article.titleImage"
        :alt="article.title"
      />
      <h1 class="article-header--title">{{ article.title }}</h1>
    </div>
    <div class="article-body">
      <div
        v-for="(section, index) in article.sections"
        :key="index"
        class="article-section"
      >
        <h2 class="article-title">{{ section.heading }}</h2>
        <div class="article-content">
          <p v-show="section.text" ref="text" class="article-text">
            {{ section?.text }}
          </p>
          <p class="article-paragraph">{{ a }}</p>
          <ul v-if="section.listItems" class="article-list-container">
            <li
              v-for="(item, index) in section.listItems"
              class="article-list-item"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
          <div v-if="section.image" class="article-image">
            <img
              v-for="(image, i) in section.image"
              :key="i"
              :src="image"
              alt="Section Image"
            />
          </div>
        </div>
      </div>
      <p class="article-create-time">Created on {{ article.createTime }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article {
  max-width: 90rem;
  margin: 0 auto;
  padding: 2rem;

  &-header {
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;

    &--title {
      background: linear-gradient(
        90deg,
        rgba(204, 43, 94, 1) 0%,
        rgba(117, 58, 136, 1) 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      word-wrap: break-word;
      overflow: hidden;
      -webkit-box-orient: vertical;
      line-height: 3.5rem;
      font-weight: bold;
    }

    &--image {
      height: 10rem;
      width: 10rem;
      margin-bottom: 1rem;
      margin-right: 2rem;
    }
  }

  &-section {
    margin-bottom: 2rem;
  }
  &-title {
    font-size: 3rem;
    background: linear-gradient(
      90deg,
      rgba(123, 67, 151, 1) 0%,
      rgba(220, 36, 48, 1) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
    margin-bottom: 1rem;
    word-wrap: break-word;
    line-height: 3rem;
  }

  &-text {
    font-size: 1.9rem;
    line-height: 1.7;
    margin-bottom: 1rem;
    color: white;
    word-wrap: break-word;
    &::after {
      content: '\a';
      white-space: pre;
      color: white;
    }
  }

  &-paragraph {
    &::after {
      content: '\a';
      white-space: pre;
    }
  }

  &-list-container {
    margin-bottom: 1rem;
    padding-left: 2.5rem;
    color: $white;
  }

  &-list-item {
    margin-bottom: 0.5rem;
    line-height: 1.5;
    word-wrap: break-word;
    &::before {
      content: '';
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background-color: red;
      margin-right: 0.5rem;
    }
    &::before {
      border: 0.2rem solid $main-purple;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0);
      color: $white;
      width: 1rem;
      height: 1rem;
      text-align: center;
    }
  }

  .article-image {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;

    img {
      max-width: 100%;
    }
  }

  .article-create-time {
    font-size: 1.2rem;
    text-align: center;
    margin-top: 2rem;
  }
}
</style>
