import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Mail, MessageCircle, HelpCircle, ArrowRight, Clock, MapPin, Send } from 'lucide-react';

export const metadata = {
  title: 'Contact — FrameMint',
  description: 'Get in touch with the FrameMint team. Reach out for support, partnerships, or general inquiries.',
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    desc: 'For support, partnerships, or general questions.',
    action: 'support@framemint.com',
    href: 'mailto:support@framemint.com',
    color: '#8B5CF6',
  },
  {
    icon: MessageCircle,
    title: 'Discord Community',
    desc: 'Join our Discord for real-time help and creator tips.',
    action: 'Join Discord',
    href: 'https://discord.gg/framemint',
    color: '#5865F2',
  },
  {
    icon: HelpCircle,
    title: 'Help Center',
    desc: 'Browse FAQs and documentation for quick answers.',
    action: 'View Help Docs',
    href: '/terms',
    color: '#10B981',
  },
];

const faqs = [
  {
    q: 'How many thumbnails do I get per generation?',
    a: 'Each generation produces 4 unique thumbnail variants with different visual concepts, text overlays, and layouts for maximum variety.',
  },
  {
    q: 'What platforms are supported?',
    a: 'FrameMint supports YouTube (1280×720), Instagram (1080×1080), TikTok (1080×1920), Twitter/X (1200×675), and LinkedIn (1200×627).',
  },
  {
    q: 'Can I use the thumbnails commercially?',
    a: 'Absolutely. All generated thumbnails are yours to use however you want — on your channel, in ads, on social media, or anywhere else.',
  },
  {
    q: 'How do I get support for billing issues?',
    a: 'Email us at support@framemint.com with your account email and we\'ll resolve any billing issues within 24 hours.',
  },
  {
    q: 'Do you use my images for AI training?',
    a: 'Never. Your thumbnails and prompts are private. We do not use any user-generated content for model training.',
  },
];

export default function ContactPage() {
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
            <Send className="h-3.5 w-3.5" />
            Get In Touch
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold gradient-hero-text mb-6 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            We&apos;d love to hear from you
          </h1>
          <p className="text-lg text-[var(--fm-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about features, pricing, or anything else — our team is
            ready to help. Reach out through any of the channels below.
          </p>
        </section>

        {/* Contact methods */}
        <section className="py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {contactMethods.map((m) => (
              <a
                key={m.title}
                href={m.href}
                target={m.href.startsWith('http') ? '_blank' : undefined}
                rel={m.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="glass-card p-7 group cursor-pointer block"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${m.color}18`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon className="h-5.5 w-5.5" style={{ color: m.color, width: '22px', height: '22px' }} />
                </div>
                <h3 className="text-base font-bold text-[var(--fm-text)] mb-1.5">{m.title}</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed mb-4">{m.desc}</p>
                <span className="text-sm font-semibold" style={{ color: m.color }}>
                  {m.action} →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Response time & location */}
        <section className="py-12">
          <div className="glass rounded-2xl p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/25 shrink-0">
                <Clock className="h-5 w-5 text-[var(--fm-primary-light)]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--fm-text)] mb-1">Response Time</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">
                  We typically respond within 24 hours on business days. For urgent issues,
                  reach out via Discord for the fastest response.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 border border-emerald-500/25 shrink-0">
                <MapPin className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--fm-text)] mb-1">Location</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">
                  FrameMint is a remote-first company serving creators worldwide.
                  Our team operates across multiple time zones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--fm-text)] mb-10 text-center"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[var(--fm-text)] mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--fm-text-secondary)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold gradient-primary-text mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Still have questions?
          </h2>
          <p className="text-[var(--fm-text-secondary)] mb-8 max-w-md mx-auto">
            Drop us an email and we&apos;ll get back to you as soon as possible.
          </p>
          <a href="mailto:support@framemint.com" className="btn-primary text-base py-3 px-8">
            Email Us
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
