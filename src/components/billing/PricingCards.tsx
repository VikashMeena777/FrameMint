'use client';

import { Check, Sparkles, Loader2 } from 'lucide-react';
import { PLANS, type PlanDetails } from '@/types';
import { cn } from '@/lib/utils';
import { useCashfreeCheckout } from '@/hooks/useCashfreeCheckout';
import { useRouter } from 'next/navigation';

interface PricingCardsProps {
  currentPlan?: string;
  compact?: boolean;
}

export function PricingCards({ currentPlan, compact = false }: PricingCardsProps) {
  const { checkout, loading } = useCashfreeCheckout();
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
      'grid gap-6',
      compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
    )}>
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.slug}
          plan={plan}
          isCurrent={currentPlan === plan.slug}
          compact={compact}
          loading={loading}
          onUpgrade={() => handleUpgrade(plan)}
        />
      ))}
    </div>
  );
}

function PricingCard({
  plan,
  isCurrent,
  compact,
  loading,
  onUpgrade,
}: {
  plan: PlanDetails;
  isCurrent: boolean;
  compact: boolean;
  loading: boolean;
  onUpgrade: () => void;
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300',
        plan.popular
          ? 'glass-card border-[var(--fm-primary)]/30 gradient-pro animate-glow-pulse'
          : 'glass-card-static',
        compact && 'p-5'
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3
        className={cn(
          'font-bold text-[var(--fm-text)]',
          compact ? 'text-lg' : 'text-xl'
        )}
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn('font-bold text-[var(--fm-text)]', compact ? 'text-3xl' : 'text-4xl')} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {plan.price === 0 ? 'Free' : `₹${plan.price}`}
        </span>
        {plan.price > 0 && (
          <span className="text-sm text-[var(--fm-text-secondary)]">/month</span>
        )}
      </div>

      {/* Credits */}
      <p className="mt-2 text-sm text-[var(--fm-text-secondary)]">
        {plan.credits} thumbnails/month
      </p>

      {/* CTA */}
      <button
        className={cn(
          'mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2',
          plan.popular
            ? 'btn-primary'
            : isCurrent
              ? 'bg-white/5 text-[var(--fm-text-secondary)] cursor-default border border-white/10'
              : 'btn-glass'
        )}
        disabled={isCurrent || loading}
        onClick={onUpgrade}
      >
        {loading && !isCurrent ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isCurrent ? (
          'Current Plan'
        ) : plan.price === 0 ? (
          'Get Started'
        ) : (
          'Upgrade'
        )}
      </button>

      {/* Features */}
      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={cn('h-4 w-4 mt-0.5 shrink-0', plan.popular ? 'text-[var(--fm-primary)]' : 'text-[var(--fm-success)]')} />
            <span className="text-sm text-[var(--fm-text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
