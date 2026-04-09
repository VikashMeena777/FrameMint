import { SupabaseClient } from '@supabase/supabase-js';
import { PLANS } from '@/types';

/**
 * Shared plan upgrade logic used by both webhook and verify endpoints.
 * Upgrades user profile, logs credit transaction, and marks order as PAID.
 *
 * IMPORTANT: The `supabase` client MUST be a service-role client,
 * because RLS on `payment_orders` only allows SELECT for users.
 *
 * Returns true if upgrade was applied, false if plan was not found.
 */
export async function upgradePlan(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  planSlug: string,
  cfPaymentId?: string | null
): Promise<boolean> {
  const plan = PLANS.find((p) => p.slug === planSlug);
  if (!plan) {
    console.error(`[upgrade-plan] Unknown plan slug: ${planSlug}`);
    return false;
  }

  // 1. Mark order as PAID first (idempotency guard — if this succeeds but later
  //    steps fail, the retry will see status=PAID and skip via the early return)
  const { error: orderErr } = await supabase
    .from('payment_orders')
    .update({
      status: 'PAID',
      cf_payment_id: cfPaymentId || null,
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (orderErr) {
    console.error(`[upgrade-plan] Failed to mark order ${orderId} as PAID:`, orderErr);
  }

  // 2. Upgrade user profile — `tier` is the plan column in the DB
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      tier: planSlug,
      credits_monthly_limit: plan.credits,
      credits_remaining: plan.credits,              // Full refill on plan upgrade (user paid for new tier)
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (profileErr) {
    console.error(`[upgrade-plan] Failed to upgrade profile for user ${userId}:`, profileErr);
    throw new Error(`Profile upgrade failed: ${profileErr.message}`);
  }

  // 3. Log credit transaction
  const { error: txErr } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: plan.credits,
    type: 'purchase',
    description: `Upgraded to ${plan.name} plan — order ${orderId}${cfPaymentId ? `, cf_payment: ${cfPaymentId}` : ''}`,
  });

  if (txErr) {
    console.error(`[upgrade-plan] Failed to log credit transaction:`, txErr);
    // Non-fatal — don't throw, the upgrade itself succeeded
  }

  console.log(`[upgrade-plan] ✅ User ${userId} upgraded to ${planSlug} (${plan.credits} credits)`);
  return true;
}
