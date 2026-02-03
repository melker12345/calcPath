import { readStorage, writeStorage } from "@/lib/storage";

export type ForumPost = {
  id: string;
  author: string;
  title: string;
  body: string;
  createdAt: string;
  replies: ForumReply[];
};

export type ForumReply = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

const FORUM_KEY = "calc_forum_v1";

export const getForumPosts = (): ForumPost[] =>
  readStorage<ForumPost[]>(FORUM_KEY, []);

export const saveForumPosts = (posts: ForumPost[]) => {
  writeStorage(FORUM_KEY, posts);
};

export const addForumPost = (post: ForumPost) => {
  const posts = getForumPosts();
  saveForumPosts([post, ...posts]);
};

export const addForumReply = (postId: string, reply: ForumReply) => {
  const posts = getForumPosts().map((post) =>
    post.id === postId
      ? { ...post, replies: [reply, ...post.replies] }
      : post,
  );
  saveForumPosts(posts);
};
