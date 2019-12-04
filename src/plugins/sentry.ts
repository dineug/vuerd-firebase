import Vue from "vue";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

Sentry.init({
  dsn: "https://b0d801c5eb444126a7f0abf1eea74117@sentry.io/1845171",
  integrations: [new Integrations.Vue({ Vue, attachProps: true })]
});
