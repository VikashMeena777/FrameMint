'use client';

import { Clapperboard, Gamepad2, Camera, GraduationCap, Mic2, Minus, Type, LayoutPanelLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { ThumbnailStyle } from '@/types';

const thumbnailStyles: { value: ThumbnailStyle; label: string; gradient: string; desc: string; icon: React.ElementType }[] = [
  { value: 'cinematic', label: 'Cinematic', gradient: 'from-purple-600 to-blue-500', desc: 'Epic movie poster look', icon: Clapperboard },
  { value: 'gaming', label: 'Gaming', gradient: 'from-green-500 to-cyan-500', desc: 'High-energy neon vibes', icon: Gamepad2 },
  { value: 'vlog', label: 'Vlog', gradient: 'from-pink-500 to-orange-400', desc: 'Warm, personal feel', icon: Camera },
  { value: 'educational', label: 'Educational', gradient: 'from-blue-500 to-indigo-500', desc: 'Clean & professional', icon: GraduationCap },
  { value: 'podcast', label: 'Podcast', gradient: 'from-amber-500 to-red-500', desc: 'Bold audio aesthetic', icon: Mic2 },
  { value: 'minimal', label: 'Minimal', gradient: 'from-gray-400 to-gray-600', desc: 'Less is more', icon: Minus },
  { value: 'bold-text', label: 'Bold Text', gradient: 'from-yellow-500 to-red-500', desc: 'Typography-first', icon: Type },
  { value: 'split-screen', label: 'Split Screen', gradient: 'from-teal-500 to-purple-500', desc: 'Before/after layout', icon: LayoutPanelLeft },
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
          Choose a Style
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {thumbnailStyles.map((s) => {
          const IconComp = s.icon;
          const isSelected = value === s.value;
          return (
            <button
              key={s.value}
              onClick={() => onChange(s.value)}
              className={cn(
                'group relative rounded-xl p-4 text-left transition-all duration-300 border overflow-hidden',
                isSelected
                  ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10 shadow-[0_0_24px_rgba(108,92,231,0.2)]'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10'
              )}
            >
              {/* Gradient accent strip */}
              <div className={cn(
                'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300',
                s.gradient,
                isSelected ? 'opacity-100' : 'group-hover:opacity-50'
              )} />

              {/* Icon with gradient background ring */}
              <div className={cn(
                'mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300',
                isSelected
                  ? `bg-gradient-to-br ${s.gradient} shadow-lg`
                  : 'bg-white/5 group-hover:bg-white/10'
              )}>
                <IconComp className={cn(
                  'h-5 w-5 transition-colors duration-300',
                  isSelected ? 'text-white' : 'text-[var(--fm-text-secondary)]'
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                'block text-sm font-medium transition-colors',
                isSelected ? 'text-[var(--fm-text)]' : 'text-[var(--fm-text-secondary)]'
              )}>
                {s.label}
              </span>

              {/* Description */}
              <span className="block text-[10px] text-[var(--fm-text-secondary)] mt-0.5 opacity-70">
                {s.desc}
              </span>

              {/* Selection indicator dot */}
              {isSelected && (
                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[var(--fm-primary)] shadow-[0_0_8px_var(--fm-primary)]" />
              )}
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

export { thumbnailStyles };
