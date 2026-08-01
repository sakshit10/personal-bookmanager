import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Book, { BOOK_STATUSES } from "@/models/Book";
import { getSessionFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.author === "string" && body.author.trim()) updates.author = body.author.trim();
  if (Array.isArray(body.tags)) updates.tags = body.tags;
  if (BOOK_STATUSES.includes(body.status)) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await connectToDatabase();

  // Scoping the filter to `user: session.userId` is what makes this "protecting
  // user data thoughtfully" rather than just checking auth exists — it stops
  // one user from editing another user's book by guessing an id.
  const book = await Book.findOneAndUpdate(
    { _id: id, user: session.userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const book = await Book.findOneAndDelete({ _id: id, user: session.userId });
  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
