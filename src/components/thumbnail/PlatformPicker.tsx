'use client';

import { Monitor } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types';

const platformList: { value: Platform; label: string; size: string }[] = [
  { value: 'youtube', label: 'YouTube', size: '1920×1080' },
  { value: 'instagram', label: 'Instagram', size: '1080×1080' },
  { value: 'twitter', label: 'Twitter', size: '1200×675' },
  { value: 'linkedin', label: 'LinkedIn', size: '1200×627' },
  { value: 'tiktok', label: 'TikTok', size: '1080×1920' },
];

interface PlatformPickerProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  showCard?: boolean;
}

export function PlatformPicker({ value, onChange, showCard = true }: PlatformPickerProps) {
  const content = (
    <>
      {showCard && (
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <Monitor className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
          Select Platform
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {platformList.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={cn(
              'rounded-xl p-4 text-center transition-all duration-200 border',
              value === p.value
                ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
            )}
          >
            <p className="text-sm font-medium text-[var(--fm-text)]">{p.label}</p>
            <p className="text-xs text-[var(--fm-text-secondary)] mt-1">{p.size}</p>
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

export { platformList };
