'use client';

import { cn } from '@/lib/utils';

interface CreditMeterProps {
  remaining: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CreditMeter({
  remaining,
  total,
  size = 'md',
  showLabel = true,
}: CreditMeterProps) {
  const used = total - remaining;
  const percentage = Math.round((used / total) * 100);
  const isLow = remaining <= 1;
  const isMedium = remaining <= Math.floor(total * 0.3);

  const barColor = isLow
    ? 'bg-[var(--fm-accent)]'
    : isMedium
      ? 'bg-[var(--fm-warning)]'
      : 'bg-[var(--fm-primary)]';

  const glowColor = isLow
    ? 'shadow-[0_0_12px_rgba(255,107,107,0.3)]'
    : isMedium
      ? 'shadow-[0_0_12px_rgba(253,203,110,0.3)]'
      : 'shadow-[0_0_12px_rgba(108,92,231,0.3)]';

  const sizes = {
    sm: { height: 'h-1.5', width: 'w-24', text: 'text-xs' },
    md: { height: 'h-2', width: 'w-40', text: 'text-sm' },
    lg: { height: 'h-3', width: 'w-56', text: 'text-base' },
  };

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('font-medium text-[var(--fm-text)]', sizes[size].text)}>
            Credits
          </span>
          <span className={cn('font-semibold', sizes[size].text, isLow ? 'text-[var(--fm-accent)]' : 'text-[var(--fm-text)]')}>
            {remaining}/{total}
          </span>
        </div>
      )}
      <div
        className={cn(
          'rounded-full bg-white/5 overflow-hidden',
          sizes[size].height,
          sizes[size].width
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            sizes[size].height,
            barColor,
            glowColor
          )}
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
    </div>
  );
}
