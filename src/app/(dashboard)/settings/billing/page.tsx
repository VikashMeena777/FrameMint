'use client';

import { CreditCard, Sparkles, Zap, TrendingUp, Calendar } from 'lucide-react';
import { CreditMeter } from '@/components/billing/CreditMeter';
import { PricingCards } from '@/components/billing/PricingCards';
import { useCredits } from '@/hooks/useCredits';

export default function BillingPage() {
  const { credits, loading } = useCredits();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--fm-text)]">Billing & Credits</h1>
        <p className="text-sm text-[var(--fm-text-secondary)] mt-0.5">Manage your subscription and monitor credit usage</p>
      </div>

      {/* Current plan */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)' }}>
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <CreditCard className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <span className="text-sm font-semibold text-[var(--fm-text-secondary)] uppercase tracking-wider">Current Plan</span>
            </div>
            {loading ? (
              <div className="skeleton h-9 w-32 rounded-lg" />
            ) : (
              <div>
                <p className="text-3xl font-bold stat-number capitalize">{credits?.plan || 'Free'}</p>
                <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
                  {credits?.plan === 'pro' ? '100 thumbnails/month' : credits?.plan === 'enterprise' ? '500 thumbnails/month' : '5 thumbnails/month'}
                </p>
              </div>
            )}
          </div>

          <div className="sm:text-right">
            {loading ? (
              <div className="skeleton h-16 w-48 rounded-xl" />
            ) : credits ? (
              <CreditMeter remaining={credits.remaining} total={credits.total} size="lg" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)] mb-5">This Month&apos;s Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Credits Used',
              value: credits?.used ?? 0,
              icon: Zap,
              color: 'from-violet-500 to-purple-600',
              glow: 'rgba(124,58,237,0.25)',
            },
            {
              label: 'Credits Remaining',
              value: credits?.remaining ?? 0,
              icon: TrendingUp,
              color: 'from-emerald-500 to-teal-600',
              glow: 'rgba(16,185,129,0.25)',
            },
            {
              label: 'Resets On',
              value: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              icon: Calendar,
              color: 'from-blue-500 to-cyan-600',
              glow: 'rgba(37,99,235,0.25)',
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                style={{ boxShadow: `0 6px 16px ${stat.glow}` }}>
                <stat.icon className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <div>
                <p className="text-xl font-bold stat-number leading-none">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-[var(--fm-text-secondary)] mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <Sparkles className="h-4.5 w-4.5 text-[var(--fm-primary-light)]" style={{ width: '1.125rem', height: '1.125rem' }} />
          <h2 className="text-base font-semibold text-[var(--fm-text)]">
            {credits?.plan === 'enterprise' ? 'Your Plan' : 'Upgrade Your Plan'}
          </h2>
          {credits?.plan === 'enterprise' && (
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
              Top Tier ✓
            </span>
          )}
        </div>
        <PricingCards currentPlan={credits?.plan} compact />
      </div>
    </div>
  );
}
