'use client';

import { BarChart3, Trophy, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ABTestStats {
  testId: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variantA: {
    imageUrl: string;
    impressions: number;
    clicks: number;
  };
  variantB: {
    imageUrl: string;
    impressions: number;
    clicks: number;
  };
  winner: 'A' | 'B' | null;
  startedAt: string;
  endedAt?: string;
}

interface ABTestDashboardProps {
  test: ABTestStats;
  onEnd?: () => void;
}

function calcCTR(clicks: number, impressions: number): string {
  if (impressions === 0) return '0.0%';
  return ((clicks / impressions) * 100).toFixed(1) + '%';
}

export function ABTestDashboard({ test, onEnd }: ABTestDashboardProps) {
  const ctrA = (test.variantA.clicks / Math.max(test.variantA.impressions, 1)) * 100;
  const ctrB = (test.variantB.clicks / Math.max(test.variantB.impressions, 1)) * 100;
  const maxCTR = Math.max(ctrA, ctrB, 0.1);

  return (
    <GlassCard hover={false} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <BarChart3 className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
          {test.name}
        </h2>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            test.status === 'running' && 'bg-green-500/10 text-green-400',
            test.status === 'completed' && 'bg-blue-500/10 text-blue-400',
            test.status === 'paused' && 'bg-amber-500/10 text-amber-400'
          )}
        >
          {test.status}
        </span>
      </div>

      {/* Variants side by side */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {(['A', 'B'] as const).map((label) => {
          const v = label === 'A' ? test.variantA : test.variantB;
          const ctr = label === 'A' ? ctrA : ctrB;
          const isWinner = test.winner === label;

          return (
            <div key={label} className="space-y-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.imageUrl}
                  alt={`Variant ${label}`}
                  className={cn(
                    'w-full rounded-xl border',
                    isWinner ? 'border-[var(--fm-primary)]' : 'border-white/5'
                  )}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs font-bold text-white">
                  {label}
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--fm-primary)] text-[10px] font-bold text-white">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-[var(--fm-text-secondary)]">
                    <Eye className="h-3.5 w-3.5" /> Impressions
                  </span>
                  <span className="font-medium text-[var(--fm-text)]">
                    {v.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-[var(--fm-text-secondary)]">
                    <MousePointer className="h-3.5 w-3.5" /> Clicks
                  </span>
                  <span className="font-medium text-[var(--fm-text)]">
                    {v.clicks.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-[var(--fm-text-secondary)]">
                    <TrendingUp className="h-3.5 w-3.5" /> CTR
                  </span>
                  <span className="font-semibold text-[var(--fm-primary-light)]">
                    {calcCTR(v.clicks, v.impressions)}
                  </span>
                </div>

                {/* CTR bar */}
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isWinner ? 'gradient-primary' : 'bg-white/20'
                    )}
                    style={{ width: `${(ctr / maxCTR) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {test.status === 'running' && onEnd && (
        <button onClick={onEnd} className="btn-glass w-full text-sm">
          End Test &amp; Declare Winner
        </button>
      )}
    </GlassCard>
  );
}
