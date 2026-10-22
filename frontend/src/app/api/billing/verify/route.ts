import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyPaystackPayment } from "@/lib/billing/paystack";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to verify this checkout." }, { status: 401 });

  const reference = request.nextUrl.searchParams.get("reference") ?? "";
  if (!/^[A-Za-z0-9.=\-]{8,100}$/.test(reference)) return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
  const { data: ownPayment, error: lookupError } = await supabase.rpc("aitools_get_my_payment", { p_reference: reference });
  const payment = Array.isArray(ownPayment) ? ownPayment[0] : ownPayment;
  if (lookupError || !payment) return NextResponse.json({ error: "This payment could not be found for your account." }, { status: 404 });
  if (payment.status === "success") return NextResponse.json({ status: "success", credits: payment.credits });
  if (payment.status === "reversed" || payment.status === "failed") return NextResponse.json({ status: payment.status, error: "This payment was not completed." });

  let verified;
  try { verified = await verifyPaystackPayment(reference); }
  catch { return NextResponse.json({ error: "Payment verification is temporarily unavailable. Try again shortly." }, { status: 502 }); }
  if (!verified || verified.reference !== reference) return NextResponse.json({ error: "Payment verification did not match this checkout." }, { status: 400 });
  if (verified.status !== "success") return NextResponse.json({ status: verified.status, message: "Payment is not complete yet. No credits have been added." }, { status: 202 });
  const { data: checkout, error: checkoutError } = await supabase.from("aitools_payments").select("payer_email").eq("reference", reference).maybeSingle();
  if (checkoutError || !checkout || verified.amount !== payment.amount_kobo || verified.currency !== payment.currency || verified.customer?.email?.toLowerCase() !== checkout.payer_email.toLowerCase()) {
    return NextResponse.json({ error: "Verified payment details do not match the expected amount and currency." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: balance, error: completeError } = await admin.rpc("aitools_complete_payment", {
    p_reference: reference,
    // The unique app-generated reference is exact and stable; Paystack IDs are
    // uint64 and can exceed JavaScript's safe integer range.
    p_provider_transaction_id: reference,
    p_amount_kobo: verified.amount,
    p_currency: verified.currency,
    p_paid_at: verified.paid_at ?? new Date().toISOString(),
    p_event_key: null,
    p_event_type: "verify",
  });
  if (completeError || balance === null) return NextResponse.json({ error: "Payment was verified but credit delivery is pending. It will be retried safely." }, { status: 503 });
  return NextResponse.json({ status: "success", credits: payment.credits, balance });
}
