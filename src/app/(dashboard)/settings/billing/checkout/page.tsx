'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

type PaymentStatus = 'loading' | 'PAID' | 'ACTIVE' | 'EXPIRED' | 'FAILED' | 'error';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [plan, setPlan] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setMessage('No order ID found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/payments/verify?order_id=${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
          return;
        }

        setStatus(data.status);
        setPlan(data.plan || '');
        setMessage(data.message || '');
      } catch {
        setStatus('error');
        setMessage('Network error — please try again');
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto mt-12 space-y-6">
      <GlassCard hover={false} className="p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-[var(--fm-primary)]" />
            <h1
              className="text-2xl font-bold mt-4"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Verifying Payment...
            </h1>
            <p className="text-[var(--fm-text-secondary)] mt-2">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === 'PAID' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1
              className="text-2xl font-bold mt-4 text-[var(--fm-success)]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Payment Successful! 🎉
            </h1>
            <p className="text-[var(--fm-text-secondary)] mt-2">
              You&apos;ve been upgraded to the{' '}
              <span className="font-semibold text-[var(--fm-text)] capitalize">
                {plan}
              </span>{' '}
              plan.
            </p>
            <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
              {message}
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 mt-6 btn-primary px-6 py-3 rounded-xl text-sm font-semibold"
            >
              Start Creating
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === 'ACTIVE' && (
          <>
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-amber-400" />
            <h1
              className="text-2xl font-bold mt-4 text-amber-400"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Payment Pending
            </h1>
            <p className="text-[var(--fm-text-secondary)] mt-2">
              Your payment is still being processed. This page will update automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-glass px-6 py-2 rounded-xl text-sm"
            >
              Check Again
            </button>
          </>
        )}

        {(status === 'EXPIRED' || status === 'FAILED' || status === 'error') && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1
              className="text-2xl font-bold mt-4 text-red-400"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Payment Failed
            </h1>
            <p className="text-[var(--fm-text-secondary)] mt-2">
              {message || 'Something went wrong. Please try again.'}
            </p>
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-2 mt-6 btn-glass px-6 py-3 rounded-xl text-sm"
            >
              Back to Billing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </GlassCard>

      {/* Order reference */}
      {orderId && (
        <p className="text-xs text-center text-[var(--fm-text-secondary)]">
          Order ID: <code className="font-mono">{orderId}</code>
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto mt-12">
          <GlassCard hover={false} className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-[var(--fm-primary)]" />
            <h1
              className="text-2xl font-bold mt-4"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Loading...
            </h1>
          </GlassCard>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
