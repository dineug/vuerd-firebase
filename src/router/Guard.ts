import { Route, RawLocation } from "vue-router";
import { RouterName } from "@/router";
import store from "@/store";

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
