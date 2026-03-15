'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Image, TrendingUp, Clock, Plus, ArrowRight, Loader2, Zap } from 'lucide-react';
import { CreditMeter } from '@/components/billing/CreditMeter';
import { useUser } from '@/hooks/useUser';
import { useCredits } from '@/hooks/useCredits';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface DashboardStats {
  thumbnailCount: number;
  totalCreditsUsed: number;
  timeSavedHours: number;
  recentThumbnails: Array<{
    id: string;
    title: string;
    style_preset: string;
    platform_preset: string;
    is_favourite: boolean;
    created_at: string;
    thumbnail_variants: Array<{
      id: string;
      image_url: string;
      variant_index: number;
    }>;
  }>;
}

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styleGradient: Record<string, string> = {
  cinematic: 'from-violet-700 to-indigo-800',
  gaming: 'from-emerald-600 to-teal-700',
  vlog: 'from-pink-600 to-rose-700',
  educational: 'from-blue-600 to-indigo-700',
  podcast: 'from-amber-600 to-orange-700',
  minimal: 'from-slate-600 to-zinc-700',
  'bold-text': 'from-red-600 to-orange-700',
  'split-screen': 'from-teal-600 to-purple-700',
};

export default function DashboardPage() {
  const { user } = useUser();
  const { credits, loading: creditsLoading } = useCredits();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/stats');
        if (res.ok) setStats(await res.json());
      } catch {
        // Stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Creator';

  const statCards = [
    {
      label: 'Thumbnails Created',
      value: statsLoading ? null : String(stats?.thumbnailCount ?? 0),
      icon: Image,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'rgba(124, 58, 237, 0.25)',
    },
    {
      label: 'Credits Used',
      value: statsLoading ? null : String(stats?.totalCreditsUsed ?? 0),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      glow: 'rgba(37, 99, 235, 0.25)',
    },
    {
      label: 'Time Saved',
      value: statsLoading ? null : stats?.timeSavedHours ? `${stats.timeSavedHours}h` : '0h',
      icon: Clock,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-7">

      {/* ── Welcome Banner ── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/16 p-6 sm:p-7"
          style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(37,99,235,0.06) 100%)' }}>
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-15" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/12 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-48 rounded-full bg-blue-600/08 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--fm-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">
                Welcome back
              </p>
              <h1 className="text-2xl font-bold text-[var(--fm-text)] mb-1">
                {firstName} ✦
              </h1>
              <p className="text-sm text-[var(--fm-text-secondary)]">
                Ready to create your next viral thumbnail?
              </p>
            </div>
            <Link href="/create" className="btn-primary shrink-0 flex items-center gap-2 py-3 px-5">
              <Plus className="h-4 w-4" />
              New Thumbnail
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Credits card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="glass rounded-2xl p-5 h-full hover:border-violet-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-md shadow-violet-900/30">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--fm-text)]">Credits</span>
              </div>
              <Link href="/settings/billing" className="text-[10px] font-semibold text-[var(--fm-primary-light)] hover:text-white transition-colors bg-violet-600/10 px-2 py-1 rounded-lg border border-violet-500/18">
                Upgrade
              </Link>
            </div>
            {creditsLoading ? (
              <div className="space-y-2.5">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-2 w-full" />
              </div>
            ) : credits ? (
              <>
                <CreditMeter remaining={credits.remaining} total={credits.total} size="md" showLabel={false} />
                <p className="mt-3 text-xs text-[var(--fm-text-secondary)]">
                  <span className="text-[var(--fm-text)] font-bold">{credits.remaining}</span>
                  <span className="mx-1">of</span>
                  {credits.total} remaining
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--fm-text-secondary)]">No credit data</p>
            )}
          </div>
        </motion.div>

        {/* Stat cards */}
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <div className="glass rounded-2xl p-5 h-full">
              <div
                className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}
                style={{ boxShadow: `0 6px 18px ${stat.glow}` }}
              >
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                {stat.value === null ? (
                  <div className="skeleton h-8 w-16 mb-1.5" />
                ) : (
                  <p className="text-2xl font-bold stat-number">{stat.value}</p>
                )}
                <p className="text-xs text-[var(--fm-text-secondary)] mt-1.5">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Recent Thumbnails ── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--fm-text)]">Recent Thumbnails</h2>
          <Link
            href="/gallery"
            className="flex items-center gap-1 text-sm text-[var(--fm-primary-light)] hover:text-[var(--fm-text)] transition-colors font-medium"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-[var(--fm-text-secondary)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--fm-primary)]" />
              <span className="text-sm">Loading thumbnails...</span>
            </div>
          </div>
        ) : stats?.recentThumbnails && stats.recentThumbnails.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentThumbnails.map((thumb, i) => {
              const firstVariant = thumb.thumbnail_variants?.[0];
              const gradClass = styleGradient[thumb.style_preset] || 'from-violet-700 to-indigo-800';
              return (
                <motion.div key={thumb.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 6}>
                  <div className="glass glass-hover rounded-2xl overflow-hidden group cursor-pointer">
                    <div className="aspect-video relative overflow-hidden">
                      {firstVariant?.image_url ? (
                        <img
                          src={firstVariant.image_url}
                          alt={thumb.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradClass}`}>
                          <Image className="h-8 w-8 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-[var(--fm-text)] line-clamp-1 mb-2">{thumb.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[var(--fm-text-secondary)] capitalize px-2 py-0.5 rounded-full bg-white/[0.045] border border-white/[0.06]">
                          {thumb.style_preset}
                        </span>
                        <span className="text-[10px] text-[var(--fm-text-muted)]">{formatTimeAgo(thumb.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary opacity-85 shadow-xl shadow-violet-900/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-base font-bold text-[var(--fm-text)] mb-2">No thumbnails yet</h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-7 max-w-xs mx-auto leading-relaxed">
              Create your first AI-generated thumbnail. It only takes about 30 seconds!
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create Your First Thumbnail
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}>
        <h2 className="text-base font-bold text-[var(--fm-text)] mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/create', label: 'Create Thumbnail', desc: 'Generate with AI in 30 sec', icon: Sparkles, gradient: 'from-violet-500 to-purple-600', glow: 'rgba(124,58,237,0.22)' },
            { href: '/gallery', label: 'Browse Gallery', desc: 'View all your thumbnails', icon: Image, gradient: 'from-blue-500 to-cyan-600', glow: 'rgba(37,99,235,0.22)' },
            { href: '/settings/billing', label: 'Manage Billing', desc: 'Upgrade or view credits', icon: Zap, gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.22)' },
          ].map((action, i) => (
            <motion.div key={action.href} variants={fadeUp} custom={i}>
              <Link href={action.href} className="glass glass-hover rounded-2xl p-4 flex items-center gap-4 group">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}
                  style={{ boxShadow: `0 6px 18px ${action.glow}` }}
                >
                  <action.icon className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--fm-text)]">{action.label}</p>
                  <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--fm-text-muted)] group-hover:text-[var(--fm-primary-light)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
