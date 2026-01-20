"use server";

import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { revalidateTag, revalidatePath } from "next/cache";
import { api } from "./api-client";
import { getTokenFromCookie } from "./session";
import { CACHE_TAGS } from "./config";
import { Comment, ReactionType } from "./definitions";

export async function logout(slug: string) {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  const isAdminPage = referer.includes("/admin");

  // NOTE: if on admin page, redirect to home; otherwise to the blog
  redirect(isAdminPage ? "/" : `/${slug}`);
}

export async function checkSlugUniqueness(slug: string) {
  const token = await getTokenFromCookie();

  try {
    await api.get(`/api/admin/slug/check?slug=${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function generateUniqueSlug(title: string) {
  const token = await getTokenFromCookie();

  // NOTE: manual delay to actually let the spinner spin
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const res = await api.get<{ slug: string }>(
      `/api/admin/slug/generate?title=${title}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data.slug;
  } catch {
    return undefined;
  }
}

export async function createBlog(state: unknown, data: unknown) {
  const token = await getTokenFromCookie();

  try {
    await api.post("/api/admin/blogs", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Blog creation failed.",
    };
  }

  revalidateTag(CACHE_TAGS.BLOG_LIST, "max");
  redirect("/admin");
}

export async function updateBlog(slug: string, state: unknown, data: unknown) {
  const token = await getTokenFromCookie();

  try {
    await api.put(`/api/admin/blogs/${slug}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Blog update failed.",
    };
  }

  revalidateTag(CACHE_TAGS.BLOG_LIST, "max");
  revalidateTag(slug, "max");
  redirect(`/admin/blogs/${slug}`, RedirectType.replace);
}

export async function deleteBlog(slug: string) {
  const token = await getTokenFromCookie();

  try {
    await api.delete(`/api/admin/blogs/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Blog deletion failed.",
    };
  }

  revalidateTag(CACHE_TAGS.BLOG_LIST, "max");
  revalidateTag(slug, "max");
  redirect("/admin");
}

export async function toggleBlogVisibility(slug: string, isPublic: boolean) {
  const token = await getTokenFromCookie();

  try {
    await api.put(
      `/api/admin/blogs/${slug}`,
      { isPublic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to update visibility.",
    };
  }

  revalidateTag(CACHE_TAGS.BLOG_LIST, "max");
  revalidateTag(slug, "max");
  redirect("/admin");
}

export async function uploadMedia(formData: FormData) {
  const token = await getTokenFromCookie();

  try {
    const res = await api.post<string[]>("/api/admin/media", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Media upload failed.",
      data: [] as string[],
    };
  }
}

// ============================================================================
// Interactions
// ============================================================================

export async function toggleReaction(slug: string, reaction: ReactionType) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated" };
  }

  try {
    await api.post(
      "/api/reactions",
      { identifier: slug, to: "BLOG", reaction },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { isSuccess: true };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to toggle reaction",
    };
  }
}

export async function addComment(slug: string, content: string) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated", data: null };
  }

  try {
    const response = await api.post<Comment>(
      `/api/blogs/${slug}/comments`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    revalidatePath(`/${slug}`);
    return { isSuccess: true, data: response.data };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to add comment",
      data: null,
    };
  }
}

export async function editComment(commentId: string, content: string) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated" };
  }

  try {
    await api.patch(
      `/api/comments/${commentId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { isSuccess: true };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to edit comment",
    };
  }
}

export async function deleteComment(commentId: string) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated" };
  }

  try {
    await api.delete(`/api/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { isSuccess: true };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to delete comment",
    };
  }
}

export async function addReply(parentId: string, content: string) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated", data: null };
  }

  try {
    const response = await api.post<Comment>(
      `/api/comments/${parentId}/replies`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { isSuccess: true, data: response.data };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to add reply",
      data: null,
    };
  }
}

export async function toggleCommentReaction(
  commentId: string,
  reaction: ReactionType,
) {
  const token = await getTokenFromCookie();
  if (!token) {
    return { isSuccess: false, message: "Not authenticated" };
  }

  try {
    await api.post(
      "/api/reactions",
      { identifier: commentId, to: "COMMENT", reaction },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { isSuccess: true };
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Failed to toggle reaction",
    };
  }
}
