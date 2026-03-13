'use client';

import { useState, useCallback } from 'react';
import type { ThumbnailStyle, Platform } from '@/types';

interface Variant {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

interface GenerationResult {
  id: string;
  title: string;
  status: 'completed' | 'failed';
  enhancedPrompt: string;
  suggestedText: string[];
  suggestedColors: string[];
  variants: Variant[];
  creditsUsed: number;
  creditsRemaining: number;
}

interface UseGenerationReturn {
  generate: (params: {
    title: string;
    style: ThumbnailStyle;
    platform: Platform;
  }) => Promise<GenerationResult | null>;
  isGenerating: boolean;
  error: string | null;
  result: GenerationResult | null;
  reset: () => void;
}

export function useGeneration(): UseGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generate = useCallback(
    async (params: {
      title: string;
      style: ThumbnailStyle;
      platform: Platform;
    }): Promise<GenerationResult | null> => {
      setIsGenerating(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch('/api/generate/thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: params.title,
            style: params.style,
            platform: params.platform,
            variants: 4,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const message =
            data.error || `Generation failed (${response.status})`;
          setError(message);
          return null;
        }

        setResult(data as GenerationResult);
        return data as GenerationResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Network error — please try again';
        setError(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setResult(null);
  }, []);

  return { generate, isGenerating, error, result, reset };
}
