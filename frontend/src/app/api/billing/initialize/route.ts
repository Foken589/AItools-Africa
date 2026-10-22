import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paystackSecret } from "@/lib/billing/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.email) return NextResponse.json({ error: "Sign in with a verified email before checking out." }, { status: 401 });

  const secret = paystackSecret();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !siteUrl) return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  let body: { plan?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 2000) return NextResponse.json({ error: "Invalid request." }, { status: 413 });
    body = JSON.parse(raw) as { plan?: unknown };
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.plan !== "starter" && body.plan !== "pro" && body.plan !== "max") return NextResponse.json({ error: "Choose an available plan." }, { status: 400 });

  const reference = `AT${randomUUID().replaceAll("-", "")}`;
  const { data: prepared, error: prepareError } = await supabase.rpc("aitools_prepare_payment", { p_plan_key: body.plan, p_reference: reference });
  const payment = Array.isArray(prepared) ? prepared[0] : prepared;
  if (prepareError || !payment) return NextResponse.json({ error: prepareError?.code === "54000" ? "Too many pending checkouts. Try again later." : "Unable to prepare checkout. Apply the billing migration and try again." }, { status: prepareError?.code === "54000" ? 429 : 503 });

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: String(payment.amount_kobo),
        currency: payment.currency,
        reference,
        callback_url: new URL("/billing/return", siteUrl).toString(),
        metadata: { user_id: user.id, plan_key: body.plan, custom_fields: [{ display_name: "Plan", variable_name: "plan", value: payment.plan_name }] },
      }),
      cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ error: "Payment provider is temporarily unavailable. No payment was confirmed; try again shortly." }, { status: 502 });
  }
  const initialized = await providerResponse.json().catch(() => null) as { status?: boolean; data?: { authorization_url?: string; reference?: string } } | null;
  const checkoutUrl = initialized?.data?.authorization_url;
  let parsedCheckout: URL | null = null;
  try { if (checkoutUrl) parsedCheckout = new URL(checkoutUrl); } catch { parsedCheckout = null; }
  if (!providerResponse.ok || !initialized?.status || initialized.data?.reference !== reference || parsedCheckout?.protocol !== "https:" || parsedCheckout.hostname !== "checkout.paystack.com") {
    return NextResponse.json({ error: "Could not initialize secure checkout. No payment was confirmed." }, { status: 502 });
  }
  return NextResponse.json({ checkoutUrl, reference });
}
