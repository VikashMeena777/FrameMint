'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const demoThumbnails = [
  { title: 'I Built a $1M SaaS in 30 Days', style: 'Cinematic', gradient: 'from-violet-900 via-purple-800 to-indigo-900', accent: '#A78BFA' },
  { title: '10 JavaScript Tricks You Never Knew', style: 'Educational', gradient: 'from-blue-900 via-cyan-800 to-teal-900', accent: '#67E8F9' },
  { title: 'Minecraft Hardcore 100 Days', style: 'Gaming', gradient: 'from-emerald-900 via-green-800 to-teal-900', accent: '#6EE7B7' },
  { title: 'My Morning Routine Changed My Life', style: 'Vlog', gradient: 'from-pink-900 via-rose-800 to-red-900', accent: '#FDA4AF' },
];

function LoginForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirect);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/callback`,
          },
        });
        if (error) throw error;
        toast.success('Check your email for a confirmation link!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback?redirect=${redirect}` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--fm-bg)' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-2/5 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5"
        style={{ background: 'linear-gradient(155deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.04) 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-25" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-600/8 blur-3xl" />

        <div className="relative w-full max-w-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--fm-text)]">FrameMint</span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--fm-text)] mb-2 leading-tight">
            AI thumbnails that<br />actually get clicked
          </h2>
          <p className="text-sm text-[var(--fm-text-secondary)] mb-8 leading-relaxed">
            Used by 10,000+ creators to boost CTR by 3× on average.
          </p>

          {/* Mini thumbnail demo grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {demoThumbnails.map((t, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br ${t.gradient} border border-white/8`}
              >
                {/* Simulated thumbnail content */}
                <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm"
                      style={{ color: t.accent }}>
                      {t.style}
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                    {t.title}
                  </p>
                </div>
                {/* Subtle shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-white/8" />
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-2.5">
            {[
              'Generate 4 variants in under 30s',
              '8+ styles: cinematic, gaming, vlog...',
              'A/B test & pick the winner',
              'Export at 4K for any platform',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-violet-600/20 border border-violet-500/30"
                  style={{ width: '1.125rem', height: '1.125rem' }}>
                  <svg className="h-2.5 w-2.5 text-[var(--fm-primary-light)]" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-[var(--fm-text-secondary)]">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg">
              <Sparkles className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
            </div>
            <span className="text-lg font-bold text-[var(--fm-text)]">FrameMint</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[var(--fm-text)] mb-1.5">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-[var(--fm-text-secondary)]">
              {isLogin
                ? 'Sign in to continue creating thumbnails'
                : 'Start generating amazing thumbnails for free'}
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-white/10 bg-white/4 hover:bg-white/7 hover:border-white/15 transition-all duration-200 text-sm font-medium text-[var(--fm-text)] mb-5"
          >
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/6" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-[var(--fm-text-muted)]" style={{ background: 'var(--fm-bg)' }}>
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Full name — signup only */}
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-muted)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    autoComplete="name"
                    className="glass-input w-full py-3 pl-10 pr-4 text-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="glass-input w-full py-3 pl-10 pr-4 text-sm"
                  autoFocus={isLogin}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fm-text-secondary)]">
                  Password
                </label>
                {isLogin && (
                  <button type="button" className="text-xs text-[var(--fm-primary-light)] hover:text-[var(--fm-text)] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="glass-input w-full py-3 pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fm-text-muted)] hover:text-[var(--fm-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1.5 text-xs text-[var(--fm-text-muted)]">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm justify-center mt-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : isLogin ? 'Sign In' : 'Create Free Account'}
            </button>
          </form>

          {/* Toggle login/signup */}
          <p className="mt-5 text-center text-sm text-[var(--fm-text-secondary)]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setFullName(''); }}
              className="font-semibold text-[var(--fm-primary-light)] hover:text-[var(--fm-text)] transition-colors"
            >
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-[var(--fm-text-muted)]">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[var(--fm-text-secondary)] transition-colors">Terms</Link>
            {' & '}
            <Link href="/privacy" className="underline hover:text-[var(--fm-text-secondary)] transition-colors">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fm-bg)' }}>
        <div className="flex items-center gap-3 text-[var(--fm-text-secondary)]">
          <svg className="h-5 w-5 animate-spin text-[var(--fm-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
