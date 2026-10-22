import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return <main className="min-h-screen bg-[#080B0F] px-6 py-20 text-white"><article className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-emerald-300">← Home</Link><h1 className="mt-10 text-4xl font-bold">Contact support</h1><p className="mt-5 leading-7 text-white/65">For account questions or launch updates, contact the AItools Africa team.</p>{email ? <a className="mt-5 inline-block text-emerald-300 underline" href={`mailto:${email}`}>{email}</a> : <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100/80">Support email is not configured yet. Set NEXT_PUBLIC_SUPPORT_EMAIL before publishing.</p>}</article></main>;
}
