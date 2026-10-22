import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=%2Fdashboard");
  const [accountResult, paymentResult, usageResult] = await Promise.all([
    supabase.from("aitools_credit_accounts").select("balance").eq("user_id", user.id).maybeSingle(),
    supabase.from("aitools_payments").select("reference,plan_key,amount_kobo,currency,credits,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("aitools_tool_usage").select("id,task,credit_source,input_characters,output_characters,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const billingReady = !accountResult.error && !paymentResult.error && !usageResult.error;
  return <main className="min-h-screen bg-[#080B0F] px-6 py-16 text-white"><div className="mx-auto max-w-4xl"><Link href="/" className="text-sm text-emerald-300">← AItools Africa</Link><h1 className="mt-10 text-4xl font-bold">Your dashboard</h1><p className="mt-3 text-white/60">Signed in as <span className="text-white">{user.email}</span></p>
    {billingReady ? <>
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-semibold">Credit balance</h2><p className="mt-2 text-3xl font-bold text-emerald-300">{accountResult.data?.balance ?? 0}</p><p className="mt-1 text-xs text-white/45">Paid credits are used before the free daily allowance.</p><Link href="/#pricing" className="mt-4 inline-block text-sm text-emerald-300">View credit packs</Link></section>
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-semibold">Recent tool usage</h2>{usageResult.data?.length ? <div className="mt-4 divide-y divide-white/10">{usageResult.data.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="text-white/80">Writing assistant · {item.task}</span><span className="text-white/45">{item.credit_source === "paid_credit" ? "1 credit" : "Free daily request"} · {new Date(item.created_at).toLocaleString()}</span></div>)}</div> : <p className="mt-3 text-sm text-white/50">No completed requests yet. <Link href="/tools/writing" className="text-emerald-300">Try the writing assistant</Link>.</p>}</section>
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-semibold">Payment history</h2>{paymentResult.data?.length ? <div className="mt-4 divide-y divide-white/10">{paymentResult.data.map((item) => <div key={item.reference} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="text-white/80">{item.plan_key === "starter" ? "Starter" : item.plan_key === "pro" ? "Pro" : "Max"} · {item.credits} credits</span><span className="text-white/45">₦{(item.amount_kobo / 100).toLocaleString()} · {item.status} · {new Date(item.created_at).toLocaleDateString()}</span></div>)}</div> : <p className="mt-3 text-sm text-white/50">No payments yet.</p>}</section>
    </> : <section className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6"><h2 className="font-semibold text-amber-100">Billing setup is not complete</h2><p className="mt-2 text-sm leading-6 text-amber-100/75">The billing migration must be reviewed and applied to Supabase before credit balances, usage history, or payment history can be shown.</p></section>}
    <form action={logout} className="mt-6"><button className="rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/5">Log out</button></form></div></main>;
}
