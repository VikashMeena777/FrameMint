import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrderStatus } from '@/lib/payments/cashfree';
import { PLANS } from '@/types';

/**
 * GET /api/payments/verify?order_id=FM_PRO_xxx
 * Verifies payment status after Cashfree redirect
 * Called by the checkout return page
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check the order belongs to this user
    const { data: order } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If already processed, return cached status
    if (order.status === 'PAID') {
      return NextResponse.json({
        status: 'PAID',
        plan: order.plan,
        message: 'Payment already processed',
      });
    }

    // Verify with Cashfree
    const cfStatus = await getOrderStatus(orderId);

    if (cfStatus.order_status === 'PAID') {
      // Upgrade user plan + credits
      const plan = PLANS.find((p) => p.slug === order.plan);
      if (plan) {
        await supabase
          .from('profiles')
          .update({
            plan: order.plan,
            credits_total: plan.credits,
            credits_remaining: plan.credits,
          })
          .eq('id', user.id);

        // Log the transaction
        await supabase.from('credit_transactions').insert({
          user_id: user.id,
          amount: plan.credits,
          type: 'purchase',
          description: `Upgraded to ${plan.name} plan`,
          metadata: { order_id: orderId, cf_order_id: order.cf_order_id },
        });
      }

      // Mark order as paid
      await supabase
        .from('payment_orders')
        .update({
          status: 'PAID',
          cf_payment_id: cfStatus.cf_payment_id || null,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        status: 'PAID',
        plan: order.plan,
        message: 'Payment verified and plan upgraded!',
      });
    }

    // Update non-paid status
    await supabase
      .from('payment_orders')
      .update({ status: cfStatus.order_status })
      .eq('id', orderId);

    return NextResponse.json({
      status: cfStatus.order_status,
      plan: order.plan,
      message:
        cfStatus.order_status === 'ACTIVE'
          ? 'Payment is still pending...'
          : `Payment status: ${cfStatus.order_status}`,
    });
  } catch (err) {
    console.error('[verify-payment]', err);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
