export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

export type User = {
  _id: string;
  name: string;
  picture: string;
};

export type Blog = {
  _id: string;
  slug: string;
  title: string;
  banner: string | null;
  description: string;
  content: string;
  author: User;
  coAuthor: User | null;
  comments: number;
  createdAt: string;
  isPublic: boolean;
  reactionStatus: null; // TODO
  reactions: number;
  updatedAt: string;
};
