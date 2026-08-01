import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: session.userId, name: session.name, email: session.email },
  });
}
