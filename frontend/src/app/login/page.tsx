import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const requestedNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  const mode = query.mode === "signup" ? "signup" : "login";
  return <main className="flex min-h-screen items-center justify-center bg-[#070b0b] px-6 py-16"><div className="w-full max-w-md">
    <Link href="/" className="mb-8 block text-center text-sm text-emerald-300">AItools Africa</Link>
    <div className="mb-8 text-center"><h1 className="text-3xl font-bold text-white">{mode === "signup" ? "Create your account" : "Welcome back"}</h1><p className="mt-3 text-gray-400">{mode === "signup" ? "Get started with AItools Africa." : "Sign in to continue to your account."}</p></div>
    <LoginForm next={next} mode={mode} confirmationError={query.error === "confirmation"} />
  </div></main>;
}
