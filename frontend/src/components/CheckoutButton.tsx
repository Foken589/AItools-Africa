"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ plan, label, featured }: { plan: "starter" | "pro" | "max"; label: string; featured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/billing/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const result = await response.json() as { checkoutUrl?: string; error?: string };
      if (response.status === 401) { router.push(`/login?next=${encodeURIComponent("/#pricing")}`); return; }
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Unable to start checkout.");
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start checkout.");
      setPending(false);
    }
  }

  return <div className="mt-8"><button type="button" onClick={checkout} disabled={pending} className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${featured ? "bg-[#20E39A] text-[#080B0F] hover:bg-[#35f0aa]" : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"}`}>{pending ? "Opening checkout…" : label}</button>{error && <p role="alert" className="mt-2 text-center text-xs text-red-300">{error}</p>}</div>;
}
