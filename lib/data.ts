"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { api } from "./api-client";
import { CACHE_TAGS } from "./config";
import type { Blog } from "./definitions";

export async function getBlogs() {
  cacheTag(CACHE_TAGS.BLOG_LIST);
  cacheLife("weeks");
  return api.get<Blog[]>("/api/blogs");
}

export async function getBlog(slug: string) {
  cacheTag(slug);
  cacheLife("max");
  return api.get<Blog>(`/api/blogs/${slug}`);
}
