import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NewsList from '../views/NewsList.vue';
import ArticleDetails from '../views/ArticleDetails.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/news',
      name: 'news',
      component: NewsList,
    },
    { path: '/news/:id', component: ArticleDetails, name: 'ArticleDetails' },
    {
      path: '/long-short',
      name: 'long-short',
      component: () => import('../views/LongShortView.vue'),
    },
  ],
});

export default router;
