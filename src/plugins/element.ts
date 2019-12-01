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
  Drawer,
  Dialog,
  Form,
  FormItem,
  Radio,
  RadioGroup,
  Input,
  Switch,
  Loading,
  Message,
  MessageBox,
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
  Image,
  Drawer,
  Dialog,
  Form,
  FormItem,
  Radio,
  RadioGroup,
  Input,
  Switch,
  Loading
];

components.forEach(component => Vue.use(component));

Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
