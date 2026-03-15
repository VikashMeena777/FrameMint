import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms of Service — FrameMint',
  description: 'Terms and conditions for using the FrameMint thumbnail generation service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <nav className="glass-navbar sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          FrameMint
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--fm-text)] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Terms of Service
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--fm-text-secondary)]">
          <p>Last updated: March 2025</p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FrameMint, you agree to be bound by these terms. If you do not agree,
            please do not use our services.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">2. Service Description</h2>
          <p>
            FrameMint provides AI-powered thumbnail generation for content creators. We offer free and
            paid plans with varying usage limits, styles, and features including A/B testing and
            video-to-thumbnail extraction.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">3. User Accounts</h2>
          <p>
            You must provide accurate information when creating an account. You are responsible for
            maintaining the security of your account credentials. Notify us immediately of any
            unauthorized access.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">4. Content Ownership</h2>
          <p>
            You retain ownership of the thumbnails you create using FrameMint. By using our service,
            you grant us a limited license to store and process your content solely for service delivery.
            We do not claim ownership of your generated content.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">5. Acceptable Use</h2>
          <p>
            You agree not to use FrameMint to generate content that is illegal, harmful, or violates
            the intellectual property rights of others. We reserve the right to suspend accounts that
            violate these guidelines.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">6. Payments & Refunds</h2>
          <p>
            Paid plans are billed monthly via Cashfree. Credits are allocated upon payment and do not
            carry over between billing periods. Refunds may be issued within 7 days of purchase for
            unused credits.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">7. Limitation of Liability</h2>
          <p>
            FrameMint is provided &ldquo;as is&rdquo; without warranties. We are not liable for any
            indirect, incidental, or consequential damages arising from your use of the service.
          </p>

          <h2 className="text-lg font-semibold text-[var(--fm-text)]">8. Contact</h2>
          <p>
            For questions about these terms, email{' '}
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
