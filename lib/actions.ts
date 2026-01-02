"use server";

import { redirect, RedirectType } from "next/navigation";
import { api } from "./api-client";
import { getTokenFromCookie } from "./utils.server";

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
    await api.post("/api/admin/blog", data, {
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

  redirect("/admin");
}

export async function updateBlog(slug: string, state: unknown, data: unknown) {
  const token = await getTokenFromCookie();

  try {
    await api.put(`/api/admin/blog/${slug}`, data, {
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

  redirect(`/admin/${slug}`, RedirectType.replace);
}

export async function deleteBlog(slug: string) {
  const token = await getTokenFromCookie();

  try {
    await api.delete(`/api/admin/blog/${slug}`, {
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

  redirect("/admin");
}

export async function uploadImages(formData: FormData) {
  const token = await getTokenFromCookie();

  try {
    const res = await api.post<string[]>("/api/admin/images", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (e) {
    return {
      isSuccess: false,
      message: e instanceof Error ? e.message : "Image upload failed.",
      data: [] as string[],
    };
  }
}
