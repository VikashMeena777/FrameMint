import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getOrderStatus } from '@/lib/payments/cashfree';
import { upgradePlan } from '@/lib/payments/upgrade-plan';

/**
 * GET /api/payments/verify?order_id=FM_PRO_xxx
 * Verifies payment status after Cashfree redirect.
 * Called by the checkout return page.
 *
 * Uses user-scoped client for auth + reading the order,
 * then switches to service-role client for the actual upgrade
 * (required because RLS on payment_orders only allows SELECT).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // --- Auth check with user-scoped client ---
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Read order (user-scoped, RLS allows SELECT) ---
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

    // --- Verify with Cashfree ---
    const cfStatus = await getOrderStatus(orderId);

    if (cfStatus.order_status === 'PAID') {
      // Switch to service-role client for mutations (bypasses RLS)
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Upgrade user plan + credits + mark as PAID
      await upgradePlan(
        supabaseAdmin,
        user.id,
        orderId,
        order.plan,
        cfStatus.cf_payment_id
      );

      return NextResponse.json({
        status: 'PAID',
        plan: order.plan,
        message: 'Payment verified and plan upgraded!',
      });
    }

    // Update non-paid status (also needs admin client)
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin
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
