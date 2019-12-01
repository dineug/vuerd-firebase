import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faSignInAlt, faSignOutAlt);

Vue.component("font-awesome-icon", FontAwesomeIcon);
