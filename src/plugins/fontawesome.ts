import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSignInAlt,
  faSignOutAlt,
  faHeart
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";

library.add(
  faSignInAlt,
  faSignOutAlt,
  faHeart,
  farHeart as IconDefinition,
  faGithub as IconDefinition
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
