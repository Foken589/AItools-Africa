"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Result = { status?: string; credits?: number; balance?: number; message?: string; error?: string };

export default function PaymentResult({ reference }: { reference: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(true);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`/api/billing/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
        const payload = await response.json() as Result;
        if (active) setResult(payload);
      } catch { if (active) setResult({ error: "Could not check the payment yet. You can retry from this page." }); }
      finally { if (active) setPending(false); }
    })();
    return () => { active = false; };
  }, [reference]);

  async function retry() {
    setPending(true); setResult(null);
    try {
      const response = await fetch(`/api/billing/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
      setResult(await response.json() as Result);
    } catch { setResult({ error: "Could not check the payment yet." }); }
    finally { setPending(false); }
  }

  return <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center">
    <h1 className="text-2xl font-bold text-white">{pending ? "Verifying your payment…" : result?.status === "success" ? "Payment confirmed" : "Payment not confirmed"}</h1>
    {pending ? <p className="mt-3 text-sm text-white/55">We are checking directly with Paystack. Credits are added only after server verification.</p> : result?.status === "success" ? <p className="mt-3 text-sm text-emerald-200">{result.credits} credits added to your account. Current balance: {result.balance ?? "updated"}.</p> : <p role="status" className="mt-3 text-sm text-white/65">{result?.message ?? result?.error ?? "No payment was confirmed. Pending payments may take a little longer."}</p>}
    {!pending && result?.status !== "success" && <button onClick={retry} className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Check again</button>}
    <Link href="/dashboard" className="mt-6 block text-sm text-emerald-300">Go to dashboard</Link>
  </section>;
}
