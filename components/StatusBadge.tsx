import { BookStatus, STATUS_META } from "@/types";

const ICON: Record<BookStatus, string> = {
  "want-to-read": "\u{1F4D6}",
  reading: "\u{1F4D8}",
  completed: "\u2705",
};

export default function StatusBadge({ status }: { status: BookStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono tracking-wide"
      style={{
        borderColor: meta.color,
        color: meta.color,
        backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
      }}
    >
      <span aria-hidden>{ICON[status]}</span>
      {meta.label}
    </span>
  );
}
