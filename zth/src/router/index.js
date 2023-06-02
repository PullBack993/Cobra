import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NewsList from '../components/NewsList.vue';
import ArticleDetails from '../components/ArticleDetails.vue';

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
    { path: '/article/:id', component: ArticleDetails, name: 'ArticleDetails' },
    {
      path: '/long-short',
      name: 'long-short',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LongShortView.vue'),
    },
  ],
});

export default router;
