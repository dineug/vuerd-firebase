declare module "@johmun/vue-tags-input";
declare module "marked";
declare module "@tweenjs/tween.js";
declare module "highlight.js";
declare module "vue-fragment";
declare module "undo-manager";
interface FB {
  init(param: {
    appId: number;
    xfbml: boolean;
    autoLogAppEvents: boolean;
    version: string;
  }): void;
  ui(
    option: { method: string; href: string; hashtag?: string },
    callback?: (response: { error_message: string }) => void
  ): void;
}
interface Window {
  FB: FB;
}
