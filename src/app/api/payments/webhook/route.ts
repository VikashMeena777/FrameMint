import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/payments/cashfree';
import { PLANS } from '@/types';

// Use service role for webhook handler (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payments/webhook
 * Cashfree sends payment/order status updates here
 * Signature verified via HMAC-SHA256
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('[webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;

    console.log(`[webhook] Received: ${type}`, payload);

    // Handle payment success event
    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'ORDER_PAID_WEBHOOK') {
      const orderId = data?.order?.order_id;
      const cfPaymentId = data?.payment?.cf_payment_id;

      if (!orderId) {
        console.error('[webhook] Missing order_id in payload');
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
      }

      // Get the order from DB
      const { data: order } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) {
        console.error(`[webhook] Order not found: ${orderId}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Skip if already processed
      if (order.status === 'PAID') {
        return NextResponse.json({ message: 'Already processed' });
      }

      // Upgrade user plan + credits
      const plan = PLANS.find((p) => p.slug === order.plan);
      if (plan) {
        await supabase
          .from('profiles')
          .update({
            tier: order.plan,
            credits_monthly_limit: plan.credits,
            credits_remaining: plan.credits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', order.user_id);

        // Log the transaction
        await supabase.from('credit_transactions').insert({
          user_id: order.user_id,
          amount: plan.credits,
          type: 'purchase',
          description: `Upgraded to ${plan.name} plan — order ${orderId}${cfPaymentId ? `, cf_payment: ${cfPaymentId}` : ''}`,
        });
      }

      // Mark order as PAID
      await supabase
        .from('payment_orders')
        .update({
          status: 'PAID',
          cf_payment_id: cfPaymentId || null,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      console.log(`[webhook] ✅ Order ${orderId} processed — user ${order.user_id} upgraded to ${order.plan}`);
    }

    // Always return 200 so Cashfree doesn't retry
    return NextResponse.json({ message: 'OK' });
  } catch (err) {
    console.error('[webhook] Error:', err);
    // Return 200 to prevent retries for parse errors
    return NextResponse.json({ message: 'Error processed' }, { status: 200 });
  }
}
