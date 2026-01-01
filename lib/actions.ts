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
