export interface Comment {
  uid: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  message: string;
  updatedAt: number;
  createdAt: number;
}
