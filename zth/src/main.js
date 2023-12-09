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
    console.log(binding.value);
    // append the meta tags to the <head> section
    const headElement = document.head;
    for (const metaTag of metaData) {
      const metaNode = document.createElement('meta');
      if (metaTag.property) {
        metaNode.setAttribute('property', metaTag.property);
      } else {
        metaNode.setAttribute('name', metaTag.name);
      }
      metaNode.setAttribute('content', metaTag.content);
      headElement.appendChild(metaNode);
    }
  },
});

// helper function to generate meta tag data
function generateTwitterCardMetaTags(newsTitle, imageUrl) {
  return [
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: newsTitle },
    { property: 'og:description', content: newsTitle.substring(0, 200) },
    { property: 'og:url', content: window.location.href },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: '@one2hero_com' },
    { name: 'twitter:creator', content: '@one2hero_com' },
    { name: 'twitter:title', content: newsTitle },
    { name: 'twitter:description', content: newsTitle.substring(0, 200) },
    { name: 'twitter:image', content: imageUrl },
    { 'http-equiv': 'content-type', content: 'text/html' },
  ];
}

// expose the meta tag generation function globally
export default generateTwitterCardMetaTags;

app.mount('#app');
