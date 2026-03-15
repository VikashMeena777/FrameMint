'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CreditBalance } from '@/types';

export function useCredits() {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (!response.ok) {
        // User not authenticated or server error — return defaults
        setCredits({
          remaining: 0,
          total: 0,
          used: 0,
          percentage: 0,
          plan: 'free',
        });
        return;
      }

      const data = await response.json();
      setCredits({
        remaining: data.remaining,
        total: data.total,
        used: data.used,
        percentage: data.percentage,
        plan: data.plan,
      });
    } catch {
      setCredits({
        remaining: 5,
        total: 5,
        used: 0,
        percentage: 0,
        plan: 'free',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetch: fetchCredits };
}
