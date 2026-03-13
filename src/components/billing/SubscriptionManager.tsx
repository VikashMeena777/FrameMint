'use client';

import { CreditCard, Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCredits } from '@/hooks/useCredits';
import { useCashfreeCheckout } from '@/hooks/useCashfreeCheckout';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 5,
    features: ['5 thumbnails/month', 'Basic styles', 'Watermark'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    credits: 100,
    features: ['100 thumbnails/month', 'All styles', 'No watermark', 'A/B testing'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    credits: -1,
    features: ['Unlimited thumbnails', 'Priority generation', 'API access', 'Team collaboration'],
  },
];

export function SubscriptionManager() {
  const { credits } = useCredits();
  const { checkout, loading } = useCashfreeCheckout();

  const activePlan = credits?.plan || 'free';
  const currentPlan = plans.find((p) => p.id === activePlan) || plans[0];

  const handleUpgrade = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    if (!target || target.price === 0) return;
    if (planId === 'pro' || planId === 'enterprise') {
      checkout(planId);
    }
  };

  return (
    <GlassCard hover={false} className="p-6">
      <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <CreditCard className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
        Subscription
      </h2>
      <p className="text-xs text-[var(--fm-text-secondary)] mb-4">
        Manage your plan and credits
      </p>

      {/* Current plan summary */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--fm-text)]">
              Current Plan: <span className="capitalize text-[var(--fm-primary-light)]">{currentPlan.name}</span>
            </p>
            {credits && (
              <p className="text-xs text-[var(--fm-text-secondary)] mt-1">
                <Sparkles className="inline h-3.5 w-3.5 mr-1 text-[var(--fm-primary)]" />
                {credits.remaining} / {credits.total} credits remaining this month
              </p>
            )}
          </div>
          {currentPlan.id !== 'enterprise' && (
            <span className="text-xs text-[var(--fm-text-secondary)]">
              Resets monthly
            </span>
          )}
        </div>

        {/* Credit usage bar */}
        {credits && credits.total > 0 && (
          <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${Math.min((credits.remaining / credits.total) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((p) => {
          const isCurrent = p.id === currentPlan.id;

          return (
            <div
              key={p.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                p.popular
                  ? 'border-[var(--fm-primary)]/30 bg-[var(--fm-primary)]/5'
                  : 'border-white/5 bg-white/[0.02]',
                isCurrent && 'ring-1 ring-[var(--fm-primary)]/20'
              )}
            >
              {p.popular && (
                <span className="text-[10px] font-semibold text-[var(--fm-primary-light)] uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <p className="text-sm font-semibold text-[var(--fm-text)] mt-1">{p.name}</p>
              <p className="text-xl font-bold text-[var(--fm-text)] mt-1">
                {p.price === 0 ? 'Free' : `₹${p.price}`}
                {p.price > 0 && <span className="text-xs text-[var(--fm-text-secondary)] font-normal">/mo</span>}
              </p>

              <ul className="mt-3 space-y-1">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-[var(--fm-text-secondary)] flex items-start gap-1.5">
                    <span className="text-[var(--fm-primary)] mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrent || p.price === 0 || loading}
                className={cn(
                  'w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                  isCurrent
                    ? 'bg-white/5 text-[var(--fm-text-secondary)] cursor-default'
                    : p.popular
                    ? 'btn-primary'
                    : 'btn-glass'
                )}
              >
                {isCurrent ? (
                  'Current Plan'
                ) : loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
