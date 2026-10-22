"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "./actions";

export default function LoginForm({ next, mode, confirmationError }: { next: string; mode: string; confirmationError: boolean }) {
  const [error, setError] = useState(confirmationError ? "That confirmation link is invalid or expired. Sign up again or request a fresh link." : "");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function submit(action: typeof login | typeof signup, formData: FormData) {
    setLoading(true); setError("");
    formData.set("next", next);
    try {
      const result = await action(formData);
      if (result && "error" in result) setError(result.error ?? "Sign-in failed.");
    } catch (cause) {
      // Next redirect() uses a thrown control-flow signal; allow it to reach Next.
      if (cause && typeof cause === "object" && "digest" in cause && String(cause.digest).startsWith("NEXT_REDIRECT")) throw cause;
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return <form className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8" action={(formData) => submit(isSignup ? signup : login, formData)}>
    <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400" /></div>
    <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">Password</label><input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} maxLength={128} required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400" />{isSignup && <p className="mt-2 text-xs text-white/40">Use at least 8 characters.</p>}</div>
    {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    <div className="flex flex-col gap-3"><button disabled={loading} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50">{loading ? "Please wait…" : isSignup ? "Create account" : "Login"}</button>
      {!isSignup && <Link href="/forgot-password" className="text-center text-sm text-emerald-300 hover:underline">Forgot your password?</Link>}
      <Link href={isSignup ? `/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}` : `/login?mode=signup${next !== "/dashboard" ? `&next=${encodeURIComponent(next)}` : ""}`} className="text-center text-sm text-white/65 hover:text-white">{isSignup ? "Already registered? Sign in" : "New here? Create an account"}</Link>
    </div>
  </form>;
}
