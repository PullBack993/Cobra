import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import VueGtag from 'vue-gtag';
import '@/assets/main.scss';

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
// define the custom directive to inject meta tags
app.directive('meta', {
  beforeMount: function (el, binding) {
    // retrieve the meta tag data from binding
    const metaData = binding.value;

    // append the meta tags to the <head> section
    const headElement = document.head;
    for (const metaTag of metaData) {
      const metaNode = document.createElement('meta');
      metaNode.setAttribute('name', metaTag.name);
      metaNode.setAttribute('content', metaTag.content);
      headElement.appendChild(metaNode);
    }
  },
});

// helper function to generate meta tag data
function generateTwitterCardMetaTags(newsTitle, imageUrl) {

  return [
    { name: 'og:type', content: 'website' },
    { name: 'og:title', content: newsTitle },
    { name: 'og:description', content: newsTitle.substring(0, 200) },
    { name: 'og:url', content: window.location.href },
    { name: 'og:image', content: imageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@one2hero_com' },
    { name: 'twitter:creator', content: '@one2hero_com' },
    { name: 'twitter:title', content: newsTitle },
    { name: 'twitter:description', content: newsTitle.substring(0, 200) },
    { name: 'twitter:image', content: imageUrl },
  ];
}

// expose the meta tag generation function globally
export default generateTwitterCardMetaTags;

app.mount('#app');
