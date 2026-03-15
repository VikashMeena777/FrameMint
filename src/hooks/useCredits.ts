'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CreditBalance } from '@/types';

export function useCredits() {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/user/credits');
      if (!response.ok) {
        // User not authenticated or server error
        setError('Failed to load credits');
        setCredits(null);
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
      setError('Failed to load credits');
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, error, refetch: fetchCredits };
}
