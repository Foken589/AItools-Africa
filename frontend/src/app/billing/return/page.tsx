import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentResult from "./payment-result";

export const metadata: Metadata = { title: "Payment status" };

export default async function BillingReturnPage({ searchParams }: PageProps<"/billing/return">) {
  const query = await searchParams;
  const reference = Array.isArray(query.reference) ? query.reference[0] : query.reference ?? "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/billing/return?reference=${reference}`)}`);
  return <main className="flex min-h-screen items-center justify-center bg-[#080B0F] px-6 text-white"><div className="w-full max-w-xl"><PaymentResult reference={reference} /></div></main>;
}
