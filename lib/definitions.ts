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

export type ReactionType =
  | "LIKE"
  | "FIRE"
  | "SMILE"
  | "LAUGHING"
  | "HEART"
  | "THINKING"
  | "DISLIKE";

export type ReactionCount = Record<ReactionType, number>;

export type ReactionsData = {
  givenStatus: ReactionType | null;
  count: ReactionCount;
};

export type CommentUser = {
  _id: string;
  name: string;
  picture: string;
};

export type CommentReactions = {
  givenStatus: ReactionType | null;
  count: ReactionCount;
};

export type Comment = {
  _id: string;
  user: CommentUser;
  content: string;
  createdAt: string;
  updatedAt: string;
  reactions: CommentReactions;
  replies: number;
  isCommentOwner: boolean;
};
