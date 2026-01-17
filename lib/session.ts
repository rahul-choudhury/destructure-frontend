import "server-only";
import { cookies } from "next/headers";
import { JWTPayload, jwtVerify } from "jose";

export async function getTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

interface JWTPayloadWithRole extends JWTPayload {
  isAdmin: boolean;
}

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function decodeToken(jwtToken: string | undefined = "") {
  try {
    const { payload } = await jwtVerify<JWTPayloadWithRole>(
      jwtToken,
      encodedKey,
      {
        algorithms: ["HS256"],
      },
    );
    return payload;
  } catch {
    return undefined;
  }
}
