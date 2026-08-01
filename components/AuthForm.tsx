"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup ? { name, email, password } : { email, password }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      {isSignup && (
        <Field label="Name">
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            placeholder="Ada Lovelace"
          />
        </Field>
      )}

      <Field label="Email">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password">
        <input
          type="password"
          required
          minLength={8}
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          placeholder="At least 8 characters"
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-status-reading py-3 font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {submitting
          ? isSignup
            ? "Creating your shelf…"
            : "Logging in…"
          : isSignup
          ? "Create account"
          : "Log in"}
      </button>

      <p className="text-center text-sm text-parchment-dim">
        {isSignup ? (
          <>
            Already have a shelf?{" "}
            <Link href="/login" className="text-status-reading underline underline-offset-4">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-status-reading underline underline-offset-4">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-parchment-dim">
        {label}
      </span>
      {children}
    </label>
  );
}
