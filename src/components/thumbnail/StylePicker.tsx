'use client';

import { Image } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { ThumbnailStyle } from '@/types';

const thumbnailStyles: { value: ThumbnailStyle; label: string; gradient: string }[] = [
  { value: 'cinematic', label: 'Cinematic', gradient: 'from-purple-600 to-blue-500' },
  { value: 'gaming', label: 'Gaming', gradient: 'from-green-500 to-cyan-500' },
  { value: 'vlog', label: 'Vlog', gradient: 'from-pink-500 to-orange-400' },
  { value: 'educational', label: 'Educational', gradient: 'from-blue-500 to-indigo-500' },
  { value: 'podcast', label: 'Podcast', gradient: 'from-amber-500 to-red-500' },
  { value: 'minimal', label: 'Minimal', gradient: 'from-gray-400 to-gray-600' },
  { value: 'bold-text', label: 'Bold Text', gradient: 'from-yellow-500 to-red-500' },
  { value: 'split-screen', label: 'Split Screen', gradient: 'from-teal-500 to-purple-500' },
];

interface StylePickerProps {
  value: ThumbnailStyle;
  onChange: (style: ThumbnailStyle) => void;
  showCard?: boolean;
}

export function StylePicker({ value, onChange, showCard = true }: StylePickerProps) {
  const content = (
    <>
      {showCard && (
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <Image className="inline h-5 w-5 mr-2 text-[var(--fm-secondary)]" />
          Choose a Style
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {thumbnailStyles.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              'rounded-xl p-3 text-center transition-all duration-200 border',
              value === s.value
                ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10 shadow-[0_0_20px_rgba(108,92,231,0.15)]'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
            )}
          >
            <div className={`mx-auto mb-2 h-12 w-full rounded-lg bg-gradient-to-br ${s.gradient} opacity-60`} />
            <span className="text-xs font-medium text-[var(--fm-text)]">{s.label}</span>
          </button>
        ))}
      </div>
    </>
  );

  if (!showCard) return content;

  return (
    <GlassCard hover={false} className="p-6">
      {content}
    </GlassCard>
  );
}

export { thumbnailStyles };
