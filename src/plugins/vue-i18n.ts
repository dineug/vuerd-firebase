import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "./vue-i18n/en";
import ko from "./vue-i18n/ko";

Vue.use(VueI18n);

const messages = {
  en,
  ko
};

export default new VueI18n({
  locale: "en",
  messages
});
