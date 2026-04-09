import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy — FrameMint',
  description: 'How FrameMint collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <nav className="glass-navbar sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          FrameMint
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--fm-text)] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Privacy Policy
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--fm-text-secondary)]">
          <p>Last updated: March 2025</p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">1. Information We Collect</h2>
          <p>
            We collect information you provide directly — your email address when you sign up, and any thumbnails
            or images you create using our service. We also collect usage data such as pages visited, features used,
            and device information through standard web analytics.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">2. How We Use Your Information</h2>
          <p>
            Your information is used to provide and improve FrameMint&apos;s services, process payments,
            send important account notifications, and provide customer support. We never use your images
            or thumbnails for AI model training.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">3. Data Storage & Security</h2>
          <p>
            All data is stored securely using Supabase (PostgreSQL) with encryption at rest and in transit.
            Generated thumbnails are stored in secure cloud storage. We implement industry-standard
            security measures to protect your information.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">4. Third-Party Services</h2>
          <p>
            We use the following third-party services: Supabase (database & auth), Cashfree (payments),
            Google Gemini & Groq (AI generation), and Google Drive (storage). Each service has its own
            privacy policy governing the data they process.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">5. Your Rights</h2>
          <p>
            You can access, update, or delete your account and data at any time from your dashboard settings.
            To request a full data export or account deletion, contact us at support@framemint.com.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">6. Contact</h2>
          <p>
            For privacy-related questions, email us at{' '}
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
