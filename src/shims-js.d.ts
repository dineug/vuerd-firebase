declare module "@johmun/vue-tags-input";
declare module "marked";
declare module "@tweenjs/tween.js";
declare module "highlight.js";
declare module "vue-fragment";
interface Jdenticon {
  version: string;
  update(selector: Element | string, hash: string): void;
  toSvg(hash: string, size: number): string;
}
interface Window {
  jdenticon: Jdenticon;
}
