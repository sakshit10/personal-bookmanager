import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signSession, sessionCookieOptions, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are all required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({ name: name.trim(), email, password });

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
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating your account." },
      { status: 500 }
    );
  }
}
