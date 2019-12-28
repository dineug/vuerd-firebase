import { Route, RawLocation } from "vue-router";
import { routes } from "@/router";
import store, { Commit } from "@/store";

export function signIn(
  to: Route,
  from: Route,
  next: (to?: RawLocation) => void
) {
  if (store.state.user) {
    next();
  } else {
    store.commit(Commit.referer, to.path);
    next(routes.Notebook);
  }
}

export function signOut(
  to: Route,
  from: Route,
  next: (to?: RawLocation) => void
) {
  if (store.state.user) {
    next(routes.Notebook);
  } else {
    store.commit(Commit.referer, from.path);
    next();
  }
}
