import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { itemId, buyerClerkId } = session.metadata || {};
      console.log(
        `Payment completed: item=${itemId}, buyer=${buyerClerkId}, amount=${session.amount_total}`
      );
      // TODO: Update item status to 'sold' in database
      // TODO: Create order record
      break;
    }
  }

  return Response.json({ received: true });
}
