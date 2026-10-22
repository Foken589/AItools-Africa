import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return <main className="min-h-screen bg-[#080B0F] px-6 py-20 text-white"><article className="mx-auto max-w-3xl"><Link href="/" className="text-sm text-emerald-300">← Home</Link><h1 className="mt-10 text-4xl font-bold">Terms of use</h1><p className="mt-6 leading-7 text-white/65">AItools Africa provides AI assisted writing, summarization, email drafting, and study explanations. AI outputs can be inaccurate and should be reviewed before use. Do not submit information you are not authorized to share.</p><p className="mt-4 leading-7 text-white/65">Starter and Pro are one-time credit packs, not subscriptions. A credit is deducted only for a completed writing request saved to usage history. Current draft prices are shown on the pricing page and may change before launch. A verified full refund reverses remaining pack credits; partial refunds and disputes require support review. Applicable consumer rights are not limited by this notice.</p><p className="mt-4 leading-7 text-white/65">These preliminary terms need legal review for the operating jurisdiction, refunds, support, privacy, and consumer protection before commercial launch. For questions, visit the <Link href="/contact" className="text-emerald-300 underline">Contact page</Link>.</p></article></main>;
}
