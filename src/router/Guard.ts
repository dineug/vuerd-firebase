import { Route, RawLocation } from "vue-router";
import store from "@/store";
import { RouterName } from "@/router";

export function signIn(
  to: Route,
  from: Route,
  next: (to?: RawLocation) => void
) {
  if (store.state.user) {
    next();
  } else {
    next({
      name: RouterName.Home
    });
  }
}
