export type Language = "ko" | "en";

export interface User {
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  notification: number;
  language: Language;
  published: boolean;
}

export interface UserModify {
  name: string;
  nickname: string;
  image: string | null;
  language: Language;
  published: boolean;
}

export interface Editor {
  themeName: string;
}
