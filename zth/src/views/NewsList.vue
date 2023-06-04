<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '../store/global';

const route = useRoute();

const store = useGlobalStore();
const newsList = ref();

onMounted(async () => {
  try {
    axios.get('http://localhost:3000/news/newsList').then((response) => {
      if (response.status === 200) {
        newsList.value = response.data;
      }
    });
  } catch (err) {
    console.error(err);
  }
});
</script>

<template>
  <div class="news">
    <ul
      v-for="(section, index) in newsList"
      :key="index"
      class="news__list-items"
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
        <div>
          <router-link
          :to="{ name: 'ArticleDetails', params: { id: section._id } }"
          >
            {{ section.title }}
          </router-link>
          <h3 class="news__title">
            {{ section.title }}
          </h3>
          <p class="news__list-text">
            {{ section.sections[0]?.text }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.news {
  max-width: 100%;
  margin: auto;
  cursor: pointer;

  &__list-items {
    display: flex;
    flex-direction: colum;
    margin: 6rem auto;
    width: 90%;
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
  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 600;
    line-height: 1.2;
  }
  &__list-text {
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Number of lines to show */
    -webkit-box-orient: vertical;
  }
}
</style>
