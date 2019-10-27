import Vue from "vue";
import { Button, Aside, Container, Header, Main, Footer } from "element-ui";
import lang from "element-ui/lib/locale/lang/ko";
import locale from "element-ui/lib/locale";

locale.use(lang);

const components = [Button, Aside, Container, Header, Main, Footer];

components.forEach(component => Vue.use(component));
