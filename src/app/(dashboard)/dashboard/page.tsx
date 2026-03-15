'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Image, TrendingUp, Clock, Plus, ArrowRight, Loader2, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
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
    style: string;
    platform: string;
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
      label: 'Thumbnails',
      value: statsLoading ? null : String(stats?.thumbnailCount ?? 0),
      icon: Image,
      color: 'from-violet-500 to-purple-600',
      glow: 'rgba(124, 58, 237, 0.25)',
      textColor: 'text-violet-300',
    },
    {
      label: 'Credits Used',
      value: statsLoading ? null : String(stats?.totalCreditsUsed ?? 0),
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      glow: 'rgba(37, 99, 235, 0.25)',
      textColor: 'text-blue-300',
    },
    {
      label: 'Time Saved',
      value: statsLoading ? null : stats?.timeSavedHours ? `${stats.timeSavedHours}h` : '0h',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16, 185, 129, 0.25)',
      textColor: 'text-emerald-300',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/15 p-6"
          style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)' }}>
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--fm-text-secondary)] mb-1">Welcome back</p>
              <h1 className="text-2xl font-bold text-[var(--fm-text)]">
                {firstName} 👋
              </h1>
              <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
                Ready to create your next viral thumbnail?
              </p>
            </div>
            <Link href="/create" className="btn-primary shrink-0 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Thumbnail
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Credits card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="glass rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-[var(--fm-text)]">Credits</span>
              </div>
              <Link href="/settings/billing" className="text-[10px] text-[var(--fm-primary-light)] hover:underline">
                Upgrade
              </Link>
            </div>
            {creditsLoading ? (
              <div className="space-y-2">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-2 w-full" />
              </div>
            ) : credits ? (
              <>
                <CreditMeter remaining={credits.remaining} total={credits.total} size="md" showLabel={false} />
                <p className="mt-3 text-xs text-[var(--fm-text-secondary)]">
                  <span className="text-[var(--fm-text)] font-semibold">{credits.remaining}</span> of {credits.total} remaining
                </p>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* Stat cards */}
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <div className="glass rounded-2xl p-5 h-full">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                style={{ boxShadow: `0 6px 16px ${stat.glow}` }}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                {stat.value === null ? (
                  <div className="skeleton h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold stat-number">{stat.value}</p>
                )}
                <p className="text-xs text-[var(--fm-text-secondary)] mt-1">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Thumbnails */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--fm-text)]">Recent Thumbnails</h2>
          <Link href="/gallery" className="flex items-center gap-1 text-sm text-[var(--fm-primary-light)] hover:text-[var(--fm-text)] transition-colors">
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
              return (
                <motion.div key={thumb.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 6}>
                  <div className="glass glass-hover rounded-2xl overflow-hidden group cursor-pointer">
                    <div className="aspect-video relative bg-white/5 overflow-hidden">
                      {firstVariant?.image_url ? (
                        <img
                          src={firstVariant.image_url}
                          alt={thumb.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-8 w-8 text-white/15" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-[var(--fm-text)] line-clamp-1 mb-1">{thumb.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--fm-text-secondary)] capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/6">
                          {thumb.style}
                        </span>
                        <span className="text-[11px] text-[var(--fm-text-muted)]">{formatTimeAgo(thumb.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary opacity-80">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-base font-semibold text-[var(--fm-text)] mb-2">No thumbnails yet</h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-6 max-w-xs mx-auto">
              Create your first AI-generated thumbnail. It only takes about 30 seconds!
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create Your First Thumbnail
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
