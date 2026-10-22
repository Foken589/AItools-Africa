import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#080B0F] px-6 text-white"><div className="max-w-md text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">404</p><h1 className="mt-4 text-3xl font-bold">Page not found</h1><p className="mt-3 text-white/60">That page may have moved or is not available yet.</p><Link href="/" className="mt-7 inline-block rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black">Back to home</Link></div></main>;
}
