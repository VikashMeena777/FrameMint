'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Wand2,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Gamepad2,
  Camera,
  GraduationCap,
  Mic2,
  Minus,
  Zap,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PricingCards } from '@/components/billing/PricingCards';
import { Footer } from '@/components/layout/Footer';
import { useUser } from '@/hooks/useUser';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const styles = [
  { name: 'Cinematic', icon: Clapperboard, gradient: 'from-purple-600 to-blue-500', desc: 'Movie poster vibes' },
  { name: 'Gaming', icon: Gamepad2, gradient: 'from-green-500 to-cyan-500', desc: 'Neon-lit energy' },
  { name: 'Vlog', icon: Camera, gradient: 'from-pink-500 to-orange-400', desc: 'Warm & personal' },
  { name: 'Educational', icon: GraduationCap, gradient: 'from-blue-500 to-indigo-500', desc: 'Clean & trustworthy' },
  { name: 'Podcast', icon: Mic2, gradient: 'from-amber-500 to-red-500', desc: 'Bold audio aesthetic' },
  { name: 'Minimal', icon: Minus, gradient: 'from-gray-400 to-gray-600', desc: 'Less is more' },
];

const steps = [
  {
    title: 'Enter Your Title',
    description: 'Paste your video title or describe the thumbnail you want in a sentence.',
    icon: Wand2,
  },
  {
    title: 'Choose a Style',
    description: 'Pick from cinematic, gaming, vlog, or 5+ other curated visual styles.',
    icon: ImageIcon,
  },
  {
    title: 'AI Generates',
    description: 'Google Gemini + Groq create multiple variations in under 10 seconds.',
    icon: Sparkles,
  },
  {
    title: 'Download & Use',
    description: 'Export at 1920 × 1080 (YouTube-ready) or any platform size. One click.',
    icon: Download,
  },
];

const faqs = [
  { q: 'Is FrameMint free to use?', a: 'Yes! The free plan includes 5 credits per month with 3 styles. Upgrade for unlimited access and all 8 styles.' },
  { q: 'What resolution are the thumbnails?', a: 'All thumbnails are generated at 1920 × 1080 pixels — the standard YouTube thumbnail resolution. You can also export for other platforms.' },
  { q: 'What AI models power FrameMint?', a: 'We use Google Gemini for image generation and Groq for fast prompt optimization. Both are industry-leading AI providers.' },
  { q: 'Can I use these thumbnails commercially?', a: 'Absolutely. All thumbnails you generate are yours to use for any purpose — YouTube, social media, blogs, or commercial projects.' },
  { q: 'How does A/B testing work?', a: 'Upload two thumbnail variants, share unique tracking links, and track click-through rates in real-time to find which performs better.' },
];

const socialProofStats = [
  { value: '10K+', label: 'Thumbnails Created', icon: Sparkles },
  { value: '2.5K+', label: 'Active Creators', icon: Users },
  { value: '4.9/5', label: 'Creator Rating', icon: Star },
];

