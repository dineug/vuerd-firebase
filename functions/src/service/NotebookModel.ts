// @ts-ignore
export type Role = "owner" | "writer" | "reader";
export type Status = "invitation" | "accept";

export interface Notebook {
  roles: { [key: string]: Role };
  members: string[];
  published: boolean;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  updatedAt: number;
  createdAt: number;
}

export interface Member {
  fromId: string;
  uid: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  status: Status;
  createdAt: number;
}
