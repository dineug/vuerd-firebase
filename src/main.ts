import "./plugins/firebase";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./plugins/vue-i18n";
import "./plugins/fragment";
import "./plugins/element";
import "./plugins/fontawesome";
import "./plugins/sentry";
import "./plugins/marked";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
