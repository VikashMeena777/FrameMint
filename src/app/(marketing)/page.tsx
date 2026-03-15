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
  Check,
  TrendingUp,
  Users,
  Globe,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useState, useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: Zap,
    title: 'Generate in Seconds',
    description: 'Our AI analyzes your title and crafts 4 unique thumbnail variants in under 30 seconds.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(124, 58, 237, 0.28)',
    border: 'rgba(124, 58, 237, 0.22)',
  },
  {
    icon: Layers,
    title: '8+ Premium Styles',
    description: 'Cinematic, Gaming, Vlog, Educational, Podcast — each fine-tuned for maximum CTR.',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(37, 99, 235, 0.28)',
    border: 'rgba(37, 99, 235, 0.22)',
  },
  {
    icon: BarChart3,
    title: 'A/B Test & Win',
    description: 'Split test thumbnails with real link tracking. Pick the variant your audience loves.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.28)',
    border: 'rgba(16, 185, 129, 0.22)',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Ready',
    description: 'YouTube, Instagram, TikTok, Twitter, LinkedIn — perfect sizes, every time.',
    gradient: 'from-rose-500 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.28)',
    border: 'rgba(244, 63, 94, 0.22)',
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
    a: 'Yes! We support YouTube (1280×720), Instagram (1080×1080, 1080×1350), TikTok (1080×1920), Twitter, LinkedIn, and custom sizes.',
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
  { label: 'Thumbnails Generated', value: '2M+', icon: ImageIcon },
  { label: 'Avg. CTR Boost', value: '3.2×', icon: TrendingUp },
  { label: 'Time Saved / Creator', value: '4 hrs/mo', icon: Clock },
  { label: 'Happy Creators', value: '10K+', icon: Users },
];

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06]" />

      <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
        <span
          className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm"
          style={{ background: `${thumb.accentColor}22`, color: thumb.accentColor, border: `1px solid ${thumb.accentColor}28` }}
        >
          {thumb.style}
        </span>
        <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white/70">
          {thumb.tag}
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${isLg ? 'text-4xl' : isSm ? 'text-xl' : 'text-3xl'} drop-shadow-2xl opacity-55`}>
          {thumb.emoji}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p
          className={`font-bold leading-tight drop-shadow-lg line-clamp-2 ${isLg ? 'text-sm' : 'text-[9px] sm:text-[10px]'}`}
          style={{ color: thumb.titleColor }}
        >
          {thumb.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Eye className="h-2.5 w-2.5 text-white/45" />
            <span className="text-[8px] text-white/45">{thumb.views}</span>
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
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(4, 2, 16, 0.98)', backdropFilter: 'blur(40px)' }}
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
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
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {demoThumbnails.map((thumb, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.065, duration: 0.38 } }}
                >
                  <DemoThumbnailCard thumb={thumb} size="lg" />
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-2xl bg-white/[0.025] border border-white/5">
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
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--fm-bg)' }}>
      {/* ── Full-page background — covers entire page ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 180% 70% at 50% -2%, rgba(109, 40, 217, 0.38) 0%, rgba(109, 40, 217, 0.1) 38%, transparent 62%),
            radial-gradient(ellipse 90% 55% at 2% 28%, rgba(79, 70, 229, 0.2) 0%, transparent 52%),
            radial-gradient(ellipse 90% 55% at 98% 18%, rgba(37, 99, 235, 0.16) 0%, transparent 52%),
            radial-gradient(ellipse 120% 45% at 50% 102%, rgba(124, 58, 237, 0.14) 0%, transparent 58%)
          `,
          zIndex: 0,
        }}
      />

      {/* Noise overlay */}
      <div className="noise-overlay" style={{ zIndex: 1 }} />

      {/* Background dot grid */}
      <div
        className="fixed inset-0 pointer-events-none bg-dot-grid opacity-25"
        style={{ zIndex: 0 }}
      />

      {/* Content above background */}
      <div className="relative" style={{ zIndex: 2 }}>

        {/* Watch Demo Modal */}
        {showDemo && <WatchDemoModal onClose={() => setShowDemo(false)} />}

        {/* ── Navbar ── */}
        <nav className={`sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8 lg:px-14 transition-all duration-300 ${scrolled ? 'glass-navbar-scrolled' : 'glass-navbar'}`}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-900/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)]">FrameMint</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="px-3.5 py-2 text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-glass text-sm py-2 px-4 hidden sm:inline-flex">Log in</Link>
            <Link href="/login" className="btn-primary text-sm py-2 px-4">
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8 lg:px-14 text-center">
          {/* Floating orbs */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full blur-[130px] animate-blob opacity-60"
            style={{ background: 'rgba(124, 58, 237, 0.22)' }} />
          <div className="pointer-events-none absolute top-20 -left-32 h-[400px] w-[400px] rounded-full blur-[100px] animate-blob animation-delay-2s opacity-50"
            style={{ background: 'rgba(99, 102, 241, 0.18)' }} />
          <div className="pointer-events-none absolute top-10 -right-32 h-[400px] w-[400px] rounded-full blur-[100px] animate-blob animation-delay-4s opacity-45"
            style={{ background: 'rgba(37, 99, 235, 0.15)' }} />

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-6">
            <div className="badge-pill mx-auto w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Thumbnail Generator
            </div>
          </motion.div>

          <motion.h1
            className="mx-auto max-w-5xl text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-[5rem]"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Turn Your Title Into a{' '}
            <span className="gradient-primary-text">Click-Winning</span>
            {' '}Thumbnail
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-[1.05rem] text-[var(--fm-text-secondary)] leading-relaxed"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Generate 4 stunning thumbnail variants in 10 seconds. Type your video title,
            pick a style, and let AI handle the rest.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Link href="/login" className="btn-primary text-[0.95rem] py-3.5 px-9">
              Start Creating Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="btn-glass text-[0.95rem] py-3.5 px-7 flex items-center gap-2.5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 border border-violet-400/25">
                <Play className="h-3 w-3 ml-0.5 text-white" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <div className="flex -space-x-2.5">
              {[
                { l: 'V', c: 'from-violet-500 to-purple-600' },
                { l: 'A', c: 'from-blue-500 to-cyan-600' },
                { l: 'M', c: 'from-emerald-500 to-teal-600' },
                { l: 'R', c: 'from-pink-500 to-rose-600' },
                { l: 'K', c: 'from-amber-500 to-orange-600' },
              ].map(({ l, c }, i) => (
                <div key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--fm-bg)] text-[9px] font-bold text-white bg-gradient-to-br ${c}`}>
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-[var(--fm-text-secondary)]">
              Loved by <span className="font-semibold text-[var(--fm-text)]">10,000+</span> creators
            </span>
          </motion.div>

          {/* ── Hero Browser Mockup ── */}
          <motion.div
            className="mx-auto mt-16 max-w-5xl"
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
          >
            <div className="relative rounded-2xl p-px overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(37,99,235,0.32) 50%, rgba(124,58,237,0.12) 100%)' }}>
              <div className="rounded-[14px] overflow-hidden" style={{ background: 'rgba(4, 2, 18, 0.97)' }}>
                {/* Window chrome */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.045]"
                  style={{ background: 'rgba(8, 6, 24, 0.95)' }}>
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-xs w-full h-6 rounded-lg bg-white/[0.045] border border-white/[0.055] flex items-center px-3 gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-violet-500/35 shrink-0" />
                      <span className="text-[10px] text-[var(--fm-text-secondary)]">app.framemint.com/create</span>
                    </div>
                  </div>
                  <div className="badge-pill text-[10px] py-0.5 px-2">
                    <Sparkles className="h-2.5 w-2.5" />
                    4 variants ready
                  </div>
                </div>

                {/* App content */}
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.065] bg-white/[0.03] p-3.5">
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {demoThumbnails.slice(0, 4).map((thumb, i) => (
                      <div key={i} className="group relative">
                        <DemoThumbnailCard thumb={thumb} size="sm" />
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/45 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/14 backdrop-blur-sm hover:bg-white/22 transition-colors">
                            <Download className="h-3.5 w-3.5 text-white" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/14 backdrop-blur-sm hover:bg-white/22 transition-colors">
                            <Heart className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                        <div className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-black/55 backdrop-blur-sm px-1.5 py-0.5 rounded text-white/75">
                          V{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom glow under mockup */}
            <div className="mx-auto mt-0 h-20 w-3/4 rounded-full blur-[60px] opacity-30"
              style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.5), rgba(37,99,235,0.4))' }} />
          </motion.div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 pb-16">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-5 text-center border border-white/[0.055] hover:border-violet-500/20 transition-colors"
              >
                <p className="text-3xl font-bold stat-number mb-1">{stat.value}</p>
                <p className="text-xs text-[var(--fm-text-secondary)]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-14">
          <motion.div
            className="mb-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="badge-pill mx-auto w-fit mb-4">
              <Zap className="h-3.5 w-3.5" />
              Powerful Features
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-[var(--fm-text)] max-w-3xl mx-auto">
              Everything you need to{' '}
              <span className="gradient-primary-text">dominate</span> thumbnails
            </h2>
            <p className="mt-4 text-[var(--fm-text-secondary)] max-w-lg mx-auto">
              Purpose-built tools for creators who take their content seriously.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="glass-card feature-card h-full p-6 group hover:scale-[1.01] transition-transform duration-300"
                  style={{ borderColor: feat.border }}>
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.gradient}`}
                    style={{ boxShadow: `0 8px 24px ${feat.glow}` }}
                  >
                    <feat.icon className="h-5.5 w-5.5 text-white" style={{ width: '1.375rem', height: '1.375rem' }} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--fm-text)] mb-2.5">{feat.title}</h3>
                  <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-14">
          <div className="section-divider mb-12 max-w-2xl mx-auto opacity-60" />

          <motion.div
            className="mb-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="badge-pill mx-auto w-fit mb-4">
              <CheckCircle2 className="h-3.5 w-3.5" />
              How It Works
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-[var(--fm-text)] max-w-2xl mx-auto leading-tight">
              From idea to thumbnail in{' '}
              <span className="gradient-primary-text">4 steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div
                  className="h-full p-6 text-center rounded-2xl border border-white/[0.07] group transition-all duration-200 hover:border-violet-500/22 hover:-translate-y-1"
                  style={{ background: 'rgba(10, 8, 28, 0.7)' }}
                >
                  {/* Step number + icon */}
                  <div className="mx-auto mb-5 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/22 group-hover:border-violet-500/40 transition-colors"
                      style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                      <step.icon className="h-5 w-5 text-[var(--fm-primary-light)]" />
                    </div>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold border border-violet-500/25 text-violet-400"
                      style={{ background: 'rgba(124, 58, 237, 0.12)' }}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--fm-text)] mb-2.5">{step.title}</h3>
                  <p className="text-xs text-[var(--fm-text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-14">
          <div className="section-divider mb-12 max-w-2xl mx-auto opacity-60" />

          <motion.div
            className="mb-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="badge-pill mx-auto w-fit mb-4">
              <Shield className="h-3.5 w-3.5" />
              Simple Pricing
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-[var(--fm-text)] max-w-2xl mx-auto">
              Plans for every{' '}
              <span className="gradient-primary-text">creator</span>
            </h2>
            <p className="mt-4 text-[var(--fm-text-secondary)] max-w-sm mx-auto">
              Start free, upgrade when you&apos;re ready. No surprises, no hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: '',
                desc: 'Perfect for trying out FrameMint',
                credits: 5,
                cta: 'Get Started',
                href: '/login',
                popular: false,
                features: [
                  '5 thumbnails per month',
                  'Basic styles (Cinematic, Minimal)',
                  'Standard resolution (720p)',
                  'FrameMint watermark',
                  'Community support',
                ],
              },
              {
                name: 'Pro',
                price: '₹499',
                period: '/mo',
                desc: 'For serious content creators',
                credits: 100,
                cta: 'Start Pro Trial',
                href: '/login',
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
                name: 'Enterprise',
                price: '₹1,999',
                period: '/mo',
                desc: 'For teams and agencies',
                credits: -1,
                cta: 'Contact Sales',
                href: '/login',
                popular: false,
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
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                    <span className="badge-pill bg-violet-600/30 border-violet-400/35 text-violet-200 text-xs px-4 py-1">
                      ✦ Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={`glass-card h-full p-7 flex flex-col ${plan.popular ? 'border-violet-500/30' : ''}`}
                  style={plan.popular ? { boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 8px 40px rgba(0,0,0,0.5)' } : undefined}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[var(--fm-text)] mb-1">{plan.name}</h3>
                    <p className="text-sm text-[var(--fm-text-secondary)]">{plan.desc}</p>
                  </div>
                  <div className="mb-7">
                    <span className="text-4xl font-bold text-[var(--fm-text)]">{plan.price}</span>
                    {plan.period && <span className="text-sm text-[var(--fm-text-secondary)]">{plan.period}</span>}
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
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'btn-primary' : 'btn-glass'}`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="relative mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:px-14">
          <div className="section-divider mb-20 max-w-2xl mx-auto opacity-60" />

          <motion.div
            className="mb-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="badge-pill mx-auto w-fit mb-4">
              <ChevronDown className="h-3.5 w-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl text-[var(--fm-text)]">
              Frequently asked{' '}
              <span className="gradient-primary-text">questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
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
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-4 w-4 text-[var(--fm-text-secondary)]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-white/5 pt-4">
                          <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-14">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <div className="relative overflow-hidden rounded-3xl p-px"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(37,99,235,0.35) 50%, rgba(124,58,237,0.18) 100%)' }}>
              <div className="relative rounded-[22px] overflow-hidden text-center px-8 py-16 sm:py-20"
                style={{ background: 'linear-gradient(135deg, rgba(14, 8, 38, 0.97) 0%, rgba(8, 6, 26, 0.97) 100%)' }}>
                {/* Background glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full blur-[80px]"
                    style={{ background: 'rgba(124, 58, 237, 0.22)' }} />
                  <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-[80px]"
                    style={{ background: 'rgba(37, 99, 235, 0.16)' }} />
                  <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-[80px]"
                    style={{ background: 'rgba(124, 58, 237, 0.14)' }} />
                  <div className="absolute inset-0 bg-dot-grid opacity-15" />
                </div>

                <div className="relative">
                  <div className="badge-pill mx-auto w-fit mb-6">
                    <Sparkles className="h-3.5 w-3.5" />
                    Join 10,000+ Creators
                  </div>
                  <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-[var(--fm-text)] max-w-2xl mx-auto leading-tight mb-5">
                    Ready to create thumbnails that{' '}
                    <span className="gradient-primary-text">actually get clicked?</span>
                  </h2>
                  <p className="text-[var(--fm-text-secondary)] mb-9 max-w-md mx-auto">
                    Start with 5 free credits. No credit card required. Join thousands of creators already winning.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <Link href="/login" className="btn-primary text-[0.95rem] py-3.5 px-9">
                      <Sparkles className="h-4 w-4" />
                      Start Creating Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setShowDemo(true)}
                      className="btn-glass text-[0.95rem] py-3.5 px-7"
                    >
                      View Demo
                    </button>
                  </div>
                  <p className="mt-6 text-xs text-[var(--fm-text-muted)]">No credit card • 5 free thumbnails • Cancel anytime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </div>
  );
}
