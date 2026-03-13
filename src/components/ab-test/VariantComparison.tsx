'use client';

import { ArrowLeftRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface VariantComparisonProps {
  variantA: {
    imageUrl: string;
    label?: string;
  };
  variantB: {
    imageUrl: string;
    label?: string;
  };
  title?: string;
}

export function VariantComparison({
  variantA,
  variantB,
  title = 'Side-by-Side Comparison',
}: VariantComparisonProps) {
  return (
    <GlassCard hover={false} className="p-6">
      <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <ArrowLeftRight className="inline h-5 w-5 mr-2 text-[var(--fm-secondary)]" />
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {[variantA, variantB].map((v, i) => (
          <div key={i} className="space-y-2">
            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.imageUrl}
                alt={v.label || `Variant ${i === 0 ? 'A' : 'B'}`}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs font-bold text-white">
                {v.label || (i === 0 ? 'A' : 'B')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
