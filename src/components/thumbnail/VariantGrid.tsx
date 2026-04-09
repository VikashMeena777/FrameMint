'use client';

import { RotateCcw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThumbnailCard } from './ThumbnailCard';
import type { GenerationResult } from '@/types';

interface VariantGridProps {
  result: GenerationResult;
  onNewGeneration?: () => void;
  onFavourite?: (variantId: string) => void;
  onEdit?: (variantId: string) => void;
}

export function VariantGrid({ result, onNewGeneration, onFavourite, onEdit }: VariantGridProps) {
  return (
    <GlassCard hover={false} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Your Thumbnails
        </h2>
        {onNewGeneration && (
          <button
            onClick={onNewGeneration}
            className="btn-glass text-sm flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New
          </button>
        )}
      </div>

      {/* Enhanced prompt display */}
      {result.enhancedPrompt && (
        <div className="mb-4 rounded-lg bg-white/[0.03] border border-white/5 p-3">
          <p className="text-xs text-[var(--fm-text-secondary)] mb-1">AI-enhanced prompt</p>
          <p className="text-xs text-[var(--fm-text)]/70 line-clamp-2">
            {result.enhancedPrompt}
          </p>
        </div>
      )}

      {/* Suggested text overlays */}
      {result.suggestedText.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {result.suggestedText.map((text: string, i: number) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-[var(--fm-primary)]/10 text-xs text-[var(--fm-primary-light)] border border-[var(--fm-primary)]/20"
            >
              {text}
            </span>
          ))}
        </div>
      )}

      {/* Generated thumbnails grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {result.variants.map((variant: { id: string; imageUrl: string }, i: number) => (
          <ThumbnailCard
            key={variant.id}
            imageUrl={variant.imageUrl}
            label={`V${i + 1}`}
            alt={`Thumbnail variant ${i + 1}`}
            onFavourite={() => onFavourite?.(variant.id)}
            onEdit={() => onEdit?.(variant.id)}
          />
        ))}
      </div>

      {/* Credits used */}
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--fm-text-secondary)]">
        <span>
          {result.creditsUsed} credit used • {result.variants.length} variants generated
        </span>
        <span>{result.creditsRemaining} credits remaining</span>
      </div>
    </GlassCard>
  );
}
