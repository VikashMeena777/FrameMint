/**
 * Style-aware prompt templates for thumbnail generation.
 * Maps the 8 style presets from the PRD to stable-diffusion-optimised prompts.
 */

import type { ThumbnailStyle, Platform } from '@/types';

interface PromptContext {
  title: string;
  style: ThumbnailStyle;
  platform: Platform;
}

const STYLE_TEMPLATES: Record<string, string> = {
  cinematic:
    'cinematic movie poster style, dramatic lighting, lens flare, shallow depth of field, epic composition, dark moody tones, anamorphic bokeh',
  gaming:
    'gaming thumbnail style, vibrant neon glow, dramatic explosions, intense energy, dark background with bright accents, glitch effects, RGB lighting',
  vlog:
    'lifestyle vlog thumbnail, bright and cheerful, natural lighting, warm color palette, clean background, friendly and inviting composition',
  educational:
    'professional educational thumbnail, clean layout, bright colors, structured composition, modern flat design elements, clear visual hierarchy',
  podcast:
    'podcast cover art style, audio wave visualization, microphone imagery, dark gradient background, professional headshot framing, bold accent colors',
  minimal:
    'minimalist design, lots of whitespace, simple geometric shapes, limited color palette, elegant typography area, clean modern aesthetic',
  'bold-text':
    'bold text-heavy thumbnail design, large typography area, contrasting colors, impactful visual, gradient background, strong visual hierarchy',
  'split-screen':
    'split-screen comparison layout, before and after style, dual composition, contrasting sides, clear dividing line, balanced visual weight',
  custom: '',
};

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  youtube: { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1600, height: 900 },
  linkedin: { width: 1200, height: 627 },
  tiktok: { width: 1080, height: 1920 },
  custom: { width: 1280, height: 720 },
};

/**
 * Build a generation-ready prompt from user input + style preset.
 */
export function buildPrompt(ctx: PromptContext): string {
  const styleModifier = STYLE_TEMPLATES[ctx.style] || STYLE_TEMPLATES.cinematic;

  const basePrompt = `A professional thumbnail image for: "${ctx.title}". ${styleModifier}. High quality, 8k, professional photography, eye-catching design, scroll-stopping visual, no text, no watermark.`;

  return basePrompt;
}

/**
 * Get the target dimensions for a platform preset.
 */
export function getDimensions(platform: Platform): {
  width: number;
  height: number;
} {
  return PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.youtube;
}