export default function LandingPage() {
  const { user } = useUser();
  return (
    <div className="min-h-screen gradient-hero">
      {/* Navbar */}
      <nav className="glass-navbar sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <NextImage
            src="/logo.jpg"
            alt="FrameMint"
            width={32}
            height={32}
            className="rounded-lg transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            FrameMint
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-glass text-sm py-2 px-4">
                Log in
              </Link>
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--fm-primary)]/8 blur-[120px] animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--fm-secondary)]/6 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--fm-primary)]/20 bg-[var(--fm-primary)]/10 px-4 py-1.5 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-[var(--fm-primary-light)]" />
            <span className="text-sm text-[var(--fm-primary-light)] font-medium">
              AI-Powered · 10-second generation
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="mx-auto max-w-5xl text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-7xl"
          style={{ fontFamily: 'Outfit, sans-serif' }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          Your Title Deserves a{' '}
          <span className="relative inline-block">
            <span className="gradient-primary-text">Thumbnail That Clicks</span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full gradient-primary opacity-60"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[var(--fm-text-secondary)] leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          Paste your video title, pick a style, get a scroll-stopping 1920 × 1080 thumbnail.
          No Photoshop. No templates. Just AI magic.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Link href="/login" className="btn-primary text-base py-3.5 px-10 flex items-center gap-2 shadow-lg shadow-[var(--fm-primary)]/25 hover:shadow-[var(--fm-primary)]/40 transition-shadow">
            Start Creating Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="btn-glass text-base py-3.5 px-8 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          {socialProofStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fm-primary)]/10">
                <stat.icon className="h-5 w-5 text-[var(--fm-primary-light)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--fm-text)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--fm-text-secondary)]">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Hero visual — interactive mock */}
        <motion.div
          className="mx-auto mt-16 max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
        >
          <div className="glass-card-static overflow-hidden rounded-2xl p-1 shadow-2xl shadow-[var(--fm-primary)]/5">
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[var(--fm-bg-secondary)] to-[var(--fm-bg)] overflow-hidden">
              {/* Simulated UI */}
              <div className="absolute inset-0 flex">
                {/* Left panel — input simulation */}
                <div className="w-2/5 border-r border-white/5 p-6 flex flex-col gap-4">
                  <div className="h-3 w-1/2 rounded-full bg-white/10" />
                  <div className="h-10 w-full rounded-xl bg-white/[0.05] border border-white/10" />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className={`h-12 rounded-lg ${n === 1 ? 'bg-[var(--fm-primary)]/20 border border-[var(--fm-primary)]/30' : 'bg-white/[0.03] border border-white/5'}`} />
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="h-10 w-full rounded-xl gradient-primary opacity-80 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                {/* Right panel — preview simulation */}
                <div className="w-3/5 p-6 flex items-center justify-center">
                  <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-purple-600/20 via-blue-500/10 to-cyan-500/20 border border-white/5 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary animate-float">
                        <Sparkles className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--fm-text)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        AI Thumbnail Preview
                      </p>
                      <p className="mt-1 text-xs text-[var(--fm-text-secondary)]">
                        1920 × 1080 · YouTube Ready
                      </p>
                    </div>
                    {/* Floating quality badge */}
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 px-2. py-0.5 text-[10px] font-medium text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      HD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Style Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Pick Your Style
          </h2>
          <p className="mt-3 text-[var(--fm-text-secondary)]">
            Choose from 6+ curated styles or create your own.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {styles.map((style, i) => {
            const IconComp = style.icon;
            return (
              <motion.div
                key={style.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <GlassCard className="p-5 text-center cursor-pointer group">
                  {/* Gradient accent strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  {/* Icon */}
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg`}>
                    <IconComp className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--fm-text)]">{style.name}</p>
                  <p className="text-[11px] text-[var(--fm-text-secondary)] mt-1 opacity-70">{style.desc}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            How It Works
          </h2>
          <p className="mt-3 text-[var(--fm-text-secondary)]">
            From title to thumbnail in 4 simple steps.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <GlassCard className="p-6 h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fm-primary)]/10 mb-4">
                  <step.icon className="h-6 w-6 text-[var(--fm-primary-light)]" />
                </div>
                <div className="mb-2 text-xs font-semibold text-[var(--fm-primary)] uppercase tracking-wider">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-[var(--fm-text)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--fm-text-secondary)]">{step.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-[var(--fm-text-secondary)]">
            Start free. Upgrade when you need more power.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <PricingCards />
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <FAQItem question={faq.q} answer={faq.a} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="relative glass-card-static rounded-3xl p-12 sm:p-16 text-center gradient-pro border border-[var(--fm-primary)]/20 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[var(--fm-primary)]/8 blur-[100px]" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--fm-primary)]/20 bg-[var(--fm-primary)]/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-[var(--fm-primary-light)]" />
            <span className="text-sm text-[var(--fm-primary-light)] font-medium">
              No credit card required
            </span>
          </div>

          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Mint Your First Thumbnail?
          </h2>
          <p className="text-lg text-[var(--fm-text-secondary)] mb-8 max-w-xl mx-auto">
            Join thousands of creators who save hours on thumbnail design with AI.
            Start free — upgrade whenever you want.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2 shadow-lg shadow-[var(--fm-primary)]/25">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--fm-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              5 free credits included
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card-static rounded-xl overflow-hidden">
      <button
        className="flex w-full items-center justify-between p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-[var(--fm-text)] pr-4">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--fm-text-secondary)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
