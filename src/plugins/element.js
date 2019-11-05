import Vue from "vue";
import {
  Button,
  Aside,
  Container,
  Main,
  Menu,
  MenuItem,
  Tooltip,
  Col,
  Row,
  Submenu,
  MenuItemGroup
} from "element-ui";
import lang from "element-ui/lib/locale/lang/ko";
import locale from "element-ui/lib/locale";

locale.use(lang);

const components = [
  Button,
  Aside,
  Container,
  Main,
  Menu,
  MenuItem,
  Tooltip,
  Col,
  Row,
  Submenu,
  MenuItemGroup
];

components.forEach(component => Vue.use(component));
