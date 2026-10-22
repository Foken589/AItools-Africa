import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WritingTool from "./writing-tool";

export const metadata: Metadata = { title: "Writing Assistant" };

export default async function WritingAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Ftools%2Fwriting");
  return <main className="min-h-screen bg-[#080B0F] px-6 py-14 text-white"><div className="mx-auto max-w-5xl"><Link href="/" className="text-sm text-emerald-300">← AItools Africa</Link><h1 className="mt-9 text-4xl font-bold">Writing assistant</h1><p className="mt-3 max-w-2xl leading-7 text-white/55">Improve text, summarize notes, draft an email, or explain a study topic. Results come from the configured AI provider.</p><WritingTool /></div></main>;
}
