"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#080B0F] px-6 text-white"><div className="max-w-md text-center"><h1 className="text-3xl font-bold">Something went wrong</h1><p className="mt-3 text-white/60">Please try again. If the problem continues, contact support.</p><button onClick={reset} className="mt-7 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black">Try again</button></div></main>;
}
