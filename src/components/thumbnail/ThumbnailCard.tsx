'use client';

import { Download, Heart, Share2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ThumbnailCardProps {
  imageUrl: string;
  label?: string;
  alt?: string;
  className?: string;
  onDownload?: () => void;
  onFavourite?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  isFavourited?: boolean;
  showActions?: boolean;
}

export function ThumbnailCard({
  imageUrl,
  label,
  alt = 'Thumbnail',
  className,
  onDownload,
  onFavourite,
  onShare,
  onEdit,
  isFavourited = false,
  showActions = true,
}: ThumbnailCardProps) {
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `framemint-thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden border border-white/5 bg-black',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {/* Overlay actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onFavourite}
            className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
            title="Favourite"
          >
            <Heart className={cn('h-5 w-5', isFavourited && 'fill-red-400 text-red-400')} />
          </button>
          <button
            onClick={handleShare}
            className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
              title="Edit"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Label */}
      {label && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-xs text-white/70">
          {label}
        </div>
      )}
    </div>
  );
}
