import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signSession, sessionCookieOptions, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // password has select:false on the schema, so it must be requested explicitly
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    // Same generic error whether the email or password was wrong,
    // so we don't reveal which accounts exist.
    const invalidCredentials = () =>
      NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (!user) return invalidCredentials();

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return invalidCredentials();

    const token = await signSession({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
    res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 }
    );
  }
}
