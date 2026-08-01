"use client";

import { useMemo, useState } from "react";
import type { Book, BookStatus, SessionUser } from "@/types";
import { STATUS_META } from "@/types";
import Navbar from "@/components/Navbar";
import Shelf from "@/components/Shelf";
import FilterBar from "@/components/FilterBar";
import BookCard from "@/components/BookCard";
import BookForm, { type BookFormValues } from "@/components/BookForm";

export default function DashboardClient({
  initialBooks,
  user,
}: {
  initialBooks: Book[];
  user: SessionUser;
}) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const availableTags = useMemo(
    () => Array.from(new Set(books.flatMap((b) => b.tags))).sort(),
    [books]
  );

  const filteredBooks = useMemo(
    () =>
      books.filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (tagFilter !== "all" && !b.tags.includes(tagFilter)) return false;
        return true;
      }),
    [books, statusFilter, tagFilter]
  );

  const counts = useMemo(() => {
    const base = { "want-to-read": 0, reading: 0, completed: 0 } as Record<
      BookStatus,
      number
    >;
    for (const b of books) base[b.status]++;
    return base;
  }, [books]);

  function flash(message: string) {
    setBanner(message);
    setTimeout(() => setBanner((current) => (current === message ? null : current)), 2500);
  }

  async function handleAdd(values: BookFormValues) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Failed to add book");
    const { book } = await res.json();
    setBooks((prev) => [book, ...prev]);
    setShowAddForm(false);
    flash(`Added “${book.title}” to your shelf.`);
  }

  async function handleEdit(values: BookFormValues) {
    if (!editingBook) return;
    const res = await fetch(`/api/books/${editingBook._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Failed to update book");
    const { book } = await res.json();
    setBooks((prev) => prev.map((b) => (b._id === book._id ? book : b)));
    setEditingBook(null);
    flash(`Updated “${book.title}”.`);
  }

  async function handleStatusChange(id: string, status: BookStatus) {
    const previous = books;
    // optimistic: flip the status locally right away, revert if the request fails
    setBooks((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setBooks(previous);
      flash("Couldn't update that book's status. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    const previous = books;
    const removed = books.find((b) => b._id === id);
    setBooks((prev) => prev.filter((b) => b._id !== id));
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setBooks(previous);
      flash("Couldn't remove that book. Please try again.");
    } else if (removed) {
      flash(`Removed “${removed.title}” from your shelf.`);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10">
        <section aria-label="Your bookshelf">
          <Shelf books={books} />
        </section>

        <section className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
          <StatPill label="Want to Read" value={counts["want-to-read"]} color={STATUS_META["want-to-read"].color} />
          <StatPill label="Reading" value={counts.reading} color={STATUS_META.reading.color} />
          <StatPill label="Completed" value={counts.completed} color={STATUS_META.completed.color} />
        </section>

        <section className="mt-10 flex items-center justify-between">
          <h2 className="font-display text-2xl">
            Your books{" "}
            <span className="font-mono text-sm text-parchment-dim">({books.length})</span>
          </h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-md bg-status-reading px-4 py-2 text-sm font-medium text-ink"
          >
            {showAddForm ? "Close" : "+ Add a book"}
          </button>
        </section>

        {showAddForm && (
          <section className="mt-4 rounded-lg border border-ink-line bg-ink-raised p-5">
            <BookForm submitLabel="Add book" onSubmit={handleAdd} />
          </section>
        )}

        {editingBook && (
          <section className="mt-4 rounded-lg border border-status-reading bg-ink-raised p-5">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-parchment-dim">
              Editing “{editingBook.title}”
            </p>
            <BookForm
              initial={editingBook}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditingBook(null)}
            />
          </section>
        )}

        <section className="mt-6">
          <FilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            availableTags={availableTags}
          />
        </section>

        <ul className="mt-5 flex flex-col gap-3">
          {filteredBooks.length === 0 ? (
            <li className="rounded-lg border border-dashed border-ink-line px-6 py-10 text-center text-parchment-dim">
              {books.length === 0
                ? "No books yet — add one above to get started."
                : "No books match this filter."}
            </li>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onStatusChange={handleStatusChange}
                onEdit={setEditingBook}
                onDelete={handleDelete}
              />
            ))
          )}
        </ul>
      </main>

      {banner && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-ink-line bg-ink-raised px-4 py-2 text-sm shadow-lg"
        >
          {banner}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-raised px-3 py-2.5">
      <p className="font-display text-2xl" style={{ color }}>
        {value}
      </p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-parchment-dim">
        {label}
      </p>
    </div>
  );
}
