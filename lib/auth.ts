import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "pbm_token";
const SESSION_LENGTH = "7d";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_LENGTH)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Convenience for API routes: pull the session straight off the incoming request.
export async function getSessionFromRequest(req: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<SessionPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

// Shared cookie options for setting/clearing the session cookie in API routes.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days, matches SESSION_LENGTH
};
