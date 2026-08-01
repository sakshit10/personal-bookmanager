"use client";

import { useMemo } from "react";
import type { Book } from "@/types";
import { STATUS_META } from "@/types";

// Deterministic pseudo-randomness from the book's own id/title, so a given
// book always renders the same spine — the shelf doesn't jitter on refetch.
function hashToRange(input: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min));
}

export default function Shelf({ books }: { books: Book[] }) {
  const spines = useMemo(
    () =>
      books.map((book) => ({
        book,
        height: hashToRange(book._id + book.title, 92, 168),
        width: hashToRange(book.title, 15, 26),
        tilt: hashToRange(book._id, -2, 3),
      })),
    [books]
  );

  if (books.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-line px-6 py-10 text-center">
        <p className="font-display text-lg italic text-parchment-dim">
          The shelf is empty.
        </p>
        <p className="mt-1 text-sm text-parchment-dim">
          Add your first book below and watch it take its place.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex min-w-max items-end gap-[3px] px-1">
        {spines.map(({ book, height, width, tilt }, i) => (
          <div
            key={book._id}
            className="spine-wrap group relative"
            style={{ animationDelay: `${Math.min(i * 35, 600)}ms` }}
          >
            <div
              className="spine origin-bottom cursor-default rounded-[2px] shadow-[inset_-3px_0_6px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out group-hover:-translate-y-2"
              style={{
                height,
                width,
                backgroundColor: STATUS_META[book.status].color,
                transform: `rotate(${tilt * 0.3}deg)`,
              }}
            />
            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[180px] -translate-x-1/2 rounded-md border border-ink-line bg-ink-raised px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
            >
              <p className="font-medium leading-snug">{book.title}</p>
              <p className="text-parchment-dim leading-snug">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
      {/* the plank the spines rest on */}
      <div className="mt-1 h-2 min-w-max rounded-sm bg-ink-line" style={{ width: "100%" }} />
    </div>
  );
}
