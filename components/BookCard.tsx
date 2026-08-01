"use client";

import { useState } from "react";
import type { Book, BookStatus } from "@/types";
import { BOOK_STATUSES, STATUS_META } from "@/types";

export default function BookCard({
  book,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  book: Book;
  onStatusChange: (id: string, status: BookStatus) => void;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li className="group flex flex-col gap-3 rounded-lg border border-ink-line bg-ink-raised p-4 transition-colors hover:border-ink-line/80 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-display text-lg">{book.title}</p>
        <p className="truncate text-sm text-parchment-dim">{book.author}</p>
        {book.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] text-parchment-dim"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="sr-only" htmlFor={`status-${book._id}`}>
          Change status for {book.title}
        </label>
        <select
          id={`status-${book._id}`}
          value={book.status}
          onChange={(e) => onStatusChange(book._id, e.target.value as BookStatus)}
          className="rounded-full border px-2.5 py-1 text-xs font-mono"
          style={{ borderColor: STATUS_META[book.status].color, color: STATUS_META[book.status].color }}
        >
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-ink text-parchment">
              {STATUS_META[s].label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onEdit(book)}
          className="rounded-md px-2 py-1 text-sm text-parchment-dim transition-colors hover:text-parchment"
        >
          Edit
        </button>

        {confirmingDelete ? (
          <span className="flex items-center gap-1.5">
            <button
              onClick={() => onDelete(book._id)}
              className="rounded-md bg-danger px-2 py-1 text-sm text-ink"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md px-2 py-1 text-sm text-parchment-dim"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md px-2 py-1 text-sm text-parchment-dim transition-colors hover:text-danger"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
