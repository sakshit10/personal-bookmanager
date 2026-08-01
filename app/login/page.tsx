import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in — Shelfmark" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 font-display text-2xl italic">
        Shelfmark
      </Link>
      <h1 className="mb-8 font-display text-2xl">Welcome back</h1>
      <AuthForm mode="login" />
    </main>
  );
}
