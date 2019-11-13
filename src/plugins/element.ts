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
  MenuItemGroup,
  Card,
  Image,
  Message,
  Notification
} from "element-ui";
// @ts-ignore
import lang from "element-ui/lib/locale/lang/ko";
// @ts-ignore
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
  MenuItemGroup,
  Card,
  Image
];

components.forEach(component => Vue.use(component));

Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;
