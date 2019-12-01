import "./plugins/firebase";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/fragment";
import "./plugins/vuerd-core";
import "./plugins/element";
import "./plugins/fontawesome";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
