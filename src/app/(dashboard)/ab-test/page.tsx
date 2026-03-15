'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  BarChart3,
  Copy,
  Check,
  Trash2,
  Eye,
  MousePointerClick,
  Loader2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

/* ---------- types from the list API ---------- */

interface ABVariantAPI {
  id: string;
  image_url: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface ABTestAPI {
  id: string;
  status: string;
  variantA: ABVariantAPI;
  variantB: ABVariantAPI;
  winner: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function ABTestPage() {
  const [tests, setTests] = useState<ABTestAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------- fetch list ---------- */

  const fetchTests = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/ab-test/list');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTests(data.tests ?? []);
    } catch {
      setError('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  /* ---------- delete ---------- */

  const handleDelete = async (testId: string) => {
    setDeletingId(testId);
    try {
      const res = await fetch(`/api/ab-test/${testId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTests((prev) => prev.filter((t) => t.id !== testId));
    } catch {
      setError('Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- helpers ---------- */

  const copyShareLink = (testId: string, variant: 'a' | 'b') => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/t/${testId}?v=${variant}`;
    navigator.clipboard.writeText(url);
    setCopiedId(`${testId}-${variant}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fmtCTR = (ctr: number) => (ctr * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--fm-text)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <FlaskConical className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
            A/B Testing
          </h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            Compare thumbnails side-by-side, share variants, and track click-through rates
          </p>
        </div>
        {/* Creating tests is done from the editor page — button links there */}
        <a
          href="/gallery"
          className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Test
        </a>
      </div>

      {/* Loading state */}
      {loading && (
        <GlassCard hover={false} className="p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-[var(--fm-primary)] animate-spin" />
          <p className="text-sm text-[var(--fm-text-secondary)] mt-3">Loading tests…</p>
        </GlassCard>
      )}

      {/* Error state */}
      {error && !loading && (
        <GlassCard hover={false} className="p-5 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={fetchTests} className="text-xs text-[var(--fm-primary)] mt-2 hover:underline">
            Try again
          </button>
        </GlassCard>
      )}

      {/* Empty state */}
      {!loading && !error && tests.length === 0 && (
        <GlassCard hover={false} className="p-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-[var(--fm-text-secondary)]/30" />
          <p className="text-[var(--fm-text-secondary)] mt-4">No A/B tests yet</p>
          <p className="text-sm text-[var(--fm-text-secondary)]/60 mt-1">
            Go to a thumbnail in your gallery, then create a test from two variants
          </p>
        </GlassCard>
      )}

      {/* Test list */}
      {!loading && tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test) => {
            const variants: { key: 'a' | 'b'; data: ABVariantAPI; label: string }[] = [
              { key: 'a', data: test.variantA, label: 'Variant A' },
              { key: 'b', data: test.variantB, label: 'Variant B' },
            ];

            return (
              <GlassCard key={test.id} hover={false} className="p-5">
                {/* Test header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="font-semibold text-[var(--fm-text)]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      A/B Test
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          test.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : test.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-white/5 text-[var(--fm-text-secondary)]'
                        )}
                      >
                        {test.status}
                      </span>
                      <span className="text-xs text-[var(--fm-text-secondary)]">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(test.id)}
                    disabled={deletingId === test.id}
                    className="text-[var(--fm-text-secondary)] hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                    title="Delete test"
                  >
                    {deletingId === test.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Variants grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variants.map((v) => {
                    const isWinner = test.winner === v.data.id;

                    return (
                      <div
                        key={v.key}
                        className={cn(
                          'rounded-xl border p-4 transition-all',
                          isWinner && test.status === 'completed'
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-white/10 bg-white/2'
                        )}
                      >
                        {/* Image */}
                        <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                          {v.data.image_url ? (
                            <img
                              src={v.data.image_url}
                              alt={v.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <BarChart3 className="h-8 w-8 text-[var(--fm-text-secondary)]/20 mx-auto" />
                              <p className="text-xs text-[var(--fm-text-secondary)]/40 mt-1">
                                No image
                              </p>
                            </div>
                          )}

                          {/* Winner badge */}
                          {isWinner && test.status === 'completed' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Winner
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <p className="text-sm font-medium text-[var(--fm-text)] mb-2">
                          {v.label}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/5 rounded-lg p-2">
                            <Eye className="h-3 w-3 mx-auto text-[var(--fm-text-secondary)] mb-1" />
                            <p className="text-sm font-semibold text-[var(--fm-text)]">
                              {v.data.impressions.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[var(--fm-text-secondary)]">Views</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <MousePointerClick className="h-3 w-3 mx-auto text-[var(--fm-text-secondary)] mb-1" />
                            <p className="text-sm font-semibold text-[var(--fm-text)]">
                              {v.data.clicks.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[var(--fm-text-secondary)]">Clicks</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <BarChart3 className="h-3 w-3 mx-auto text-[var(--fm-primary)] mb-1" />
                            <p className="text-sm font-semibold text-[var(--fm-primary)]">
                              {fmtCTR(v.data.ctr)}%
                            </p>
                            <p className="text-[10px] text-[var(--fm-text-secondary)]">CTR</p>
                          </div>
                        </div>

                        {/* Share link */}
                        <button
                          onClick={() => copyShareLink(test.id, v.key)}
                          className="mt-3 w-full btn-glass px-3 py-2 rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                        >
                          {copiedId === `${test.id}-${v.key}` ? (
                            <>
                              <Check className="h-3 w-3 text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy Share Link
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
