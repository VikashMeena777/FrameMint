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
  Sparkles,
} from 'lucide-react';
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
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
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

const styleBadgeColor = (style: string) => {
  const map: Record<string, string> = {
    cinematic: 'bg-violet-500/12 text-violet-300 border-violet-500/20',
    gaming: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20',
    vlog: 'bg-pink-500/12 text-pink-300 border-pink-500/20',
    educational: 'bg-blue-500/12 text-blue-300 border-blue-500/20',
    podcast: 'bg-amber-500/12 text-amber-300 border-amber-500/20',
    minimal: 'bg-slate-500/12 text-slate-300 border-slate-500/20',
    'bold-text': 'bg-red-500/12 text-red-300 border-red-500/20',
    'split-screen': 'bg-cyan-500/12 text-cyan-300 border-cyan-500/20',
  };
  return map[style] || 'bg-white/8 text-white/50 border-white/10';
};

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
          <h1 className="text-xl font-bold text-[var(--fm-text)]">Gallery</h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-0.5">
            {filtered.length} thumbnail{filtered.length !== 1 ? 's' : ''}
            {favouritesOnly ? ' · favourites' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--fm-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search thumbnails..."
              className="glass-input py-2 pl-9 pr-4 text-sm w-48"
            />
          </div>

          {/* Favourites toggle */}
          <button
            onClick={() => setFavouritesOnly(!favouritesOnly)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all',
              favouritesOnly
                ? 'bg-rose-500/12 border-rose-500/30 text-rose-400'
                : 'bg-white/5 border-white/8 text-[var(--fm-text-secondary)] hover:bg-white/8 hover:text-[var(--fm-text)]'
            )}
            title={favouritesOnly ? 'Show all' : 'Favourites only'}
          >
            <Heart className={cn('h-4 w-4', favouritesOnly && 'fill-rose-400')} />
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/8 bg-white/3">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-all',
                view === 'grid' ? 'bg-violet-600/15 text-[var(--fm-primary-light)]' : 'text-[var(--fm-text-secondary)] hover:bg-white/5'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-all',
                view === 'list' ? 'bg-violet-600/15 text-[var(--fm-primary-light)]' : 'text-[var(--fm-text-secondary)] hover:bg-white/5'
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
          <div className="flex items-center gap-3 text-[var(--fm-text-secondary)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--fm-primary)]" />
            <span className="text-sm">Loading gallery...</span>
          </div>
        </div>
      )}

      {/* Error — show graceful empty state instead */}
      {error && !loading && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="glass rounded-2xl p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8">
              <Image className="h-8 w-8 text-[var(--fm-text-muted)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--fm-text)] mb-2">
              No generation history yet
            </h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-6 max-w-xs mx-auto">
              Your generated thumbnails will appear here. Start by creating your first one!
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create a Thumbnail
            </Link>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="glass rounded-2xl p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary opacity-80">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-base font-semibold text-[var(--fm-text)] mb-2">
              {favouritesOnly ? 'No favourites yet' : 'Your gallery is empty'}
            </h3>
            <p className="text-sm text-[var(--fm-text-secondary)] mb-6 max-w-xs mx-auto">
              {favouritesOnly
                ? 'Heart a thumbnail to save it here.'
                : 'Create your first thumbnail — it only takes seconds!'}
            </p>
            {!favouritesOnly && (
              <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Your First Thumbnail
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Grid / List */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className={cn(
            'grid gap-4',
            view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <div className={cn(
                      'glass glass-hover rounded-2xl overflow-hidden group',
                      view === 'list' && 'flex gap-0'
                    )}>
                      {/* Image */}
                      <div className={cn(
                        'relative overflow-hidden bg-white/4',
                        view === 'grid' ? 'aspect-video' : 'h-28 w-48 shrink-0'
                      )}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={thumb.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-white/15" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {imageUrl && (
                            <button
                              onClick={() => downloadImage(imageUrl, `${thumb.title.replace(/\s+/g, '-')}.png`)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {imageUrl && (
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {thumb.variants.length > 1 && (
                          <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/80">
                            {thumb.variants.length} variants
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <h3 className="text-sm font-semibold text-[var(--fm-text)] line-clamp-1" title={thumb.title}>
                            {thumb.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleFavourite(thumb.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Heart className={cn(
                                'h-3.5 w-3.5 transition-colors',
                                thumb.isFavourite ? 'text-rose-400 fill-rose-400' : 'text-[var(--fm-text-secondary)]'
                              )} />
                            </button>
                            <button
                              onClick={() => handleDelete(thumb.id)}
                              disabled={deletingId === thumb.id}
                              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors text-[var(--fm-text-secondary)] hover:text-red-400 disabled:opacity-40"
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
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', styleBadgeColor(thumb.style))}>
                            {thumb.style}
                          </span>
                          <span className="flex items-center gap-1 text-[var(--fm-text-muted)]">
                            <Clock className="h-3 w-3" />
                            {formatDate(thumb.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
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
