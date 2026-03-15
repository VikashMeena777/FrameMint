'use client';

import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to initiate Cashfree checkout for a plan upgrade.
 * Returns loadingPlan (slug of plan being processed) instead of generic boolean.
 *
 * Usage:
 *   const { checkout, loadingPlan } = useCashfreeCheckout();
 *   <button onClick={() => checkout('pro')} disabled={loadingPlan === 'pro'}>Upgrade</button>
 */
export function useCashfreeCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const checkout = async (plan: 'pro' | 'enterprise') => {
    setLoadingPlan(plan);

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Failed to create order';
        console.error('[checkout] API error:', errorMsg, data);
        toast.error(errorMsg);
        return;
      }

      const { paymentSessionId } = data;

      if (!paymentSessionId) {
        toast.error('No payment session received. Please try again.');
        return;
      }

      // 2. Load Cashfree SDK and open checkout
      const cfEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';

      // Dynamically load Cashfree SDK
      const { load } = await import('@cashfreepayments/cashfree-js');
      const cashfree = await load({ mode: cfEnv as 'sandbox' | 'production' });

      // 3. Open checkout in redirect mode
      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self', // redirect in same tab
      });

      // This runs if checkout closes without redirect (e.g. user cancels in popup mode)
      if (result?.error) {
        toast.error(result.error.message || 'Payment was cancelled');
      }
    } catch (err) {
      console.error('[checkout]', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return { checkout, loadingPlan };
}
