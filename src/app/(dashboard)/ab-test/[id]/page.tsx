'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  FlaskConical,
  ArrowLeft,
  Eye,
  MousePointerClick,
  BarChart3,
  TrendingUp,
  Copy,
  Check,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface VariantDetail {
  id: string;
  image_url: string;
  width: number;
  height: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface ABTestResult {
  id: string;
  status: string;
  variantA: VariantDetail;
  variantB: VariantDetail;
  winner: 'a' | 'b' | null;
  confidence: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt: string | null;
}

export default function ABTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [testId, setTestId] = useState<string | null>(null);
  const [test, setTest] = useState<ABTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTestId(p.id));
  }, [params]);

  const fetchTest = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ab-test/${testId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('A/B test not found');
        } else {
          throw new Error('Failed to fetch');
        }
        return;
      }
      const data = await res.json();
      setTest(data);
    } catch {
      setError('Failed to load A/B test results');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Auto-refresh while active
  useEffect(() => {
    if (test?.status !== 'active') return;
    const interval = setInterval(fetchTest, 15_000); // every 15s
    return () => clearInterval(interval);
  }, [test?.status, fetchTest]);

  const copyLink = (variant: 'a' | 'b') => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/t/${testId}?v=${variant}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(variant);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--fm-primary)]" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <GlassCard hover={false} className="p-12 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-red-400 mb-3" />
        <p className="text-[var(--fm-text-secondary)]">
          {error || 'Test not found'}
        </p>
        <button
          onClick={() => router.push('/ab-test')}
          className="btn-primary mt-4 px-4 py-2 rounded-xl text-sm"
        >
          Back to A/B Tests
        </button>
      </GlassCard>
    );
  }

  const confBadgeColor = {
    low: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const renderVariantCard = (
    variant: VariantDetail,
    label: 'A' | 'B',
    isWinner: boolean
  ) => (
    <GlassCard
      hover={false}
      className={cn(
        'p-5 transition-all',
        isWinner && 'ring-2 ring-green-500/30'
      )}
    >
      {/* Image */}
      <div className="aspect-video bg-white/5 rounded-xl overflow-hidden relative mb-4">
        {variant.image_url ? (
          <img
            src={variant.image_url}
            alt={`Variant ${label}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BarChart3 className="h-12 w-12 text-white/10" />
          </div>
        )}
        {isWinner && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Winner
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-white">
          Variant {label}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Eye className="h-4 w-4 mx-auto text-[var(--fm-text-secondary)] mb-1" />
          <p className="text-lg font-bold text-[var(--fm-text)]">
            {variant.impressions.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--fm-text-secondary)]">Impressions</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <MousePointerClick className="h-4 w-4 mx-auto text-[var(--fm-text-secondary)] mb-1" />
          <p className="text-lg font-bold text-[var(--fm-text)]">
            {variant.clicks.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--fm-text-secondary)]">Clicks</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto text-[var(--fm-primary)] mb-1" />
          <p className="text-lg font-bold text-[var(--fm-primary)]">
            {variant.ctr.toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--fm-text-secondary)]">CTR</p>
        </div>
      </div>

      {/* Share link */}
      <button
        onClick={() => copyLink(label.toLowerCase() as 'a' | 'b')}
        className="mt-3 w-full btn-glass px-3 py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-1.5"
      >
        {copiedLink === label.toLowerCase() ? (
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
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/ab-test')}
          className="btn-glass p-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1
            className="text-2xl font-bold text-[var(--fm-text)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <FlaskConical className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
            A/B Test Results
          </h1>
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
              Started {new Date(test.createdAt).toLocaleDateString()}
            </span>
            {test.confidence && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium border',
                  confBadgeColor[test.confidence]
                )}
              >
                {test.confidence} confidence
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderVariantCard(test.variantA, 'A', test.winner === 'a')}
        {renderVariantCard(test.variantB, 'B', test.winner === 'b')}
      </div>

      {/* Analysis summary */}
      <GlassCard hover={false} className="p-5">
        <h3
          className="text-sm font-semibold text-[var(--fm-text)] mb-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Analysis
        </h3>
        {test.winner ? (
          <p className="text-sm text-[var(--fm-text-secondary)]">
            <span className="text-green-400 font-semibold">
              Variant {test.winner.toUpperCase()}
            </span>{' '}
            is the winner with{' '}
            <span className="font-semibold text-[var(--fm-text)]">
              {test.winner === 'a'
                ? test.variantA.ctr.toFixed(1)
                : test.variantB.ctr.toFixed(1)}
              %
            </span>{' '}
            CTR ({test.confidence} confidence). Use this thumbnail for your
            content.
          </p>
        ) : (
          <p className="text-sm text-[var(--fm-text-secondary)]">
            Not enough data to determine a winner yet. Share both links and
            collect more clicks. At least ~100 impressions per variant is
            recommended.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
