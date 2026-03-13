'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Wand2,
  Download,
  Share2,
  ArrowLeft,
  FlaskConical,
  Heart,
  Trash2,
} from 'lucide-react';
import { ThumbnailEditor } from '@/components/editor/ThumbnailEditor';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface VariantData {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  format: string;
  isFavourite: boolean;
  sizeBytes: number | null;
}

interface ThumbnailData {
  id: string;
  title: string;
  prompt: string;
  style: string;
  platform: string;
  status: string;
  createdAt: string;
  variants: VariantData[];
}

export default function EditorByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<ThumbnailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);

  // Resolve params
  useEffect(() => {
    params.then((p) => setThumbnailId(p.id));
  }, [params]);

  // Fetch thumbnail data
  const fetchThumbnail = useCallback(async () => {
    if (!thumbnailId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/gallery?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const found = data.thumbnails?.find(
        (t: ThumbnailData) => t.id === thumbnailId
      );
      if (found) {
        setThumbnail(found);
      } else {
        setError('Thumbnail not found');
      }
    } catch {
      setError('Failed to load thumbnail');
    } finally {
      setLoading(false);
    }
  }, [thumbnailId]);

  useEffect(() => {
    fetchThumbnail();
  }, [fetchThumbnail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--fm-primary)]" />
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className="space-y-4">
        <GlassCard hover={false} className="p-12 text-center">
          <p className="text-[var(--fm-text-secondary)]">
            {error || 'Thumbnail not found'}
          </p>
          <button
            onClick={() => router.push('/gallery')}
            className="btn-primary mt-4 px-4 py-2 rounded-xl text-sm"
          >
            Back to Gallery
          </button>
        </GlassCard>
      </div>
    );
  }

  const currentVariant = thumbnail.variants[activeVariant];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="btn-glass p-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1
              className="text-2xl font-bold text-[var(--fm-text)]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Wand2 className="inline h-6 w-6 mr-2 text-[var(--fm-primary)]" />
              {thumbnail.title}
            </h1>
            <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
              {thumbnail.style} · {thumbnail.platform} ·{' '}
              {new Date(thumbnail.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-glass px-3 py-2 rounded-xl text-sm inline-flex items-center gap-1.5">
            <FlaskConical className="h-4 w-4" />
            A/B Test
          </button>
          <button className="btn-glass px-3 py-2 rounded-xl text-sm inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Variant selector */}
      {thumbnail.variants.length > 1 && (
        <GlassCard hover={false} className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-[var(--fm-text-secondary)] shrink-0 mr-1">
              Variants:
            </span>
            {thumbnail.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setActiveVariant(i)}
                className={cn(
                  'shrink-0 rounded-lg border-2 overflow-hidden transition-all',
                  i === activeVariant
                    ? 'border-[var(--fm-primary)] ring-2 ring-[var(--fm-primary)]/20'
                    : 'border-white/10 hover:border-white/30'
                )}
              >
                <img
                  src={v.imageUrl}
                  alt={`Variant ${i + 1}`}
                  className="w-20 h-12 object-cover"
                />
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Editor — render the currently active variant */}
      <ThumbnailEditor
        imageUrl={currentVariant?.imageUrl}
        width={currentVariant?.width || 1280}
        height={currentVariant?.height || 720}
      />
    </div>
  );
}
