import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      titme: "ZTH | Data Analysis,Bitcoin Open interest,Bitcoin Options,Crypto machine learning"
    },
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsList.vue'),
    meta: {
      titme: "News Bitcoin, Ethereum, Crypto News and Price Data | ZTH"
    },
  },
  {
    path: '/volume-monitor',
    name: 'volume monitor',
    component: () => import('@/views/VolumeMonitor.vue'),
    meta: {
      title: "Volume All Coins,Order Book,Bitcoin Open interest,Big Transfers | ZTH"
    },
  },
  {
    path: '/news/:id/:title',
    component: () => import('@/views/ArticleDetails.vue'),
    name: 'ArticleDetails',
    props: (route) => ({
      id: route.params.id,
      title: route.params.title,
    }),
    meta: { scrollToTop: true, title: 'Article' },
    
  },
  {
    path: '/long-short',
    name: 'long-short',
    component: () => import('../views/LongShortView.vue'),
    meta: {
      titme: "Bitcoin Long Short Ratio, ETH Longs/Shorts Ratio, Cryptocurrency Longs VS Shorts Ratio, Binance Long And Short Ratio | ZTH",
    },
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
  strict: true, 
  scrollBehavior,
});

router.beforeEach((to, from) => {
  document.title = to.meta.titme ?? 'ZTH';
});

export default router;
