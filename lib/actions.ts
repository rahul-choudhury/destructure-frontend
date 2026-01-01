"use server";

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
