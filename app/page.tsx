import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-parchment-dim">
          Est. today &middot; a shelf of one
        </p>

        <h1 className="mt-6 font-display text-5xl italic leading-tight sm:text-6xl">
          Shelfmark
        </h1>

        <p className="mt-6 text-lg text-parchment-dim leading-relaxed">
          A quiet place to log what you&rsquo;re reading, what you finished,
          and what&rsquo;s waiting on the nightstand. No feeds. No noise.
          Just your shelf.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-md bg-status-reading px-6 py-3 text-center font-medium text-ink transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Start your shelf
          </Link>
          <Link
            href="/login"
            className="w-full rounded-md border border-ink-line px-6 py-3 text-center font-medium text-parchment transition-colors hover:bg-ink-raised sm:w-auto"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
