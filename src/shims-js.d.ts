declare module "@johmun/vue-tags-input";
interface Jdenticon {
  version: string;
  update(selector: Element | string, hash: string): void;
  toSvg(hash: string, size: number): string;
}
interface Window {
  jdenticon: Jdenticon;
}
