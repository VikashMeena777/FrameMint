'use client';

import { useState } from 'react';
import { Beaker, Plus, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Variant {
  id: string;
  imageUrl: string;
}

interface ABTestCreatorProps {
  variants: Variant[];
  thumbnailId: string;
  onCreated?: (testId: string) => void;
}

export function ABTestCreator({ variants, thumbnailId, onCreated }: ABTestCreatorProps) {
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelect = (variantId: string) => {
    if (!selectedA) {
      setSelectedA(variantId);
    } else if (selectedA === variantId) {
      setSelectedA(null);
    } else if (!selectedB) {
      setSelectedB(variantId);
    } else if (selectedB === variantId) {
      setSelectedB(null);
    } else {
      // Replace B
      setSelectedB(variantId);
    }
  };

  const handleCreate = async () => {
    if (!selectedA || !selectedB) {
      toast.error('Please select two variants to compare');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbnailId,
          name: testName || `Test: ${new Date().toLocaleDateString()}`,
          variantAId: selectedA,
          variantBId: selectedB,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create test');
      }

      const data = await res.json();
      toast.success('A/B Test created!');
      onCreated?.(data.testId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <GlassCard hover={false} className="p-6">
      <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <Beaker className="inline h-5 w-5 mr-2 text-[var(--fm-secondary)]" />
        Create A/B Test
      </h2>
      <p className="text-xs text-[var(--fm-text-secondary)] mb-4">
        Select 2 variants to compare their performance
      </p>

      {/* Variant selection grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {variants.map((v) => {
          const isA = selectedA === v.id;
          const isB = selectedB === v.id;
          const isSelected = isA || isB;

          return (
            <button
              key={v.id}
              onClick={() => handleSelect(v.id)}
              className={cn(
                'relative rounded-xl overflow-hidden border transition-all',
                isSelected
                  ? 'border-[var(--fm-primary)] ring-2 ring-[var(--fm-primary)]/30'
                  : 'border-white/5 hover:border-white/10'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.imageUrl} alt="Variant" className="w-full h-auto aspect-video object-cover" />
              {isSelected && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[var(--fm-primary)] text-[10px] font-bold text-white">
                  {isA ? 'A' : 'B'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Test name input */}
      <input
        type="text"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
        placeholder="Test name (optional)"
        className="glass-input w-full p-3 text-sm mb-4"
      />

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!selectedA || !selectedB || isCreating}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create A/B Test
          </>
        )}
      </button>
    </GlassCard>
  );
}
