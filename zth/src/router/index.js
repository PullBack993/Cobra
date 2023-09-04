import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsList.vue'),
  },
  {
    path: '/volume-monitor',
    name: 'volume monitor',
    component: () => import('@/views/VolumeMonitor.vue'),
  },
  {
    path: '/news/:id/:title',
    component: () => import('@/views/ArticleDetails.vue'),
    name: 'ArticleDetails',
    props: (route) => ({
      id: route.params.id,
      title: route.params.title,
    }),
    meta: { scrollToTop: true },
  },
  {
    path: '/long-short',
    name: 'long-short',
    component: () => import('../views/LongShortView.vue'),
  },
];

const scrollBehavior = async (to, from, savedPosition) => {
  if (to.meta.scrollToTop) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ top: 0 }), 100);
    });
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(savedPosition), 300);
  });
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
});

export default router;
