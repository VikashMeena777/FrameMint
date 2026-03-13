'use client';

import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to initiate Cashfree checkout for a plan upgrade.
 *
 * Usage:
 *   const { checkout, loading } = useCashfreeCheckout();
 *   <button onClick={() => checkout('pro')} disabled={loading}>Upgrade</button>
 */
export function useCashfreeCheckout() {
  const [loading, setLoading] = useState(false);

  const checkout = async (plan: 'pro' | 'enterprise') => {
    setLoading(true);

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create order');
        return;
      }

      const { paymentSessionId } = data;

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
      setLoading(false);
    }
  };

  return { checkout, loading };
}
