import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/config"
import { ApiResponse, Comment } from "@/lib/definitions"
import { getTokenFromCookie } from "@/lib/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const token = await getTokenFromCookie()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/comments/${id}/replies`, {
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  const data: ApiResponse<Comment[]> = await response.json()

  return NextResponse.json({
    ...data,
    isAuthenticated: !!token,
  })
}
