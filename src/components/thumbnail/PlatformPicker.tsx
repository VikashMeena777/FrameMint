'use client';

import { Monitor } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types';

/* ─── Inline SVG platform icons (16×16 viewBox) ─── */

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M23.5 6.5a3.01 3.01 0 0 0-2.12-2.13C19.5 4 12 4 12 4s-7.5 0-9.38.37A3.01 3.01 0 0 0 .5 6.5S0 8.76 0 11v1.96c0 2.25.5 4.5.5 4.5a3.01 3.01 0 0 0 2.12 2.14C4.5 20 12 20 12 20s7.5 0 9.38-.4a3.01 3.01 0 0 0 2.12-2.14s.5-2.25.5-4.5V11c0-2.24-.5-4.5-.5-4.5Z"
        fill="#FF0000"
      />
      <path d="m9.6 15.6 6.26-3.6L9.6 8.4v7.2Z" fill="#fff" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <radialGradient id="ig" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)" />
      <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.5" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"
        fill="#0A66C2"
      />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.6 5.82s.51.49 1.86.49V8.3a4.45 4.45 0 0 1-2.6-.84v6.47a5.07 5.07 0 1 1-4.36-5.02v2.06a3.07 3.07 0 1 0 2.16 2.96V3.5h2.09c-.01.19 0 .39.03.58a4.45 4.45 0 0 0 .82 1.74Z"
        fill="currentColor"
      />
      <path
        d="M17.73 3.5h-2.09v11.93a3.07 3.07 0 0 1-5.23 2.2 3.07 3.07 0 0 0 5.23-2.2V3.5h2.09Z"
        fill="#FF004F"
      />
      <path
        d="M18.46 6.31a4.45 4.45 0 0 1-.82-1.74 4.7 4.7 0 0 1-.03-.58h-.88s.51.49 1.86.49V6.3l-.13.01Z"
        fill="#00F2EA"
      />
      <path
        d="M11.5 11.44v-2.07a5.12 5.12 0 0 0-.72-.05A5.07 5.07 0 0 0 7.22 19a5.07 5.07 0 0 1 4.28-7.56Z"
        fill="#00F2EA"
      />
    </svg>
  );
}

const PLATFORM_ICONS: Record<Platform, React.FC<{ className?: string }>> = {
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  tiktok: TikTokIcon,
  custom: ({ className }) => <Monitor className={className} />,
};

const platformList: { value: Platform; label: string; size: string }[] = [
  { value: 'youtube', label: 'YouTube', size: '1280×720' },
  { value: 'instagram', label: 'Instagram', size: '1080×1080' },
  { value: 'twitter', label: 'Twitter / X', size: '1200×675' },
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
        {platformList.map((p) => {
          const Icon = PLATFORM_ICONS[p.value];
          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={cn(
                'rounded-xl p-4 text-center transition-all duration-200 border flex flex-col items-center gap-2',
                value === p.value
                  ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
              )}
            >
              <Icon className="h-6 w-6" />
              <p className="text-sm font-medium text-[var(--fm-text)]">{p.label}</p>
              <p className="text-xs text-[var(--fm-text-secondary)]">{p.size}</p>
            </button>
          );
        })}
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
