import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

/**
 * Lemon Squeezy webhook skeleton.
 * Configure LEMONSQUEEZY_WEBHOOK_SECRET in the environment and point Lemon Squeezy
 * at /api/webhook/lemonsqueezy. Signature verification is implemented; event handling
 * (subscription_created / subscription_payment_success / subscription_cancelled) can be
 * extended as needed.
 */
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature =
    req.headers.get("x-signature") ||
    req.headers.get("x-lemonsqueezy-signature") ||
    req.headers.get("signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: { meta?: { event_name?: string }; data?: unknown };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const event = payload.meta?.event_name || "unknown";

  // Extend handling as billing goes live (e.g. mark the subscriber as Pro).
  switch (event) {
    case "subscription_created":
    case "subscription_payment_success":
    case "subscription_cancelled":
      // Acknowledged. Fulfilment logic goes here.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true, event });
}
