"use client";

import { useState, type FormEvent } from "react";
import type { Book, BookStatus } from "@/types";
import { BOOK_STATUSES, STATUS_META } from "@/types";

export interface BookFormValues {
  title: string;
  author: string;
  tags: string[];
  status: BookStatus;
}

export default function BookForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Book;
  submitLabel: string;
  onSubmit: (values: BookFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<BookStatus>(initial?.status ?? "want-to-read");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("Title and author are both required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
      });
      if (!initial) {
        setTitle("");
        setAuthor("");
        setTagsInput("");
        setStatus("want-to-read");
      }
    } catch {
      setError("Couldn't save that book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Title"
        className="auth-input"
        required
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        aria-label="Author"
        className="auth-input"
        required
      />
      <input
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="Tags, comma separated (e.g. sci-fi, favorites)"
        aria-label="Tags"
        className="auth-input sm:col-span-2"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as BookStatus)}
        aria-label="Status"
        className="auth-input"
      >
        {BOOK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-status-reading px-5 py-2.5 font-medium text-ink transition-opacity disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-ink-line px-5 py-2.5 text-parchment-dim transition-colors hover:text-parchment"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {error}
        </p>
      )}
    </form>
  );
}
