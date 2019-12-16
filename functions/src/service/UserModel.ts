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
