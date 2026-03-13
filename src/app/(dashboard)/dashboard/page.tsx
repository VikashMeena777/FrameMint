'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Image, TrendingUp, Clock, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreditMeter } from '@/components/billing/CreditMeter';
import { useUser } from '@/hooks/useUser';
import { useCredits } from '@/hooks/useCredits';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
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
      label: 'Thumbnails Created',
      value: statsLoading ? '—' : String(stats?.thumbnailCount ?? 0),
      icon: Image,
      color: 'text-[var(--fm-primary)]',
    },
    {
      label: 'Credits Used',
      value: statsLoading ? '—' : String(stats?.totalCreditsUsed ?? 0),
      icon: TrendingUp,
      color: 'text-[var(--fm-secondary)]',
    },
    {
      label: 'Time Saved',
      value: statsLoading
        ? '—'
        : stats?.timeSavedHours
          ? `${stats.timeSavedHours} hrs`
          : '0 hrs',
      icon: Clock,
      color: 'text-[var(--fm-success)]',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <GlassCard hover={false} className="p-6 gradient-pro border-[var(--fm-primary)]/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-sm text-[var(--fm-text-secondary)]">
                Ready to create your next viral thumbnail?
              </p>
            </div>
            <Link
              href="/create"
              className="btn-primary flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Thumbnail
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats + Credits */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Credit meter card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <GlassCard hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[var(--fm-primary)]" />
              <span className="text-sm font-medium text-[var(--fm-text)]">Credits</span>
            </div>
            {creditsLoading ? (
              <div className="space-y-2">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-2 w-40" />
              </div>
            ) : credits ? (
              <CreditMeter
                remaining={credits.remaining}
                total={credits.total}
                size="md"
                showLabel={false}
              />
            ) : null}
            {credits && (
              <p className="mt-3 text-xs text-[var(--fm-text-secondary)]">
                {credits.remaining} of {credits.total} credits remaining
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Stats */}
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <GlassCard hover={false} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm text-[var(--fm-text-secondary)]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--fm-text)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stat.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Thumbnails */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Recent Thumbnails
          </h2>
          <Link
            href="/gallery"
            className="text-sm text-[var(--fm-primary-light)] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--fm-primary)]" />
          </div>
        ) : stats?.recentThumbnails && stats.recentThumbnails.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentThumbnails.map((thumb, i) => {
              const firstVariant = thumb.thumbnail_variants?.[0];
              return (
                <motion.div key={thumb.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 6}>
                  <GlassCard className="overflow-hidden group">
                    <div className="aspect-video relative bg-white/5 overflow-hidden">
                      {firstVariant?.image_url ? (
                        <img
                          src={firstVariant.image_url}
                          alt={thumb.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-8 w-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-[var(--fm-text)] line-clamp-1">
                        {thumb.title}
                      </p>
                      <p className="text-xs text-[var(--fm-text-secondary)] mt-1">
                        {formatTimeAgo(thumb.created_at)}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard hover={false} className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fm-primary)]/10">
              <Image className="h-8 w-8 text-[var(--fm-primary-light)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No thumbnails yet
            </h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-6 max-w-sm mx-auto">
              Create your first AI-generated thumbnail. It only takes 10 seconds!
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create Your First Thumbnail
            </Link>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
