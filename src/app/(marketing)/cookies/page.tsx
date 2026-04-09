import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Cookie Policy — FrameMint',
  description: 'How FrameMint uses cookies and similar tracking technologies.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <nav className="glass-navbar sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          FrameMint
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--fm-text)] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Cookie Policy
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--fm-text-secondary)]">
          <p>Last updated: March 2025</p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            remember your preferences, keep you logged in, and understand how you use our service.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">2. Essential Cookies</h2>
          <p>
            We use essential cookies for authentication (Supabase session tokens) and security.
            These are required for the service to function and cannot be disabled.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">3. Analytics Cookies</h2>
          <p>
            We may use analytics cookies to understand usage patterns and improve our service.
            These help us track page views, feature usage, and performance metrics. No personally
            identifiable information is shared through analytics.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">4. Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Blocking essential cookies may
            prevent you from using certain features of FrameMint, such as staying logged in.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">5. Contact</h2>
          <p>
            For questions about our cookie policy, email{' '}
            <a href="mailto:support@framemint.com" className="text-[var(--fm-primary)] hover:underline">
              support@framemint.com
            </a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
