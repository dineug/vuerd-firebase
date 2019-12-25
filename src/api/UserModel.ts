export type Language = "ko" | "en";

export interface User {
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string;
  notification: number;
  language: Language;
  published: boolean;
}

export interface UserModify {
  name: string;
  nickname: string;
  image: string;
  language: Language;
  published: boolean;
}

export interface Editor {
  themeName: string;
}
