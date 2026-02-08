import { api } from "./api-client"
import { Comment, ReactionsData, User } from "./definitions"
import { getTokenFromCookie } from "./session"

export async function getBlogReactions(slug: string): Promise<{
  reactions: ReactionsData
  isAuthenticated: boolean
}> {
  const token = await getTokenFromCookie()
  const response = await api.get<ReactionsData>(
    `/api/blogs/${slug}/reactions`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  )
  return {
    reactions: response.data,
    isAuthenticated: !!token,
  }
}

export async function getBlogComments(slug: string): Promise<Comment[]> {
  const token = await getTokenFromCookie()
  const response = await api.get<Comment[]>(
    `/api/blogs/${slug}/comments`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  )
  return response.data
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getTokenFromCookie()
  if (!token) return null

  try {
    const response = await api.get<User>("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch {
    return null
  }
}
