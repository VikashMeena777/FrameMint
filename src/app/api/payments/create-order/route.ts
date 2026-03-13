import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrder, generateOrderId } from '@/lib/payments/cashfree';
import { PLANS } from '@/types';

/**
 * POST /api/payments/create-order
 * Creates a Cashfree payment order for a plan upgrade
 *
 * Body: { plan: 'pro' | 'enterprise' }
 * Returns: { paymentSessionId, orderId }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan: planSlug } = body;

    // Validate plan
    const plan = PLANS.find((p) => p.slug === planSlug);
    if (!plan || plan.price === 0) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose pro or enterprise.' },
        { status: 400 }
      );
    }

    // Get user profile for phone (optional)
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orderId = generateOrderId(user.id, plan.slug);

    const order = await createOrder({
      orderId,
      orderAmount: plan.price,
      customerName: profile?.display_name || user.user_metadata?.full_name || 'FrameMint User',
      customerEmail: user.email!,
      customerPhone: user.user_metadata?.phone || '9999999999', // fallback for sandbox
      returnUrl: `${appUrl}/settings/billing/checkout?order_id=${orderId}`,
      notifyUrl: `${appUrl}/api/payments/webhook`,
      orderMeta: {
        plan: plan.slug,
        userId: user.id,
      },
    });

    // Store the pending order in DB for reconciliation
    await supabase.from('payment_orders').insert({
      id: orderId,
      cf_order_id: order.cf_order_id,
      user_id: user.id,
      plan: plan.slug,
      amount: plan.price,
      status: 'PENDING',
    });

    return NextResponse.json({
      paymentSessionId: order.payment_session_id,
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
    });
  } catch (err) {
    console.error('[create-order]', err);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
