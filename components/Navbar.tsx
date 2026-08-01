"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/types";

export default function Navbar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-line px-6 py-4 sm:px-10">
      <span className="font-display text-xl italic">Shelfmark</span>
      <div className="flex items-center gap-4">
        <span className="hidden font-mono text-xs text-parchment-dim sm:inline">
          {user.name}
        </span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-md border border-ink-line px-3 py-1.5 text-sm text-parchment-dim transition-colors hover:border-status-reading hover:text-parchment disabled:opacity-60"
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
