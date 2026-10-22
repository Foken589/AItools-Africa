export type VerifiedPaystackPayment = {
  id: number;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  domain: "test" | "live";
  customer?: { email?: string };
};

export function paystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY;
}

export async function verifyPaystackPayment(reference: string): Promise<VerifiedPaystackPayment | null> {
  const secret = paystackSecret();
  if (!secret) throw new Error("Paystack is not configured.");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Paystack verification request failed.");
  const payload = await response.json() as { status?: boolean; data?: VerifiedPaystackPayment };
  if (!payload.status || !payload.data) return null;
  const payment = payload.data;
  const expectedDomain = secret.startsWith("sk_test_") ? "test" : secret.startsWith("sk_live_") ? "live" : null;
  if (expectedDomain && payment.domain !== expectedDomain) return null;
  return payment;
}
