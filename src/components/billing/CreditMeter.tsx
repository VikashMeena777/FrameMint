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
  const remainingPercent = Math.round((remaining / total) * 100);
  const isLow = remaining <= 1;
  const isMedium = remaining <= Math.floor(total * 0.3);

  const barColor = isLow
    ? 'bg-rose-500'
    : isMedium
      ? 'bg-amber-500'
      : 'bg-gradient-to-r from-violet-500 to-purple-600';

  const glowShadow = isLow
    ? '0 0 12px rgba(244, 63, 94, 0.4)'
    : isMedium
      ? '0 0 12px rgba(245, 158, 11, 0.4)'
      : '0 0 12px rgba(124, 58, 237, 0.4)';

  const textColor = isLow
    ? 'text-rose-400'
    : isMedium
      ? 'text-amber-400'
      : 'text-[var(--fm-primary-light)]';

  const sizes = {
    sm: { height: 'h-1.5', width: 'w-24', text: 'text-xs' },
    md: { height: 'h-2', width: 'w-40', text: 'text-sm' },
    lg: { height: 'h-2.5', width: 'w-56', text: 'text-base' },
  };

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('font-medium text-[var(--fm-text)]', sizes[size].text)}>
            Credits
          </span>
          <span className={cn('font-bold tabular-nums', sizes[size].text, textColor)}>
            {remaining}<span className="font-normal text-[var(--fm-text-secondary)]">/{total}</span>
          </span>
        </div>
      )}
      <div className={cn('rounded-full overflow-hidden', sizes[size].height, sizes[size].width, 'bg-white/6')}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out', sizes[size].height, barColor)}
          style={{ width: `${remainingPercent}%`, boxShadow: glowShadow }}
        />
      </div>
    </div>
  );
}
