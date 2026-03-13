'use client';

import { CreditCard, Sparkles, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreditMeter } from '@/components/billing/CreditMeter';
import { PricingCards } from '@/components/billing/PricingCards';
import { useCredits } from '@/hooks/useCredits';

export default function BillingPage() {
  const { credits, loading } = useCredits();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Billing
      </h1>

      {/* Current plan */}
      <GlassCard hover={false} className="p-6 gradient-pro border-[var(--fm-primary)]/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-[var(--fm-primary)]" />
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Current Plan
              </h2>
            </div>
            <p className="text-2xl font-bold capitalize" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {loading ? (
                <span className="skeleton inline-block h-8 w-20" />
              ) : (
                credits?.plan || 'Free'
              )}{' '}
              Plan
            </p>
          </div>

          <div className="sm:text-right">
            {loading ? (
              <div className="skeleton h-12 w-40" />
            ) : credits ? (
              <CreditMeter
                remaining={credits.remaining}
                total={credits.total}
                size="lg"
              />
            ) : null}
          </div>
        </div>
      </GlassCard>

      {/* Usage */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          This Month's Usage
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-[var(--fm-text-secondary)]">Credits Used</p>
            <p className="text-xl font-bold mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {credits?.used || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--fm-text-secondary)]">Credits Remaining</p>
            <p className="text-xl font-bold mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {credits?.remaining || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--fm-text-secondary)]">Resets On</p>
            <p className="text-xl font-bold mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Upgrade Your Plan
        </h2>
        <PricingCards currentPlan={credits?.plan} compact />
      </div>
    </div>
  );
}
