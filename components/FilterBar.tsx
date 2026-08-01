"use client";

import { BOOK_STATUSES, STATUS_META, type BookStatus } from "@/types";

export default function FilterBar({
  statusFilter,
  setStatusFilter,
  tagFilter,
  setTagFilter,
  availableTags,
}: {
  statusFilter: BookStatus | "all";
  setStatusFilter: (s: BookStatus | "all") => void;
  tagFilter: string | "all";
  setTagFilter: (t: string) => void;
  availableTags: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip
        active={statusFilter === "all"}
        onClick={() => setStatusFilter("all")}
        label="All"
      />
      {BOOK_STATUSES.map((status) => (
        <FilterChip
          key={status}
          active={statusFilter === status}
          onClick={() => setStatusFilter(status)}
          label={STATUS_META[status].short}
          dot={STATUS_META[status].color}
        />
      ))}

      {availableTags.length > 0 && (
        <>
          <span className="mx-1 h-4 w-px bg-ink-line" aria-hidden />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            aria-label="Filter by tag"
            className="rounded-full border border-ink-line bg-ink-raised px-3 py-1.5 text-sm text-parchment"
          >
            <option value="all">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-status-reading bg-status-reading/15 text-parchment"
          : "border-ink-line text-parchment-dim hover:text-parchment"
      }`}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
