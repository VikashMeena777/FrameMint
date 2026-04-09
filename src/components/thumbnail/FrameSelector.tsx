'use client';

import { useState } from 'react';
import { Film, Check, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface Frame {
  path: string;      // URL or local path
  timestamp: number;  // seconds
  index: number;
}

interface FrameSelectorProps {
  frames: Frame[];
  maxSelections?: number;
  onSelect: (selected: Frame[]) => void;
  isLoading?: boolean;
}

export function FrameSelector({
  frames,
  maxSelections = 1,
  onSelect,
  isLoading = false,
}: FrameSelectorProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleFrame = (index: number) => {
    const next = new Set(selected);

    if (next.has(index)) {
      next.delete(index);
    } else {
      if (maxSelections === 1) {
        next.clear();
      } else if (next.size >= maxSelections) {
        return; // max reached
      }
      next.add(index);
    }

    setSelected(next);
    onSelect(frames.filter((_, i) => next.has(i)));
  };

  const formatTimestamp = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <GlassCard hover={false} className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--fm-primary)]" />
          <p className="text-sm text-[var(--fm-text-secondary)]">Extracting frames from video...</p>
        </div>
      </GlassCard>
    );
  }

  if (frames.length === 0) {
    return null;
  }

  return (
    <GlassCard hover={false} className="p-6">
      <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <Film className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
        Select a Frame
      </h2>
      <p className="text-xs text-[var(--fm-text-secondary)] mb-4">
        Choose {maxSelections === 1 ? 'a frame' : `up to ${maxSelections} frames`} to use as
        thumbnail base
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {frames.map((frame, i) => (
          <button
            key={frame.index}
            onClick={() => toggleFrame(i)}
            className={cn(
              'relative rounded-xl overflow-hidden border transition-all duration-200',
              selected.has(i)
                ? 'border-[var(--fm-primary)] ring-2 ring-[var(--fm-primary)]/30'
                : 'border-white/5 hover:border-white/10'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frame.path}
              alt={`Frame at ${formatTimestamp(frame.timestamp)}`}
              className="w-full h-auto aspect-video object-cover"
              loading="lazy"
            />

            {/* Timestamp badge */}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/80 font-mono">
              {formatTimestamp(frame.timestamp)}
            </div>

            {/* Selection check */}
            {selected.has(i) && (
              <div className="absolute top-1 right-1 h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
