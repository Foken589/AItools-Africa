import { Check } from "lucide-react";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import { createClient } from "@/lib/supabase/server";
import { freeDailyWritingLimit } from "@/lib/ai/usage";

type PaidPlan = { plan_key: "starter" | "pro" | "max"; name: string; amount_kobo: number; currency: "NGN"; credits: number };

export default async function Pricing() {
  const supabase = await createClient();
  const { data: configuredPlans, error: plansError } = await supabase.from("aitools_plans").select("plan_key,name,amount_kobo,currency,credits").eq("enabled", true).order("amount_kobo");
  const plans = [
    { planKey: "free" as const, name: "Free", description: "Try the writing assistant with a daily allowance.", price: "₦0", period: "forever", credits: `${freeDailyWritingLimit()} free requests per day`, features: ["Writing assistant access", "Daily free usage allowance"], featured: false },
    ...((configuredPlans ?? []) as PaidPlan[]).map((plan) => ({
      planKey: plan.plan_key,
      name: plan.name,
      description: plan.plan_key === "starter" ? "A one-time credit pack to get started." : plan.plan_key === "pro" ? "A larger one-time credit pack for frequent use." : "Best value for high-volume use.",
      price: new Intl.NumberFormat("en-NG", { style: "currency", currency: plan.currency, maximumFractionDigits: 0 }).format(plan.amount_kobo / 100),
      period: "one-time",
      credits: `${plan.credits} credits`,
      features: [`${plan.credits} writing requests`, "Credits never expire", "Paid credits are used before free daily requests"],
      featured: false,
    })),
  ];
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#080B0F] py-28"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-20 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[#20E39A]/[0.035] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#20E39A]">
            Simple pricing
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start free.
            <br />
            <span className="text-white/40">
              Buy a one-time credit pack when you need more.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-white/45">
            One credit covers one completed writing request. Failed generation requests are not charged.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                plan.featured
                  ? "border-[#20E39A]/40 bg-[#20E39A]/[0.045] shadow-[0_0_60px_rgba(32,227,154,0.06)]"
                  : "border-white/[0.08] bg-white/[0.025]"
              }`}
            >
              {/* Plan name */}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>

                <p className="mt-2 min-h-[48px] max-w-sm text-sm leading-6 text-white/40">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-8">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    {plan.price}
                  </span>

                  {plan.period && <span className="pb-1 text-xs text-white/35">/ {plan.period}</span>}
                </div>

                <div className="mt-4 inline-flex rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/65">
                  {plan.credits}
                </div>
              </div>

              {plan.planKey === "free" ? <Link href="/login?mode=signup" className="mt-8 block w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/[0.08]">Get started</Link> : <CheckoutButton plan={plan.planKey} label={`Buy ${plan.credits}`} featured={plan.featured} />}

              {/* Divider */}
              <div className="my-7 h-px bg-white/[0.07]" />

              {/* Features */}
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#20E39A]/10">
                      <Check
                        size={11}
                        className="text-[#20E39A]"
                      />
                    </div>

                    <span className="text-sm text-white/55">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {plansError && <p className="mt-6 text-center text-sm text-amber-100/70">Paid credit packs are temporarily unavailable while billing is configured.</p>}

        {/* Bottom note */}
        <p className="mt-8 text-center text-xs text-white/25">
          One credit is charged only after a successful AI response is saved to your usage history.
        </p>
      </div>
    </section>
  );
}
