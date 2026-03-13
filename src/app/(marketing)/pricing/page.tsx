'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ---------- data ---------- */

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out FrameMint',
    price: 0,
    period: '',
    credits: 5,
    cta: 'Get Started',
    features: [
      '5 thumbnails per month',
      'Basic styles (Cinematic, Minimal)',
      'Standard resolution (720p)',
      'FrameMint watermark',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious content creators',
    price: 499,
    period: '/mo',
    credits: 100,
    cta: 'Start Pro Trial',
    popular: true,
    features: [
      '100 thumbnails per month',
      'All 8 thumbnail styles',
      'Full HD resolution (1080p+)',
      'No watermark',
      'A/B testing',
      'Video frame extraction',
      'Google Drive backup',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and agencies',
    price: 1999,
    period: '/mo',
    credits: -1,
    cta: 'Contact Sales',
    features: [
      'Unlimited thumbnails',
      'All Pro features',
      'Priority AI generation',
      'REST API access',
      'Team collaboration (5 seats)',
      'Custom brand styles',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

const faqs = [
  {
    q: 'What counts as a credit?',
    a: 'One credit generates one batch of 4 thumbnail variants from your prompt. You can download all 4 variants from a single credit.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes! Plan changes take effect immediately. Upgrades are pro-rated and downgrades apply from the next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major payment methods through Cashfree — UPI, credit/debit cards, net banking, and popular wallets.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Credits reset at the start of each billing cycle and do not roll over. Use them or lose them!',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes! Start your Pro trial with 10 bonus credits. No credit card required to begin.',
  },
  {
    q: 'What is A/B testing?',
    a: 'A/B testing lets you compare two thumbnail variants to see which one gets more clicks. Available on Pro and Enterprise plans.',
  },
];

const comparison = [
  { feature: 'Monthly Thumbnails', free: '5', pro: '100', enterprise: 'Unlimited' },
  { feature: 'Thumbnail Styles', free: '2 basic', pro: 'All 8', enterprise: 'All 8 + custom' },
  { feature: 'Resolution', free: '720p', pro: '1080p+', enterprise: '4K' },
  { feature: 'Watermark', free: 'Yes', pro: 'No', enterprise: 'No' },
  { feature: 'A/B Testing', free: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Video Frame Extraction', free: '—', pro: '✓', enterprise: '✓' },
  { feature: 'API Access', free: '—', pro: '—', enterprise: '✓' },
  { feature: 'Team Seats', free: '1', pro: '1', enterprise: '5' },
  { feature: 'Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated manager' },
];

/* ---------- component ---------- */

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Simple pricing,{' '}
          <span className="bg-gradient-to-r from-[var(--fm-primary)] to-[var(--fm-secondary)] bg-clip-text text-transparent">
            powerful thumbnails
          </span>
        </h1>
        <p className="text-lg text-[var(--fm-text-secondary)]">
          Start free, upgrade when you&apos;re ready. No surprises, no hidden fees.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard
              hover
              className={cn(
                'p-6 sm:p-8 h-full flex flex-col',
                plan.popular && 'border-[var(--fm-primary)]/30 relative'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="text-xl font-bold text-[var(--fm-text)]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-[var(--fm-text-secondary)] mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[var(--fm-text)]">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </span>
                {plan.period && (
                  <span className="text-sm text-[var(--fm-text-secondary)]">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--fm-text)]">
                    <Check className="h-4 w-4 text-[var(--fm-primary)] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === 0 ? '/create' : '/settings/billing'}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-glass'
                )}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: Zap,
            title: 'Instant generation',
            description: 'Thumbnails ready in 30-60 seconds',
          },
          {
            icon: Shield,
            title: 'Secure payments',
            description: 'PCI-compliant via Cashfree',
          },
          {
            icon: Users,
            title: 'Trusted by creators',
            description: 'Thousands of thumbnails generated',
          },
        ].map(({ icon: Icon, title, description }) => (
          <GlassCard key={title} hover={false} className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fm-text)]">{title}</p>
              <p className="text-xs text-[var(--fm-text-secondary)]">{description}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Feature comparison table */}
      <div>
        <h2
          className="text-2xl font-bold text-center mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <Sparkles className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
          Compare Plans
        </h2>
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 font-medium text-[var(--fm-text-secondary)]">Feature</th>
                  <th className="text-center p-4 font-semibold text-[var(--fm-text)]">Free</th>
                  <th className="text-center p-4 font-semibold text-[var(--fm-primary-light)]">Pro</th>
                  <th className="text-center p-4 font-semibold text-[var(--fm-text)]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-white/[0.03]">
                    <td className="p-4 text-[var(--fm-text)]">{row.feature}</td>
                    <td className="p-4 text-center text-[var(--fm-text-secondary)]">{row.free}</td>
                    <td className="p-4 text-center text-[var(--fm-text)]">{row.pro}</td>
                    <td className="p-4 text-center text-[var(--fm-text)]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* FAQ */}
      <div>
        <h2
          className="text-2xl font-bold text-center mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <GlassCard key={i} hover={false} className="overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-[var(--fm-text)]">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-[var(--fm-text-secondary)] shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--fm-text-secondary)] shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <p className="text-sm text-[var(--fm-text-secondary)]">{faq.a}</p>
                </motion.div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <GlassCard hover className="p-8 sm:p-12 max-w-2xl mx-auto">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Ready to create stunning thumbnails?
          </h2>
          <p className="text-sm text-[var(--fm-text-secondary)] mb-6">
            Start with 5 free credits. No credit card required.
          </p>
          <Link
            href="/create"
            className="btn-primary inline-flex items-center gap-2 text-sm px-8 py-3 rounded-xl"
          >
            <Sparkles className="h-4 w-4" />
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
