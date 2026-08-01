import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Book, { BOOK_STATUSES } from "@/models/Book";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");

  const query: Record<string, unknown> = { user: session.userId };
  if (status && BOOK_STATUSES.includes(status as (typeof BOOK_STATUSES)[number])) {
    query.status = status;
  }
  if (tag) {
    query.tags = tag.toLowerCase().trim();
  }

  const books = await Book.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ books });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { title, author, tags, status } = await req.json();

    if (!title?.trim() || !author?.trim()) {
      return NextResponse.json(
        { error: "Title and author are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const book = await Book.create({
      user: session.userId,
      title: title.trim(),
      author: author.trim(),
      tags: Array.isArray(tags) ? tags : [],
      status: BOOK_STATUSES.includes(status) ? status : "want-to-read",
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (err) {
    console.error("Create book error:", err);
    return NextResponse.json(
      { error: "Something went wrong while adding the book." },
      { status: 500 }
    );
  }
}
