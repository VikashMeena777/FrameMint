'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Wand2,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  Zap,
  Shield,
  BarChart3,
  Layers,
  Clock,
  Star,
  X,
  Heart,
  Eye,
} from 'lucide-react';
import { PricingCards } from '@/components/billing/PricingCards';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: Zap,
    title: 'Generate in Seconds',
    description: 'Our AI analyzes your title and crafts 4 unique thumbnail variants in under 30 seconds.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(124, 58, 237, 0.3)',
  },
  {
    icon: Layers,
    title: '8+ Premium Styles',
    description: 'Cinematic, Gaming, Vlog, Educational, Podcast — each fine-tuned for maximum CTR.',
    color: 'from-blue-500 to-cyan-600',
    glow: 'rgba(37, 99, 235, 0.3)',
  },
  {
    icon: BarChart3,
    title: 'A/B Test & Win',
    description: 'Split test thumbnails with real link tracking. Pick the variant your audience loves.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: Shield,
    title: 'Multi-Platform Ready',
    description: 'YouTube, Instagram, TikTok, Twitter, LinkedIn — perfect sizes, every time.',
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244, 63, 94, 0.3)',
  },
];

const steps = [
  { icon: Wand2, step: '01', title: 'Describe Your Video', description: 'Enter your title or describe the vibe you want for your thumbnail.' },
  { icon: Sparkles, step: '02', title: 'AI Creates Variants', description: 'Get 4 stunning, click-optimized thumbnail variants generated instantly.' },
  { icon: ImageIcon, step: '03', title: 'Customize & Refine', description: 'Use the live editor to tweak text, colors, layout, and style elements.' },
  { icon: Download, step: '04', title: 'Export & Go', description: 'Download in 4K or push directly to YouTube, Instagram, and more.' },
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
    a: 'Yes! We support YouTube (1920×1080), Instagram (1080×1080, 1080×1350), TikTok (1080×1920), Twitter, LinkedIn, and custom sizes.',
  },
  {
    q: 'What is A/B testing for thumbnails?',
    a: 'Pro users can create multiple variants and share them via unique links. We track clicks and show you which thumbnail gets the highest CTR — so you always pick the winner.',
  },
  {
    q: 'Is my data secure?',
    a: 'All thumbnails are stored securely with encryption. We never use your images for training AI models.',
  },
];

const stats = [
  { label: 'Thumbnails Generated', value: '2M+' },
  { label: 'Avg. CTR Boost', value: '3.2×' },
  { label: 'Time Saved / Creator', value: '4 hrs/mo' },
  { label: 'Creator Satisfaction', value: '98%' },
];

// Demo thumbnails for hero visual and Watch Demo modal
const demoThumbnails = [
  {
    title: 'I Built a $1M SaaS in 30 Days',
    style: 'Cinematic',
    views: '2.4M',
    ctr: '12.3%',
    gradient: 'from-violet-900 via-purple-800 to-indigo-900',
    titleColor: '#E9D5FF',
    accentColor: '#A78BFA',
    emoji: '🚀',
    tag: '#1 trending',
  },
  {
    title: '10 JS Tricks You Never Knew',
    style: 'Educational',
    views: '890K',
    ctr: '9.8%',
    gradient: 'from-blue-900 via-cyan-800 to-teal-900',
    titleColor: '#BAE6FD',
    accentColor: '#38BDF8',
    emoji: '💡',
    tag: 'Top pick',
  },
  {
    title: 'Minecraft Hardcore 100 Days',
    style: 'Gaming',
    views: '5.1M',
    ctr: '14.7%',
    gradient: 'from-emerald-900 via-green-800 to-teal-900',
    titleColor: '#A7F3D0',
    accentColor: '#34D399',
    emoji: '⚔️',
    tag: 'Viral',
  },
  {
    title: 'My Morning Routine Changed My Life',
    style: 'Vlog',
    views: '1.2M',
    ctr: '10.1%',
    gradient: 'from-pink-900 via-rose-800 to-red-900',
    titleColor: '#FECDD3',
    accentColor: '#FB7185',
    emoji: '☀️',
    tag: 'Trending',
  },
  {
    title: 'Zero to $10K/Month with AI',
    style: 'Bold Text',
    views: '3.3M',
    ctr: '13.2%',
    gradient: 'from-amber-900 via-orange-800 to-red-900',
    titleColor: '#FED7AA',
    accentColor: '#FB923C',
    emoji: '💰',
    tag: 'Hot',
  },
  {
    title: 'The Future of Remote Work',
    style: 'Podcast',
    views: '670K',
    ctr: '8.9%',
    gradient: 'from-slate-900 via-zinc-800 to-stone-900',
    titleColor: '#E2E8F0',
    accentColor: '#94A3B8',
    emoji: '🎙️',
    tag: 'Featured',
  },
];

