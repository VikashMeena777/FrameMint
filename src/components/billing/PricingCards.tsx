'use client';

import { Check, Sparkles, Loader2, Zap, Building2 } from 'lucide-react';
import { PLANS, type PlanDetails } from '@/types';
import { cn } from '@/lib/utils';
import { useCashfreeCheckout } from '@/hooks/useCashfreeCheckout';
import { useRouter } from 'next/navigation';

interface PricingCardsProps {
  currentPlan?: string;
  compact?: boolean;
}

export function PricingCards({ currentPlan, compact = false }: PricingCardsProps) {
  const { checkout, loadingPlan } = useCashfreeCheckout();
  const router = useRouter();

  const handleUpgrade = (plan: PlanDetails) => {
    if (plan.price === 0) {
      router.push('/create');
      return;
    }
    checkout(plan.slug as 'pro' | 'enterprise');
  };

  return (
    <div className={cn(
      'grid gap-5',
      compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
    )}>
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.slug}
          plan={plan}
          isCurrent={currentPlan === plan.slug}
          compact={compact}
          isLoading={loadingPlan === plan.slug}
          anyLoading={loadingPlan !== null}
          onUpgrade={() => handleUpgrade(plan)}
        />
      ))}
    </div>
  );
}

const planIcons = {
  free: Sparkles,
  pro: Zap,
  enterprise: Building2,
};

function PricingCard({
  plan,
  isCurrent,
  compact,
  isLoading,
  anyLoading,
  onUpgrade,
}: {
  plan: PlanDetails;
  isCurrent: boolean;
  compact: boolean;
  isLoading: boolean;
  anyLoading: boolean;
  onUpgrade: () => void;
}) {
  const Icon = planIcons[plan.slug] || Sparkles;

  return (
    <div
      className={cn(
        'relative rounded-2xl transition-all duration-300 flex flex-col',
        plan.popular
          ? 'border border-violet-400/40 shadow-2xl scale-[1.04] z-10'
          : 'border border-white/7',
        compact ? 'p-5' : 'p-7'
      )}
      style={{
        background: plan.popular
          ? 'linear-gradient(160deg, rgba(124, 58, 237, 0.18) 0%, rgba(37, 99, 235, 0.08) 60%, rgba(124, 58, 237, 0.05) 100%)'
          : 'rgba(12, 12, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: plan.popular
          ? '0 0 0 1px rgba(124, 58, 237, 0.35), 0 0 60px rgba(124, 58, 237, 0.25), 0 0 120px rgba(124, 58, 237, 0.10), 0 20px 60px rgba(0, 0, 0, 0.6)'
          : undefined,
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-5">
        <div className={cn(
          'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl',
          plan.popular
            ? 'gradient-primary shadow-lg'
            : plan.slug === 'enterprise'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg'
              : 'bg-white/8 border border-white/10'
        )}>
          <Icon className={cn('h-5 w-5', plan.popular || plan.slug === 'enterprise' ? 'text-white' : 'text-[var(--fm-text-secondary)]')} />
        </div>
        <h3 className={cn('font-bold text-[var(--fm-text)]', compact ? 'text-lg' : 'text-xl')}>
          {plan.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className={cn('font-bold tracking-tighter', compact ? 'text-3xl' : 'text-4xl', 'stat-number')}>
            {plan.price === 0 ? 'Free' : `₹${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-[var(--fm-text-secondary)]">/month</span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-[var(--fm-text-secondary)]">
          {plan.credits} {plan.credits === 1 ? 'thumbnail' : 'thumbnails'} / month
        </p>
      </div>

      {/* CTA */}
      <button
        className={cn(
          'w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 mb-6',
          plan.popular
            ? 'btn-primary animate-glow-pulse'
            : isCurrent
              ? 'bg-white/5 text-[var(--fm-text-secondary)] cursor-default border border-white/8'
              : 'btn-secondary'
        )}
        disabled={isCurrent || anyLoading}
        onClick={onUpgrade}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isCurrent ? (
          '✓ Current Plan'
        ) : plan.price === 0 ? (
          'Get Started Free'
        ) : (
          `Upgrade to ${plan.name}`
        )}
      </button>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-5" />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              plan.popular ? 'bg-violet-600/20 border border-violet-500/30' : 'bg-white/8 border border-white/10'
            )}>
              <Check className={cn('h-2.5 w-2.5', plan.popular ? 'text-[var(--fm-primary-light)]' : 'text-emerald-400')} />
            </div>
            <span className="text-sm text-[var(--fm-text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
