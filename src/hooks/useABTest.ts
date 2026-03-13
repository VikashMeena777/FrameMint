'use client';

import { useState, useCallback } from 'react';

/* ---------- types ---------- */

interface ABTestRecord {
  id: string;
  thumbnail_id: string;
  name: string;
  variant_a_id: string;
  variant_b_id: string;
  status: 'running' | 'completed' | 'paused';
  impressions_a: number;
  impressions_b: number;
  clicks_a: number;
  clicks_b: number;
  winner: string | null;
  started_at: string;
  ended_at: string | null;
}

/* ---------- hook ---------- */

export function useABTest(thumbnailId?: string) {
  const [tests, setTests] = useState<ABTestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all A/B tests for a thumbnail
   */
  const fetchTests = useCallback(async (id?: string) => {
    const tid = id || thumbnailId;
    if (!tid) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ab-tests?thumbnailId=${tid}`);
      if (!res.ok) throw new Error('Failed to fetch tests');
      const data = await res.json();
      setTests(data.tests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [thumbnailId]);

  /**
   * Create a new A/B test
   */
  const createTest = useCallback(async (
    thumbId: string,
    name: string,
    variantAId: string,
    variantBId: string
  ): Promise<string | null> => {
    setError(null);
    try {
      const res = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbnailId: thumbId,
          name,
          variantAId,
          variantBId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create test');
      }

      const data = await res.json();
      // Refresh list
      await fetchTests(thumbId);
      return data.testId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [fetchTests]);

  /**
   * Record an impression (view) for a variant
   */
  const recordImpression = useCallback(async (testId: string, variant: 'a' | 'b') => {
    try {
      await fetch(`/api/ab-tests/${testId}/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant }),
      });
    } catch {
      // Silently fail — impressions are fire-and-forget
    }
  }, []);

  /**
   * Record a click for a variant
   */
  const recordClick = useCallback(async (testId: string, variant: 'a' | 'b') => {
    try {
      await fetch(`/api/ab-tests/${testId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant }),
      });
    } catch {
      // Silently fail
    }
  }, []);

  /**
   * End a test and determine the winner
   */
  const endTest = useCallback(async (testId: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`/api/ab-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!res.ok) throw new Error('Failed to end test');
      await fetchTests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [fetchTests]);

  /**
   * Delete a test
   */
  const deleteTest = useCallback(async (testId: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`/api/ab-tests/${testId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete test');
      setTests((prev) => prev.filter((t) => t.id !== testId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  return {
    tests,
    isLoading,
    error,
    fetchTests,
    createTest,
    recordImpression,
    recordClick,
    endTest,
    deleteTest,
  };
}