function DemoThumbnailCard({
  thumb,
  size = 'md',
}: {
  thumb: typeof demoThumbnails[0];
  size?: 'sm' | 'md' | 'lg';
}) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${thumb.gradient} group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07]" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
        <span
          className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm"
          style={{ background: `${thumb.accentColor}25`, color: thumb.accentColor, border: `1px solid ${thumb.accentColor}30` }}
        >
          {thumb.style}
        </span>
        <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white/70">
          {thumb.tag}
        </span>
      </div>

      {/* Center emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${isLg ? 'text-4xl' : isSm ? 'text-2xl' : 'text-3xl'} drop-shadow-2xl opacity-60`}>
          {thumb.emoji}
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p
          className={`font-bold leading-tight drop-shadow-lg line-clamp-2 ${isLg ? 'text-sm' : 'text-[9px] sm:text-[10px]'}`}
          style={{ color: thumb.titleColor }}
        >
          {thumb.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Eye className="h-2.5 w-2.5 text-white/50" />
            <span className="text-[8px] text-white/50">{thumb.views}</span>
          </div>
          <span className="text-[8px] font-semibold" style={{ color: thumb.accentColor }}>
            CTR {thumb.ctr}
          </span>
        </div>
      </div>
    </div>
  );
}

function WatchDemoModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(6, 6, 18, 0.97)', backdropFilter: 'blur(40px)' }}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/6">
            <div>
              <div className="badge-pill w-fit mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI Demo Gallery
              </div>
              <h2 className="text-xl font-bold text-[var(--fm-text)]">See What FrameMint Creates</h2>
              <p className="text-sm text-[var(--fm-text-secondary)] mt-0.5">
                Real AI-generated thumbnails across styles — click-winners, all of them.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 transition-colors text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Thumbnail grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {demoThumbnails.map((thumb, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }}
                >
                  <DemoThumbnailCard thumb={thumb} size="lg" />
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              {[
                { label: 'Avg. generation time', value: '28s' },
                { label: 'Avg. CTR boost', value: '+3.2×' },
                { label: 'Styles available', value: '8+' },
                { label: 'Satisfied creators', value: '10K+' },
              ].map((s) => (
                <div key={s.label} className="flex-1 min-w-[90px] text-center">
                  <p className="text-lg font-bold stat-number">{s.value}</p>
                  <p className="text-[11px] text-[var(--fm-text-secondary)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link href="/login" onClick={onClose} className="btn-primary text-sm py-3 px-8 w-full sm:w-auto justify-center">
                <Sparkles className="h-4 w-4" />
                Try It Free — No Card Required
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={onClose} className="btn-glass text-sm py-3 px-6 w-full sm:w-auto">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--fm-bg)' }}>
      {/* Watch Demo Modal */}
      {showDemo && <WatchDemoModal onClose={() => setShowDemo(false)} />}

      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Navbar */}
      <nav className="glass-navbar sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)]">FrameMint</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {[['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors rounded-lg hover:bg-white/5"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-glass text-sm py-2 px-4 hidden sm:inline-flex">Log in</Link>
          <Link href="/login" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-20 pb-16 sm:px-8 lg:px-12 overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-60 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-violet-600/8 blur-[140px]" />
        <div className="pointer-events-none absolute top-0 -left-60 h-[500px] w-[500px] rounded-full bg-blue-600/6 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 -right-60 h-[500px] w-[500px] rounded-full bg-violet-600/6 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />

        <div className="relative text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="badge-pill mx-auto mb-6 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Thumbnail Generator
            </div>
          </motion.div>

          <motion.h1
            className="mx-auto max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Turn Your Title Into a{' '}
            <span className="gradient-primary-text">Click-Winning</span>{' '}
            Thumbnail
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-lg text-[var(--fm-text-secondary)] leading-relaxed"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Generate 4 stunning thumbnail variants in 10 seconds. Type your video title,
            pick a style, and let AI handle the rest.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Link href="/login" className="btn-primary text-base py-3.5 px-8">
              Start Creating Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="btn-glass text-base py-3.5 px-7 flex items-center gap-2.5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary/60 border border-violet-400/30">
                <Play className="h-3 w-3 ml-0.5 text-white" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-7 flex items-center justify-center gap-2.5"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <div className="flex -space-x-2">
              {[
                { l: 'V', c: 'from-violet-500 to-purple-600' },
                { l: 'A', c: 'from-blue-500 to-cyan-600' },
                { l: 'M', c: 'from-emerald-500 to-teal-600' },
                { l: 'R', c: 'from-pink-500 to-rose-600' },
              ].map(({ l, c }, i) => (
                <div key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--fm-bg)] text-[10px] font-bold text-white bg-gradient-to-br ${c}`}>
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-[var(--fm-text-secondary)]">
              Loved by <span className="font-semibold text-[var(--fm-text)]">10,000+</span> creators
            </span>
          </motion.div>
        </div>

        {/* ── Hero Visual: Thumbnail Demo Grid ── */}
        <motion.div
          className="mx-auto mt-14 max-w-5xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
        >
          {/* Outer glow frame */}
          <div className="relative rounded-2xl p-px overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(37,99,235,0.3) 50%, rgba(124,58,237,0.15) 100%)' }}>
            <div className="rounded-[14px] overflow-hidden" style={{ background: 'rgba(6, 6, 20, 0.95)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 flex items-center gap-2 mx-4">
                  <div className="flex-1 max-w-sm mx-auto h-6 rounded-md bg-white/5 border border-white/5 flex items-center px-3 gap-2">
                    <div className="h-3 w-3 rounded-full bg-violet-500/30 shrink-0" />
                    <span className="text-[10px] text-[var(--fm-text-secondary)]">app.framemint.com/create</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="badge-pill text-[10px] py-0.5 px-2">
                    <Sparkles className="h-2.5 w-2.5" />
                    4 variants ready
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="p-5">
                {/* Prompt bar */}
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                    <Wand2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--fm-text)]">I Built a $1M SaaS in 30 Days</p>
                    <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">Style: Cinematic · Platform: YouTube</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Generated</span>
                  </div>
                </div>

                {/* 4 thumbnail variants */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {demoThumbnails.slice(0, 4).map((thumb, i) => (
                    <div key={i} className="group relative">
                      <DemoThumbnailCard thumb={thumb} size="sm" />
                      {/* Action overlay */}
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors">
                          <Download className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors">
                          <Heart className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                      {/* Variant label */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[var(--fm-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        V{i + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-[var(--fm-text-secondary)]">
                    <span>4 variants · 1 credit used</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 28s
                    </span>
                  </div>
                  <Link href="/login" className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Try Free
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Glow below */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-24 blur-3xl opacity-30"
            style={{ background: 'linear-gradient(to top, rgba(124,58,237,0.4), transparent)' }} />
        </motion.div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <p className="stat-number text-3xl sm:text-4xl">{stat.value}</p>
                <p className="mt-1.5 text-sm text-[var(--fm-text-secondary)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          className="mb-14 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <div className="badge-pill mx-auto mb-4 w-fit">
            <Zap className="h-3.5 w-3.5" />
            What You Get
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything You Need to{' '}
            <span className="gradient-primary-text">Win the Click</span>
          </h2>
          <p className="mt-4 text-[var(--fm-text-secondary)] max-w-lg mx-auto text-base">
            Built for creators who care about performance — not just pretty pictures.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="glass feature-card rounded-2xl p-6 h-full"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}
                  style={{ boxShadow: `0 8px 20px ${feature.glow}` }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--fm-text)]">{feature.title}</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          className="mb-14 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <div className="badge-pill mx-auto mb-4 w-fit">
            <Clock className="h-3.5 w-3.5" />
            In 4 Simple Steps
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            From Title to Thumbnail{' '}
            <span className="gradient-primary-text">in Seconds</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="glass rounded-2xl p-6 h-full relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <span className="absolute -top-2 -right-1 text-7xl font-black tracking-tighter text-white/[0.04] select-none leading-none">
                  {step.step}
                </span>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fm-primary)]/10 border border-[var(--fm-primary)]/20">
                  <Icon className="h-5 w-5 text-[var(--fm-primary-light)]" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--fm-text)]">{step.title}</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <div className="badge-pill mx-auto mb-4 w-fit">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pricing
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Simple, Transparent{' '}
            <span className="gradient-primary-text">Pricing</span>
          </h2>
          <p className="mt-4 text-[var(--fm-text-secondary)] text-base">
            Start free. Upgrade when you&apos;re ready to scale.
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

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Frequently Asked{' '}
            <span className="gradient-primary-text">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
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

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-violet-500/20 px-8 py-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.06) 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-80 w-80 rounded-full bg-violet-600/10 blur-[80px]" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-25" />

          <div className="relative">
            <div className="badge-pill mx-auto mb-5 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started Today
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">
              Ready to Mint Your First{' '}
              <span className="gradient-primary-text">Thumbnail?</span>
            </h2>
            <p className="text-lg text-[var(--fm-text-secondary)] mb-10 max-w-lg mx-auto">
              Join thousands of creators who save hours on thumbnail design every month.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="btn-primary text-base py-3.5 px-8">
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-[var(--fm-text-secondary)]">No credit card required · 5 free thumbnails</p>
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
    <div className="rounded-xl overflow-hidden border border-white/6 bg-white/[0.025]">
      <button
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-[var(--fm-text)] leading-snug">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--fm-text-secondary)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="w-full h-px bg-white/5 mb-4" />
              <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
