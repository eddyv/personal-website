// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

// Import Tailwind CSS
require("~/main.css");

//Remark Syntax Highlighting
require("gridsome-plugin-remark-prismjs-all/themes/night-owl.css");
require("prismjs/plugins/line-numbers/prism-line-numbers.css");
require("prismjs/plugins/command-line/prism-command-line.css");

import DefaultLayout from "~/layouts/Default.vue";
import VueGtag from "vue-gtag";

export default function (Vue, { router, head, isClient }) {
  // Add attributes to HTML tag
  head.htmlAttrs = { lang: 'en' }


  // Add a meta tag
  head.meta.push({
    name: 'keywords',
    content: 'Edward Vaisman, Event Driven Architecture, Kafka, Event Streaming, Vue, Gridsome'
  })


  Vue.use(VueGtag, {
    config: {
      id: "G-8Z170N3RKS"
    }
  });
  // Set default layout as a global component
  Vue.component("Layout", DefaultLayout);
}
