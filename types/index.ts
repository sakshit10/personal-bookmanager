export const BOOK_STATUSES = ["want-to-read", "reading", "completed"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface Book {
  _id: string;
  title: string;
  author: string;
  tags: string[];
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export const STATUS_META: Record<
  BookStatus,
  { label: string; short: string; color: string }
> = {
  "want-to-read": { label: "Want to Read", short: "Want to Read", color: "var(--status-want)" },
  reading: { label: "Reading", short: "Reading", color: "var(--status-reading)" },
  completed: { label: "Completed", short: "Completed", color: "var(--status-done)" },
};
