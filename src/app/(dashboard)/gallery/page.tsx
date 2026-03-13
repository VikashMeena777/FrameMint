'use client';

import { useState } from 'react';
import {
  Image,
  Search,
  Heart,
  Download,
  Trash2,
  Grid3X3,
  LayoutList,
  Loader2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useGallery } from '@/hooks/useGallery';
import { toast } from 'sonner';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function styleBadgeColor(style: string) {
  const map: Record<string, string> = {
    cinematic: 'bg-amber-500/15 text-amber-400',
    gaming: 'bg-purple-500/15 text-purple-400',
    vlog: 'bg-pink-500/15 text-pink-400',
    educational: 'bg-blue-500/15 text-blue-400',
    podcast: 'bg-green-500/15 text-green-400',
    minimal: 'bg-gray-500/15 text-gray-400',
    'bold-text': 'bg-red-500/15 text-red-400',
    'split-screen': 'bg-cyan-500/15 text-cyan-400',
  };
  return map[style] || 'bg-white/10 text-white/60';
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    toast.error('Failed to download image');
  }
}

export default function GalleryPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { thumbnails, loading, error, hasMore, fetchMore, deleteThumbnail, toggleFavourite } =
    useGallery(favouritesOnly);

  // Client-side search filter
  const filtered = search.trim()
    ? thumbnails.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.prompt?.toLowerCase().includes(search.toLowerCase()) ||
          t.style?.toLowerCase().includes(search.toLowerCase())
      )
    : thumbnails;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteThumbnail(id);
    setDeletingId(null);
    if (ok) toast.success('Thumbnail deleted');
    else toast.error('Failed to delete thumbnail');
  };

  const handleFavourite = async (id: string) => {
    const ok = await toggleFavourite(id);
    if (!ok) toast.error('Failed to update favourite');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Gallery
          </h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            {filtered.length} thumbnail{filtered.length !== 1 ? 's' : ''}{' '}
            {favouritesOnly ? '(favourites)' : ''}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fm-text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="glass-input py-2 pl-9 pr-4 text-sm w-48"
            />
          </div>

          {/* Favourites toggle */}
          <button
            onClick={() => setFavouritesOnly(!favouritesOnly)}
            className={cn(
              'btn-glass p-2',
              favouritesOnly && 'bg-[var(--fm-accent)]/10 border-[var(--fm-accent)]/20'
            )}
            title={favouritesOnly ? 'Show all' : 'Show favourites'}
          >
            <Heart
              className={cn('h-4 w-4', favouritesOnly ? 'text-[var(--fm-accent)] fill-[var(--fm-accent)]' : '')}
            />
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 transition-colors',
                view === 'grid' ? 'bg-[var(--fm-primary)]/10 text-[var(--fm-primary)]' : 'text-[var(--fm-text-secondary)] hover:bg-white/5'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 transition-colors',
                view === 'list' ? 'bg-[var(--fm-primary)]/10 text-[var(--fm-primary)]' : 'text-[var(--fm-text-secondary)] hover:bg-white/5'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--fm-primary)]" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <GlassCard hover={false} className="p-8 text-center">
          <p className="text-[var(--fm-error)] mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-glass text-sm">
            Retry
          </button>
        </GlassCard>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <GlassCard hover={false} className="p-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--fm-primary)]/10">
              <Image className="h-10 w-10 text-[var(--fm-primary-light)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {favouritesOnly ? 'No favourites yet' : 'Your gallery is empty'}
            </h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-6 max-w-sm mx-auto">
              {favouritesOnly
                ? 'Heart a thumbnail to add it to your favourites.'
                : 'Create your first thumbnail and it will appear here.'}
            </p>
            {!favouritesOnly && (
              <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                <Image className="h-4 w-4" />
                Create Your First Thumbnail
              </Link>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Grid view */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div
            className={cn(
              'grid gap-4',
              view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((thumb, i) => {
                const firstVariant = thumb.variants[0];
                const imageUrl = firstVariant?.imageUrl;

                return (
                  <motion.div
                    key={thumb.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <GlassCard className="overflow-hidden group">
                      {/* Image */}
                      <div
                        className={cn(
                          'relative overflow-hidden bg-white/5',
                          view === 'grid' ? 'aspect-video' : 'h-24 w-40 shrink-0'
                        )}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={thumb.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-white/20" />
                          </div>
                        )}

                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {imageUrl && (
                            <button
                              onClick={() =>
                                downloadImage(imageUrl, `${thumb.title.replace(/\s+/g, '-')}.png`)
                              }
                              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {imageUrl && (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                              title="Open full size"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {/* Variant count badge */}
                        {thumb.variants.length > 1 && (
                          <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {thumb.variants.length} variants
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className="text-sm font-semibold text-[var(--fm-text)] line-clamp-1"
                            title={thumb.title}
                          >
                            {thumb.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleFavourite(thumb.id)}
                              className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                              title="Toggle favourite"
                            >
                              <Heart
                                className={cn(
                                  'h-3.5 w-3.5 transition-colors',
                                  firstVariant?.isFavourite
                                    ? 'text-[var(--fm-accent)] fill-[var(--fm-accent)]'
                                    : 'text-[var(--fm-text-secondary)]'
                                )}
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(thumb.id)}
                              disabled={deletingId === thumb.id}
                              className="p-1 rounded-lg hover:bg-red-500/10 transition-colors text-[var(--fm-text-secondary)] hover:text-red-400 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === thumb.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[var(--fm-text-secondary)]">
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', styleBadgeColor(thumb.style))}>
                            {thumb.style}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(thumb.createdAt)}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button onClick={fetchMore} className="btn-glass text-sm flex items-center gap-2">
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
