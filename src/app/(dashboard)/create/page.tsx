'use client';

import { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image,
  Monitor,
  ChevronRight,
  Download,
  Heart,
  Share2,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCredits } from '@/hooks/useCredits';
import { useGeneration } from '@/hooks/useGeneration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ThumbnailStyle, Platform } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const thumbnailStyles: { value: ThumbnailStyle; label: string; gradient: string }[] = [
  { value: 'cinematic', label: 'Cinematic', gradient: 'from-purple-600 to-blue-500' },
  { value: 'gaming', label: 'Gaming', gradient: 'from-green-500 to-cyan-500' },
  { value: 'vlog', label: 'Vlog', gradient: 'from-pink-500 to-orange-400' },
  { value: 'educational', label: 'Educational', gradient: 'from-blue-500 to-indigo-500' },
  { value: 'podcast', label: 'Podcast', gradient: 'from-amber-500 to-red-500' },
  { value: 'minimal', label: 'Minimal', gradient: 'from-gray-400 to-gray-600' },
  { value: 'bold-text', label: 'Bold Text', gradient: 'from-yellow-500 to-red-500' },
  { value: 'split-screen', label: 'Split Screen', gradient: 'from-teal-500 to-purple-500' },
];

const platforms: { value: Platform; label: string; size: string }[] = [
  { value: 'youtube', label: 'YouTube', size: '1280×720' },
  { value: 'instagram', label: 'Instagram', size: '1080×1080' },
  { value: 'twitter', label: 'Twitter', size: '1200×675' },
  { value: 'linkedin', label: 'LinkedIn', size: '1200×627' },
  { value: 'tiktok', label: 'TikTok', size: '1080×1920' },
];

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ThumbnailStyle>('cinematic');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const { credits, refetch: refetchCredits } = useCredits();
  const { generate, isGenerating, error: genError, result, reset } = useGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt or video title');
      return;
    }
    if (credits && credits.remaining <= 0) {
      toast.error('No credits remaining. Upgrade your plan!');
      return;
    }

    const res = await generate({ title: prompt, style, platform });
    if (res) {
      setStep(3);
      toast.success('Thumbnails generated! 🎉');
      refetchCredits();
    } else if (genError) {
      toast.error(genError);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `framemint-${style}-${platform}-v${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleNewGeneration = () => {
    setStep(1);
    setPrompt('');
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Create Thumbnail
          </h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-1">
            Generate stunning thumbnails with AI
          </p>
        </div>
        {credits && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--fm-text-secondary)]">
            <Sparkles className="h-4 w-4 text-[var(--fm-primary)]" />
            {credits.remaining} credits remaining
          </div>
        )}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Prompt & Style' },
          { n: 2, label: 'Platform' },
          { n: 3, label: 'Results' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all',
                step >= s.n
                  ? 'gradient-primary text-white'
                  : 'bg-white/5 text-[var(--fm-text-secondary)]'
              )}
            >
              {s.n}
            </div>
            <span
              className={cn(
                'hidden sm:block text-sm',
                step >= s.n ? 'text-[var(--fm-text)]' : 'text-[var(--fm-text-secondary)]'
              )}
            >
              {s.label}
            </span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-[var(--fm-text-secondary)]" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Prompt & Style */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
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
              />
              <p className="mt-2 text-xs text-[var(--fm-text-secondary)]">
                Tip: Include key visual elements, emotions, or text you want on the thumbnail.
              </p>
            </GlassCard>

            <GlassCard hover={false} className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Image className="inline h-5 w-5 mr-2 text-[var(--fm-secondary)]" />
                Choose a Style
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {thumbnailStyles.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={cn(
                      'rounded-xl p-3 text-center transition-all duration-200 border',
                      style === s.value
                        ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10 shadow-[0_0_20px_rgba(108,92,231,0.15)]'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    )}
                  >
                    <div className={`mx-auto mb-2 h-12 w-full rounded-lg bg-gradient-to-br ${s.gradient} opacity-60`} />
                    <span className="text-xs font-medium text-[var(--fm-text)]">{s.label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!prompt.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                Next: Choose Platform
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Platform */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <GlassCard hover={false} className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Monitor className="inline h-5 w-5 mr-2 text-[var(--fm-primary)]" />
                Select Platform
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      'rounded-xl p-4 text-center transition-all duration-200 border',
                      platform === p.value
                        ? 'border-[var(--fm-primary)] bg-[var(--fm-primary)]/10'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    )}
                  >
                    <p className="text-sm font-medium text-[var(--fm-text)]">{p.label}</p>
                    <p className="text-xs text-[var(--fm-text-secondary)] mt-1">{p.size}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Summary */}
            <GlassCard hover={false} className="p-6">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--fm-text-secondary)]">Prompt</span>
                  <span className="text-[var(--fm-text)] max-w-xs truncate">{prompt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fm-text-secondary)]">Style</span>
                  <span className="text-[var(--fm-text)] capitalize">{style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fm-text-secondary)]">Platform</span>
                  <span className="text-[var(--fm-text)] capitalize">{platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fm-text-secondary)]">Credits cost</span>
                  <span className="text-[var(--fm-primary-light)] font-semibold">1 credit</span>
                </div>
              </div>
            </GlassCard>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-glass flex items-center gap-2">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Thumbnails
                  </>
                )}
              </button>
            </div>

            {/* Generating progress overlay */}
            {isGenerating && (
              <GlassCard hover={false} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--fm-primary)]/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[var(--fm-primary)] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-[var(--fm-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--fm-text)]">
                      AI is crafting your thumbnails...
                    </p>
                    <p className="text-xs text-[var(--fm-text-secondary)] mt-1">
                      Enhancing prompt → Generating 4 variants → This may take 30-60 seconds
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Error display */}
            {genError && !isGenerating && (
              <GlassCard hover={false} className="p-4 border-red-500/20">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Generation failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{genError}</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <GlassCard hover={false} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Your Thumbnails
                </h2>
                <button
                  onClick={handleNewGeneration}
                  className="btn-glass text-sm flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New
                </button>
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
                  {result.suggestedText.map((text, i) => (
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
                {result.variants.map((variant, i) => (
                  <div
                    key={variant.id}
                    className="group relative rounded-xl overflow-hidden border border-white/5 bg-black"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variant.imageUrl}
                      alt={`Thumbnail variant ${i + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDownload(variant.imageUrl, i)}
                        className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
                        title="Favourite"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      <button
                        className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Variant label */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-xs text-white/70">
                      V{i + 1}
                    </div>
                  </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
