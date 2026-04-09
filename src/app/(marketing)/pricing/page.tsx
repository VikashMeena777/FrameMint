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
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/layout/Footer';
import { PLANS } from '@/types';



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
];

const comparison = [
  { feature: 'Monthly Thumbnails', free: '5', pro: '100', enterprise: 'Unlimited' },
  { feature: 'Thumbnail Styles', free: '2 basic', pro: 'All 8', enterprise: 'All 8 + custom' },
  { feature: 'Resolution', free: '720p', pro: '1080p+', enterprise: '4K' },
  { feature: 'Watermark', free: 'Yes', pro: 'No', enterprise: 'No' },
  { feature: 'Video Frame Extraction', free: false, pro: true, enterprise: true },
  { feature: 'API Access', free: false, pro: false, enterprise: true },
  { feature: 'Team Seats', free: '1', pro: '1', enterprise: '5' },
  { feature: 'Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function CellValue({ val }: { val: string | boolean }) {
  if (typeof val === 'boolean') {
    return val ? (
      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
    ) : (
      <span className="text-[var(--fm-text-muted)]">—</span>
    );
  }
  return <span>{val}</span>;
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--fm-bg)' }}>
      {/* Full-page background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 160% 60% at 50% -5%, rgba(109,40,217,0.32) 0%, rgba(109,40,217,0.08) 40%, transparent 62%),
            radial-gradient(ellipse 80% 50% at 5% 35%, rgba(79,70,229,0.16) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 95% 20%, rgba(37,99,235,0.13) 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-dot-grid opacity-20" style={{ zIndex: 0 }} />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Navbar */}
        <nav className="glass-navbar sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8 lg:px-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-900/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)]">FrameMint</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-glass text-sm py-2 px-4 hidden sm:inline-flex">Log in</Link>
            <Link href="/login" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-14 py-20 space-y-24">
          {/* Hero */}
          <motion.div
            className="text-center space-y-5 max-w-3xl mx-auto"
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
          >
            <div className="badge-pill mx-auto w-fit">
              <Zap className="h-3.5 w-3.5" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--fm-text)] leading-[1.06]">
              Plans for every{' '}
              <span className="gradient-primary-text">creator</span>
            </h1>
            <p className="text-lg text-[var(--fm-text-secondary)] max-w-lg mx-auto">
              Start free, upgrade when you&apos;re ready. No surprises, no hidden fees.
            </p>
          </motion.div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.slug}
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-5 inset-x-0 flex justify-center z-10">
                    <span className="badge-pill bg-violet-600/30 border-violet-400/35 text-violet-200 text-xs px-4 py-1.5">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    'glass-card h-full p-7 flex flex-col',
                    plan.popular && 'border-violet-500/28'
                  )}
                  style={plan.popular ? {
                    boxShadow: '0 0 60px rgba(124,58,237,0.14), 0 10px 40px rgba(0,0,0,0.5)',
                  } : undefined}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[var(--fm-text)] mb-1">{plan.name}</h3>
                    <p className="text-sm text-[var(--fm-text-secondary)]">{plan.description}</p>
                  </div>

                  <div className="mb-7 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[var(--fm-text)]">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-[var(--fm-text-secondary)]">/mo</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--fm-text)]">
                        <Check className="h-4 w-4 text-[var(--fm-primary-light)] mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                      plan.popular ? 'btn-primary' : 'btn-glass'
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              { icon: Zap, title: 'Instant generation', desc: 'Thumbnails ready in 30–60 seconds' },
              { icon: Shield, title: 'Secure payments', desc: 'PCI-compliant via Cashfree' },
              { icon: Users, title: 'Trusted by creators', desc: '10,000+ thumbnails generated daily' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp} custom={i}>
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/30">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--fm-text)]">{title}</p>
                    <p className="text-xs text-[var(--fm-text-secondary)]">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature comparison */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-2xl font-bold text-center mb-8 text-[var(--fm-text)]">
              Compare Plans
            </h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left p-4 font-medium text-[var(--fm-text-secondary)]">Feature</th>
                      <th className="text-center p-4 font-semibold text-[var(--fm-text)]">Free</th>
                      <th className="text-center p-4 font-semibold text-[var(--fm-primary-light)] bg-violet-600/[0.06]">Pro</th>
                      <th className="text-center p-4 font-semibold text-[var(--fm-text)]">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr key={row.feature} className={cn('border-b border-white/[0.04]', i % 2 === 0 && 'bg-white/[0.012]')}>
                        <td className="p-4 text-[var(--fm-text-secondary)] text-xs font-medium">{row.feature}</td>
                        <td className="p-4 text-center text-[var(--fm-text-secondary)] text-xs">
                          <CellValue val={row.free} />
                        </td>
                        <td className="p-4 text-center text-[var(--fm-text)] text-xs bg-violet-600/[0.03]">
                          <CellValue val={row.pro} />
                        </td>
                        <td className="p-4 text-center text-[var(--fm-text)] text-xs">
                          <CellValue val={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-10 text-[var(--fm-text)]">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                >
                  <div className="glass-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left group"
                    >
                      <span className="text-sm font-semibold text-[var(--fm-text)] group-hover:text-[var(--fm-primary-light)] transition-colors pr-4">
                        {faq.q}
                      </span>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                        <ChevronDown className="h-4 w-4 text-[var(--fm-text-secondary)]" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-white/[0.05] pt-4">
                            <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="relative overflow-hidden rounded-3xl p-px max-w-2xl mx-auto"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(37,99,235,0.3) 50%, rgba(124,58,237,0.15) 100%)' }}>
              <div className="relative rounded-[22px] overflow-hidden p-10 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(14,8,36,0.98) 0%, rgba(8,6,24,0.98) 100%)' }}>
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full blur-[60px]"
                  style={{ background: 'rgba(124,58,237,0.22)' }} />
                <div className="relative">
                  <h2 className="text-2xl font-bold mb-3 text-[var(--fm-text)]">
                    Ready to create stunning thumbnails?
                  </h2>
                  <p className="text-sm text-[var(--fm-text-secondary)] mb-7 max-w-sm mx-auto">
                    Start with 5 free credits. No credit card required.
                  </p>
                  <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-sm px-8 py-3.5 rounded-xl">
                    <Sparkles className="h-4 w-4" />
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="mt-5 text-xs text-[var(--fm-text-muted)]">No credit card • 5 free thumbnails • Cancel anytime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
