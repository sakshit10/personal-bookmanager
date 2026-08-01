import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import BookModel from "@/models/Book";
import DashboardClient from "./DashboardClient";
import type { Book } from "@/types";

export const metadata = { title: "Your shelf — Shelfmark" };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  // Belt-and-suspenders: middleware already guards /dashboard, but a page
  // should never assume a request reached it only via that middleware.
  if (!session) redirect("/login");

  await connectToDatabase();
  const rawBooks = await BookModel.find({ user: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  const initialBooks: Book[] = rawBooks.map((b) => ({
    _id: b._id.toString(),
    title: b.title,
    author: b.author,
    tags: b.tags,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient
      initialBooks={initialBooks}
      user={{ id: session.userId, name: session.name, email: session.email }}
    />
  );
}
