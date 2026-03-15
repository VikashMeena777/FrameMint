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
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PricingCards } from '@/components/billing/PricingCards';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const styles = [
  { name: 'Cinematic', gradient: 'from-purple-600 to-blue-500', desc: 'Epic movie poster look', icon: Clapperboard },
  { name: 'Gaming', gradient: 'from-green-500 to-cyan-500', desc: 'High-energy neon vibes', icon: Gamepad2 },
  { name: 'Vlog', gradient: 'from-pink-500 to-orange-400', desc: 'Warm, personal feel', icon: Camera },
  { name: 'Educational', gradient: 'from-blue-500 to-indigo-500', desc: 'Clean & professional', icon: GraduationCap },
  { name: 'Podcast', gradient: 'from-amber-500 to-red-500', desc: 'Bold audio aesthetic', icon: Mic2 },
  { name: 'Minimal', gradient: 'from-gray-400 to-gray-600', desc: 'Less is more', icon: Minus },
];

const steps = [
  {
    icon: Wand2,
    title: 'Enter Your Prompt',
    description: 'Type your video title or describe the thumbnail you want.',
  },
  {
    icon: Sparkles,
    title: 'AI Generates Options',
    description: 'Our AI creates 4 stunning thumbnail variants in seconds.',
  },
  {
    icon: ImageIcon,
    title: 'Customize & Edit',
    description: 'Fine-tune with live editor — add text, adjust colors, swap styles.',
  },
  {
    icon: Download,
    title: 'Export & Upload',
    description: 'Download in 4K or auto-upload to YouTube, Instagram, and more.',
  },
];

const faqs = [
  {
    q: 'What makes FrameMint different from Canva?',
    a: 'FrameMint is purpose-built for thumbnails. Our AI understands what makes thumbnails get clicked — contrast, faces, text placement — and generates designs optimized for CTR, not generic graphics.',
  },
  {
    q: 'How many thumbnails can I generate for free?',
    a: 'The free plan includes 5 thumbnails per month with basic styles. Upgrade to Pro for 100/month with all styles, A/B testing, and video-to-thumbnail extraction.',
  },
  {
    q: 'Can I use FrameMint for Instagram and TikTok?',
    a: 'Yes! We support YouTube (1280×720), Instagram (1080×1080, 1080×1350), TikTok (1080×1920), Twitter, LinkedIn, and custom sizes.',
  },
  {
    q: 'What is A/B testing for thumbnails?',
    a: 'Pro users can create multiple variants and share them via unique links. We track clicks and show you which thumbnail gets the highest CTR — so you always pick the winner.',
  },
  {
    q: 'Is my data secure?',
    a: 'All thumbnails are stored securely in Google Drive and Supabase Storage with encryption. We never use your images for training AI models.',
  },
];

export default function LandingPage() {
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
        <div className="hidden md:flex items-center gap-6">
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
          <Link href="/login" className="btn-glass text-sm py-2 px-4">
            Log in
          </Link>
          <Link href="/login" className="btn-primary text-sm py-2 px-4">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--fm-primary)]/20 bg-[var(--fm-primary)]/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-[var(--fm-primary-light)]" />
            <span className="text-sm text-[var(--fm-primary-light)] font-medium">
              AI-Powered Thumbnail Generator
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="mx-auto max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: 'Outfit, sans-serif' }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          Turn Your Title Into a{' '}
          <span className="gradient-primary-text">Scroll-Stopping</span>{' '}
          Thumbnail
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-[var(--fm-text-secondary)]"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          Generate click-worthy thumbnails in 10 seconds. Just type your video
          title and let AI do the rest — no design skills needed.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Link href="/login" className="btn-primary text-base py-3 px-8 flex items-center gap-2">
            Start Creating Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="btn-glass text-base py-3 px-8 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Hero visual placeholder */}
        <motion.div
          className="mx-auto mt-16 max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          <div className="glass-card-static overflow-hidden rounded-2xl p-1">
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[var(--fm-primary)]/10 to-[var(--fm-secondary)]/5 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-float">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-[var(--fm-text)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  AI Thumbnail Preview
                </p>
                <p className="mt-1 text-sm text-[var(--fm-text-secondary)]">
                  Your generated thumbnails will appear here
                </p>
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
          className="glass-card-static rounded-3xl p-12 text-center gradient-pro border border-[var(--fm-primary)]/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Mint Your First Thumbnail?
          </h2>
          <p className="text-lg text-[var(--fm-text-secondary)] mb-8 max-w-xl mx-auto">
            Join thousands of creators who save hours on thumbnail design with AI.
          </p>
          <Link href="/login" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
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
