import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About — FrameMint',
  description: 'FrameMint is an AI-powered thumbnail generation platform built for modern creators. Learn about our mission, values, and the technology behind click-worthy thumbnails.',
};

const values = [
  {
    icon: Sparkles,
    title: 'AI-First Design',
    desc: 'We combine cutting-edge AI models with proven design principles to generate thumbnails that actually get clicks.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'Speed & Simplicity',
    desc: 'From prompt to publish-ready thumbnail in under 60 seconds. No design skills required — just describe your video.',
    color: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Creator Privacy',
    desc: 'Your images are yours. We never use your thumbnails for training, and you can delete your data at any time.',
    color: '#10B981',
  },
  {
    icon: Globe,
    title: 'Platform Agnostic',
    desc: 'Optimized for YouTube, Instagram, TikTok, Twitter/X, and LinkedIn — one tool for every platform you publish on.',
    color: '#3B82F6',
  },
];

const stats = [
  { number: '50K+', label: 'Thumbnails Generated' },
  { number: '4', label: 'Variants Per Generation' },
  { number: '5', label: 'Platforms Supported' },
  { number: '<60s', label: 'Average Generation Time' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--fm-bg)' }}>
      {/* Navbar */}
      <nav className="glass-navbar sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          FrameMint
        </Link>
        <Link href="/create" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          Get Started <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 badge-pill mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            About FrameMint
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold gradient-hero-text mb-6 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Thumbnails that get clicks.<br />Built by AI, crafted for creators.
          </h1>
          <p className="text-lg text-[var(--fm-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            FrameMint is an AI-powered thumbnail generation platform that helps content creators
            produce professional, click-worthy thumbnails in seconds — no Photoshop, no templates,
            no design experience needed.
          </p>
        </section>

        {/* Stats */}
        <section className="py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center">
                <p className="stat-number text-3xl sm:text-4xl mb-1">{stat.number}</p>
                <p className="text-xs text-[var(--fm-text-secondary)] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="glass rounded-2xl p-8 sm:p-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--fm-text)] mb-6"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Our Mission
            </h2>
            <div className="space-y-4 text-[var(--fm-text-secondary)] leading-relaxed">
              <p>
                Every creator deserves thumbnails that match the quality of their content. But great
                thumbnail design has traditionally required expensive tools, design expertise, or
                hours of manual work. We built FrameMint to change that.
              </p>
              <p>
                Our AI engine analyzes your video title, understands the emotional hooks that drive
                clicks, and generates photorealistic thumbnails with optimized text overlays — all
                in under a minute. Each generation produces 4 distinct variants so you always have
                options to choose from.
              </p>
              <p>
                Whether you&apos;re a solo YouTuber, a podcast host, or a social media team managing
                multiple platforms, FrameMint gives you the design firepower of a professional
                creative agency at a fraction of the cost.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--fm-text)] mb-10 text-center"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="glass-card p-7 group">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-105"
                  style={{ background: `${v.color}18`, border: `1px solid ${v.color}30` }}
                >
                  <v.icon className="h-5 w-5" style={{ color: v.color }} />
                </div>
                <h3 className="text-base font-bold text-[var(--fm-text)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="py-16">
          <div className="glass rounded-2xl p-8 sm:p-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--fm-text)] mb-6"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              The Technology
            </h2>
            <div className="space-y-4 text-[var(--fm-text-secondary)] leading-relaxed">
              <p>
                FrameMint&apos;s pipeline combines multiple AI models working in concert:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--fm-primary)] shrink-0" />
                  <span><strong className="text-[var(--fm-text)]">Groq CTR Engine</strong> — Analyzes your title and generates click-optimized text overlays, layouts, and color schemes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--fm-blue)] shrink-0" />
                  <span><strong className="text-[var(--fm-text)]">Photorealistic Image AI</strong> — Creates DSLR-quality base images with natural lighting, realistic textures, and cinematic composition.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--fm-success)] shrink-0" />
                  <span><strong className="text-[var(--fm-text)]">Professional Text Rendering</strong> — SVG-based text overlays with semi-transparent panels, custom web fonts, and optimized readability.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--fm-warning)] shrink-0" />
                  <span><strong className="text-[var(--fm-text)]">Post-Processing</strong> — Automatic color correction, sharpening, and platform-specific dimension optimization.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold gradient-primary-text mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Ready to make thumbnails that get clicks?
          </h2>
          <p className="text-[var(--fm-text-secondary)] mb-8 max-w-md mx-auto">
            Join thousands of creators using FrameMint to stand out in the feed.
          </p>
          <Link href="/create" className="btn-primary text-base py-3 px-8">
            Start Creating — Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
