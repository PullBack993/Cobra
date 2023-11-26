import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import VueGtag from 'vue-gtag';
import '@/assets/main.scss';
import { inject } from '@/vercel/analytics/vue';
inject();

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(
  VueGtag,
  {
    config: {
      id: import.meta.env.VITE_APP_GA_ID,
    },
  },
  router
);
app.mount('#app');
