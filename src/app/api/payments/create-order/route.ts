import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
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

    // Create Cashfree order
    let order;
    try {
      order = await createOrder({
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
    } catch (cfError) {
      const message = cfError instanceof Error ? cfError.message : 'Unknown Cashfree error';
      console.error('[create-order] Cashfree API failed:', message);
      return NextResponse.json(
        { error: `Payment gateway error: ${message}` },
        { status: 502 }
      );
    }

    // Store the pending order in DB for reconciliation
    // NOTE: Must use service_role client — RLS only allows SELECT for users
    try {
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: dbError } = await supabaseAdmin.from('payment_orders').insert({
        id: orderId,
        cf_order_id: order.cf_order_id,
        user_id: user.id,
        plan: plan.slug,
        amount: plan.price,
        status: 'PENDING',
      });

      if (dbError) {
        console.error('[create-order] DB insert failed (non-fatal):', dbError.message);
      }
    } catch (dbError) {
      // Log but don't fail — order was already created in Cashfree
      console.error('[create-order] DB insert exception (non-fatal):', dbError);
    }

    return NextResponse.json({
      paymentSessionId: order.payment_session_id,
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
    });
  } catch (err) {
    console.error('[create-order] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
