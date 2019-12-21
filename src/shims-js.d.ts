declare module "@johmun/vue-tags-input";
declare module "marked";
declare module "@tweenjs/tween.js";
declare module "highlight.js";
declare module "vue-fragment";
declare module "undo-manager";
interface FB {
  init(option: {
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
interface Kakao {
  init(key: string): void;
  Link: KakaoLink;
  Story: KakaoStory;
}
interface KakaoLink {
  sendDefault(option: KakaoLinkOption): void;
}
type KakaoLinkOptionObjectType = "feed";
interface KakaoLinkOption {
  objectType: KakaoLinkOptionObjectType;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: { mobileWebUrl: string; webUrl: string };
  };
  social: { likeCount?: number; commentCount?: number; sharedCount?: number };
  buttons: [
    {
      title: string;
      link: {
        mobileWebUrl: string;
        webUrl: string;
      };
    }
  ];
}
interface KakaoStory {
  share(option: { url: string; text: string }): void;
}

interface Window {
  FB: FB;
  Kakao: Kakao;
}
