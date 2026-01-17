import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { ApiResponse, User } from "@/lib/definitions";
import { getTokenFromCookie } from "@/lib/session";

export async function GET() {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { isSuccess: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const response = await fetch(`${API_URL}/api/auth/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(errorData, { status: response.status });
  }

  const data: ApiResponse<User> = await response.json();

  return NextResponse.json(data);
}
