'use client';

import { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image,
  Monitor,
  Download,
  Heart,
  Share2,
  RotateCcw,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCredits } from '@/hooks/useCredits';
import { useGeneration } from '@/hooks/useGeneration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ThumbnailStyle, Platform } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const thumbnailStyles: { value: ThumbnailStyle; label: string; gradient: string; glow: string }[] = [
  { value: 'cinematic', label: 'Cinematic', gradient: 'from-violet-600 to-indigo-700', glow: 'rgba(124,58,237,0.3)' },
  { value: 'gaming', label: 'Gaming', gradient: 'from-emerald-500 to-cyan-600', glow: 'rgba(16,185,129,0.3)' },
  { value: 'vlog', label: 'Vlog', gradient: 'from-pink-500 to-rose-600', glow: 'rgba(244,63,94,0.3)' },
  { value: 'educational', label: 'Educational', gradient: 'from-blue-500 to-indigo-600', glow: 'rgba(37,99,235,0.3)' },
  { value: 'podcast', label: 'Podcast', gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.3)' },
  { value: 'minimal', label: 'Minimal', gradient: 'from-slate-500 to-zinc-600', glow: 'rgba(100,116,139,0.3)' },
  { value: 'bold-text', label: 'Bold Text', gradient: 'from-yellow-500 to-red-600', glow: 'rgba(239,68,68,0.3)' },
  { value: 'split-screen', label: 'Split Screen', gradient: 'from-teal-500 to-purple-600', glow: 'rgba(20,184,166,0.3)' },
];

const platforms: { value: Platform; label: string; size: string; emoji: string }[] = [
  { value: 'youtube', label: 'YouTube', size: '1280×720', emoji: '▶' },
  { value: 'instagram', label: 'Instagram', size: '1080×1080', emoji: '◻' },
  { value: 'twitter', label: 'Twitter', size: '1200×675', emoji: '✗' },
  { value: 'linkedin', label: 'LinkedIn', size: '1200×627', emoji: 'in' },
  { value: 'tiktok', label: 'TikTok', size: '1080×1920', emoji: '♪' },
];

const slideVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

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
      toast.success('Thumbnails generated!');
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

  const steps = [
    { n: 1, label: 'Describe' },
    { n: 2, label: 'Platform' },
    { n: 3, label: 'Results' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--fm-text)]">Create Thumbnail</h1>
          <p className="text-sm text-[var(--fm-text-secondary)] mt-0.5">Generate AI-powered thumbnails for any platform</p>
        </div>
        {credits && (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5">
            <Zap className="h-3.5 w-3.5 text-[var(--fm-primary-light)]" />
            <span className="text-xs font-semibold text-[var(--fm-text)]">{credits.remaining}</span>
            <span className="text-xs text-[var(--fm-text-muted)]">credits left</span>
          </div>
        )}
      </div>

      {/* Progress stepper */}
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  step > s.n
                    ? 'gradient-primary text-white'
                    : step === s.n
                      ? 'bg-violet-600/20 border border-violet-500/40 text-[var(--fm-primary-light)]'
                      : 'bg-white/5 border border-white/8 text-[var(--fm-text-muted)]'
                )}
              >
                {step > s.n ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : s.n}
              </div>
              <span className={cn(
                'hidden sm:block text-sm font-medium',
                step >= s.n ? 'text-[var(--fm-text)]' : 'text-[var(--fm-text-muted)]'
              )}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={cn('mx-3 h-px flex-1 w-12 transition-colors', step > s.n ? 'bg-violet-500/40' : 'bg-white/8')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Prompt & Style */}
        {step === 1 && (
          <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
            {/* Prompt */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/25">
                  <Wand2 className="h-4.5 w-4.5 text-[var(--fm-primary-light)]" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--fm-text)]">What&apos;s your video about?</h2>
                  <p className="text-xs text-[var(--fm-text-secondary)]">Describe it clearly for best results</p>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'I Built a $1M App in 30 Days' — be descriptive about emotions, style, key elements..."
                className="glass-input w-full h-28 resize-none p-4 text-sm leading-relaxed"
              />
              <p className="mt-2.5 text-xs text-[var(--fm-text-muted)]">
                💡 Include key emotions, visual elements, or text you want on the thumbnail
              </p>
            </div>

            {/* Style picker */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/25">
                  <Image className="h-4.5 w-4.5 text-blue-400" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--fm-text)]">Choose a Style</h2>
                  <p className="text-xs text-[var(--fm-text-secondary)]">Pick the visual direction for your thumbnail</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {thumbnailStyles.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={cn(
                      'rounded-xl p-3 text-center transition-all duration-200 border group',
                      style === s.value
                        ? 'border-violet-500/40 bg-violet-600/12 shadow-lg'
                        : 'border-white/6 bg-white/[0.02] hover:bg-white/5 hover:border-white/12'
                    )}
                    style={style === s.value ? { boxShadow: `0 4px 20px ${s.glow}` } : undefined}
                  >
                    <div className={`mx-auto mb-2.5 h-10 w-full rounded-lg bg-gradient-to-br ${s.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-xs font-semibold text-[var(--fm-text)]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!prompt.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
              >
                Next: Choose Platform
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Platform */}
        {step === 2 && (
          <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 border border-emerald-500/25">
                  <Monitor className="h-4.5 w-4.5 text-emerald-400" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--fm-text)]">Select Platform</h2>
                  <p className="text-xs text-[var(--fm-text-secondary)]">We&apos;ll optimize dimensions and layout</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      'rounded-xl p-4 text-center transition-all duration-200 border',
                      platform === p.value
                        ? 'border-violet-500/40 bg-violet-600/12 shadow-lg'
                        : 'border-white/6 bg-white/[0.02] hover:bg-white/5 hover:border-white/12'
                    )}
                  >
                    <div className="text-xl mb-1.5">{p.emoji}</div>
                    <p className="text-sm font-semibold text-[var(--fm-text)]">{p.label}</p>
                    <p className="text-[10px] text-[var(--fm-text-muted)] mt-0.5 font-mono">{p.size}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[var(--fm-text)] mb-4 uppercase tracking-wider text-[var(--fm-text-secondary)]">
                Generation Summary
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Prompt', value: prompt },
                  { label: 'Style', value: style.replace('-', ' ') },
                  { label: 'Platform', value: platforms.find(p => p.value === platform)?.label || platform },
                  { label: 'Credits cost', value: '1 credit', highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--fm-text-secondary)]">{label}</span>
                    <span className={cn(
                      'text-right max-w-[200px] truncate capitalize font-medium',
                      highlight ? 'text-[var(--fm-primary-light)]' : 'text-[var(--fm-text)]'
                    )}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generating progress */}
            {isGenerating && (
              <div className="glass rounded-2xl p-5 border border-violet-500/20">
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[var(--fm-primary)] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-[var(--fm-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--fm-text)]">Crafting your thumbnails...</p>
                    <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">
                      Enhancing prompt → Generating 4 variants → ~30–60 seconds
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {genError && !isGenerating && (
              <div className="glass rounded-2xl p-4 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Generation failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{genError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="btn-glass flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
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
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-[var(--fm-text)]">Your Thumbnails</h2>
                  <p className="text-xs text-[var(--fm-text-secondary)] mt-0.5">{result.variants.length} variants generated · {result.creditsUsed} credit used</p>
                </div>
                <button onClick={handleNewGeneration} className="btn-glass text-sm flex items-center gap-1.5 py-2 px-3">
                  <RotateCcw className="h-3.5 w-3.5" />
                  New
                </button>
              </div>

              {/* Enhanced prompt */}
              {result.enhancedPrompt && (
                <div className="mb-5 rounded-xl bg-white/3 border border-white/6 p-3.5">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--fm-text-muted)] mb-1.5 font-semibold">AI-Enhanced Prompt</p>
                  <p className="text-xs text-[var(--fm-text-secondary)] leading-relaxed line-clamp-2">{result.enhancedPrompt}</p>
                </div>
              )}

              {/* Suggested text overlays */}
              {result.suggestedText.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {result.suggestedText.map((text, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-violet-600/10 text-xs text-[var(--fm-primary-light)] border border-violet-500/20 font-medium">
                      {text}
                    </span>
                  ))}
                </div>
              )}

              {/* Thumbnails grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.variants.map((variant, i) => (
                  <div key={variant.id} className="group relative rounded-xl overflow-hidden border border-white/6 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variant.imageUrl}
                      alt={`Thumbnail variant ${i + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDownload(variant.imageUrl, i)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors shadow-lg"
                        title="Download"
                      >
                        <Download className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                      </button>
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors shadow-lg"
                        title="Favourite"
                      >
                        <Heart className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                      </button>
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors shadow-lg"
                        title="Share"
                      >
                        <Share2 className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                      </button>
                    </div>

                    {/* Variant label */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[11px] text-white/80 font-semibold">
                      V{i + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom info */}
              <div className="mt-5 flex items-center justify-between text-xs text-[var(--fm-text-muted)] pt-4 border-t border-white/5">
                <span>{result.creditsRemaining} credits remaining</span>
                <div className="flex gap-2">
                  <button onClick={handleNewGeneration} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <RotateCcw className="h-3 w-3" />
                    Generate More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
