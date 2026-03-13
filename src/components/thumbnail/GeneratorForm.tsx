'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface GeneratorFormProps {
  onSubmit: (prompt: string) => void;
  isGenerating?: boolean;
  defaultValue?: string;
}

export function GeneratorForm({ onSubmit, isGenerating, defaultValue = '' }: GeneratorFormProps) {
  const [prompt, setPrompt] = useState(defaultValue);

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <GlassCard hover={false} className="p-6">
      <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <Wand2 className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
        What&apos;s your video about?
      </h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your video title or describe the thumbnail you want... e.g. 'I Built a $1M App in 30 Days'"
        className="glass-input w-full h-28 resize-none p-4 text-sm"
        disabled={isGenerating}
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[var(--fm-text-secondary)]">
          Tip: Include key visual elements, emotions, or text you want on the thumbnail.
        </p>
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}
