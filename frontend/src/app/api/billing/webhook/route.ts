import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackPayment } from "@/lib/billing/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("x-paystack-signature") ?? "";
  let rawBody: string;
  try {
    rawBody = await request.text();
    if (rawBody.length > 1_000_000) return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  } catch { return NextResponse.json({ error: "Invalid payload." }, { status: 400 }); }

  const expected = createHmac("sha512", secret).update(rawBody).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "hex"); } catch { return NextResponse.json({ error: "Invalid signature." }, { status: 401 }); }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });

  let event: { event?: string; data?: { reference?: string; transaction_reference?: string; refund_reference?: string | null; status?: string; id?: number; amount?: number | string; currency?: string; paid_at?: string | null } };
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (event.event === "refund.processed") {
    const reference = event.data?.transaction_reference;
    const amount = Number(event.data?.amount);
    if (!reference || !/^[A-Za-z0-9.=\-]{8,100}$/.test(reference) || !Number.isSafeInteger(amount) || amount <= 0 || !event.data?.currency) {
      return NextResponse.json({ error: "Invalid refund event." }, { status: 400 });
    }
    try {
      const verified = await verifyPaystackPayment(reference);
      if (!verified || verified.reference !== reference || verified.status !== "reversed" || verified.currency !== event.data.currency) {
        return NextResponse.json({ error: "Refund reversal is not verified yet." }, { status: 503 });
      }
      const admin = createAdminClient();
      const { data: payment, error: paymentError } = await admin.from("aitools_payments").select("amount_kobo").eq("reference", reference).maybeSingle();
      if (paymentError || !payment) return NextResponse.json({ error: "Refund payment was not found; retry after billing is available." }, { status: 503 });
      if (amount < payment.amount_kobo) {
        // Partial refunds require an operator decision about proportional credit reversal.
        return NextResponse.json({ received: true, reconciliation: "partial_refund_requires_review" });
      }
      const eventKey = `refund.processed:${event.data.refund_reference ?? `${reference}:${amount}`}`;
      const { error } = await admin.rpc("aitools_reverse_payment", {
        p_reference: reference,
        p_refunded_amount: amount,
        p_currency: event.data.currency,
        p_event_key: eventKey,
        p_event_type: "refund.processed",
      });
      if (error) return NextResponse.json({ error: "Refund reconciliation failed and will be retried." }, { status: 503 });
      return NextResponse.json({ received: true });
    } catch { return NextResponse.json({ error: "Refund reconciliation is temporarily unavailable." }, { status: 503 }); }
  }
  if (event.event !== "charge.success") return NextResponse.json({ received: true });
  const reference = event.data?.reference;
  if (!reference || !/^[A-Za-z0-9.=\-]{8,100}$/.test(reference)) return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });

  try {
    // A valid signature proves the sender; server-side verification additionally
    // checks Paystack's current amount, currency, status, and environment.
    const verified = await verifyPaystackPayment(reference);
    if (!verified || verified.status !== "success" || verified.reference !== reference) {
      return NextResponse.json({ error: "Payment is not verified." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data: checkout, error: checkoutError } = await admin.from("aitools_payments").select("payer_email").eq("reference", reference).maybeSingle();
    if (checkoutError || !checkout) return NextResponse.json({ error: "Payment record is unavailable; retry later." }, { status: 503 });
    if (verified.customer?.email?.toLowerCase() !== checkout.payer_email.toLowerCase()) {
      return NextResponse.json({ error: "Verified customer does not match checkout." }, { status: 400 });
    }
    const { error } = await admin.rpc("aitools_complete_payment", {
      p_reference: reference,
      p_provider_transaction_id: reference,
      p_amount_kobo: verified.amount,
      p_currency: verified.currency,
      p_paid_at: verified.paid_at ?? new Date().toISOString(),
      p_event_key: `charge.success:${reference}`,
      p_event_type: "charge.success",
    });
    if (error) return NextResponse.json({ error: "Payment delivery failed and will be retried." }, { status: 503 });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Payment verification is temporarily unavailable." }, { status: 503 });
  }
}
