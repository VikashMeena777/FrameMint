/**
 * Style-aware prompt templates AND full style presets for thumbnail generation.
 *
 * Each preset contains:
 *   – Stable-diffusion prompt suffix
 *   – Generation parameters (guidance scale, inference steps)
 *   – Style-specific negative prompts
 *   – Default layout preference
 *   – Font family + colour palette
 */

import type { ThumbnailStyle, Platform } from '@/types';
import type { LayoutType } from './layout-engine';
import type { TextColors } from './text-renderer';

// ---------------------------------------------------------------------------
// Prompt context (public interface for consumers)
// ---------------------------------------------------------------------------

export interface PromptContext {
  title: string;
  style: ThumbnailStyle;
  platform: Platform;
}

// ---------------------------------------------------------------------------
// Full style preset
// ---------------------------------------------------------------------------

export interface StylePreset {
  /** SD prompt suffix appended to every generation prompt */
  promptSuffix: string;
  /** Classifier-free guidance scale sent to the model */
  guidanceScale: number;
  /** Number of denoising steps */
  inferenceSteps: number;
  /** Style-specific negative prompt (merged with global default) */
  negativePrompt: string;
  /** Preferred layout when Groq doesn't override */
  defaultLayout: LayoutType;
  /** Font family resolved at render time */
  fontFamily: string;
  /** Default colour palette for text overlays */
  colorPalette: TextColors;
}

const BASE_NEGATIVE =
  'text, watermark, logo, letters, words, blurry, low quality, deformed, ugly, nsfw, duplicate, morbid, mutilated';

export const STYLE_PRESETS: Record<ThumbnailStyle, StylePreset> = {
  cinematic: {
    promptSuffix:
      'cinematic movie poster style, dramatic lighting, lens flare, shallow depth of field, epic composition, dark moody tones, anamorphic bokeh, 8k',
    guidanceScale: 8.5,
    inferenceSteps: 25,
    negativePrompt: `${BASE_NEGATIVE}, cartoon, anime, flat colors, digital art`,
    defaultLayout: 'face-left-text-right',
    fontFamily: "'Oswald', 'Bebas Neue', Impact, sans-serif",
    colorPalette: { primary: '#FFD700', accent: '#FF4500', background: '#000000' },
  },
  gaming: {
    promptSuffix:
      'gaming thumbnail style, vibrant neon glow, dramatic explosions, intense energy, dark background with bright accents, glitch effects, RGB lighting, 8k',
    guidanceScale: 9.0,
    inferenceSteps: 25,
    negativePrompt: `${BASE_NEGATIVE}, realistic photo, muted colors, boring, dull`,
    defaultLayout: 'full-text-overlay',
    fontFamily: "'Russo One', 'Bangers', Impact, sans-serif",
    colorPalette: { primary: '#00FF88', accent: '#FF00FF', background: '#0a0a0a' },
  },
  vlog: {
    promptSuffix:
      'lifestyle vlog thumbnail, bright cheerful, natural lighting, warm color palette, clean background, friendly inviting composition, 8k',
    guidanceScale: 7.0,
    inferenceSteps: 22,
    negativePrompt: `${BASE_NEGATIVE}, studio, artificial, posed, stock photo, dark`,
    defaultLayout: 'face-left-text-right',
    fontFamily: "'Poppins', 'Montserrat', 'Arial Black', sans-serif",
    colorPalette: { primary: '#FFFFFF', accent: '#FF6B6B', background: '#222222' },
  },
  educational: {
    promptSuffix:
      'professional educational thumbnail, clean layout, bright colors, structured composition, modern flat design elements, clear visual hierarchy, 8k',
    guidanceScale: 7.5,
    inferenceSteps: 22,
    negativePrompt: `${BASE_NEGATIVE}, messy, cluttered, chaotic, dark, low contrast`,
    defaultLayout: 'center-subject-top-text',
    fontFamily: "'Space Grotesk', 'Montserrat', 'Arial Black', sans-serif",
    colorPalette: { primary: '#1A1A2E', accent: '#E94560', background: '#FFFFFF' },
  },
  podcast: {
    promptSuffix:
      'podcast cover art style, audio wave visualization, microphone imagery, dark gradient background, professional headshot framing, bold accent colors, 8k',
    guidanceScale: 7.0,
    inferenceSteps: 22,
    negativePrompt: `${BASE_NEGATIVE}, outdoor, action, sports, nature, bright`,
    defaultLayout: 'face-left-text-right',
    fontFamily: "'Syne', 'Oswald', Impact, sans-serif",
    colorPalette: { primary: '#E0E0E0', accent: '#BB86FC', background: '#121212' },
  },
  minimal: {
    promptSuffix:
      'minimalist design, lots of whitespace, simple geometric shapes, limited color palette, elegant composition, clean modern aesthetic, 8k',
    guidanceScale: 6.5,
    inferenceSteps: 20,
    negativePrompt: `${BASE_NEGATIVE}, busy, cluttered, neon, flashy, complex, detailed`,
    defaultLayout: 'center-subject-top-text',
    fontFamily: "'Montserrat', 'Space Grotesk', 'Arial Black', sans-serif",
    colorPalette: { primary: '#1A1A1A', accent: '#666666', background: '#F5F5F5' },
  },
  'bold-text': {
    promptSuffix:
      'bold text-heavy thumbnail design, large typography area, contrasting colors, impactful visual, gradient background, strong visual hierarchy, 8k',
    guidanceScale: 6.0,
    inferenceSteps: 20,
    negativePrompt: `${BASE_NEGATIVE}, detailed background, complex scene, photorealistic`,
    defaultLayout: 'full-text-overlay',
    fontFamily: "'Bangers', 'Russo One', Impact, sans-serif",
    colorPalette: { primary: '#FFFFFF', accent: '#FFD700', background: '#FF0050' },
  },
  'split-screen': {
    promptSuffix:
      'split-screen comparison layout, before and after style, dual composition, contrasting sides, clear dividing line, balanced visual weight, 8k',
    guidanceScale: 8.0,
    inferenceSteps: 24,
    negativePrompt: `${BASE_NEGATIVE}, single subject, uniform background, monochrome`,
    defaultLayout: 'split-screen',
    fontFamily: "'Barlow Condensed', 'Oswald', Impact, sans-serif",
    colorPalette: { primary: '#FFFFFF', accent: '#00E5FF', background: '#000000' },
  },
  custom: {
    promptSuffix: 'high quality, professional, 8k',
    guidanceScale: 7.5,
    inferenceSteps: 22,
    negativePrompt: BASE_NEGATIVE,
    defaultLayout: 'full-text-overlay',
    fontFamily: "'Exo 2', 'Bebas Neue', Impact, sans-serif",
    colorPalette: { primary: '#FFFFFF', accent: '#FF4444', background: '#000000' },
  },
};

// ---------------------------------------------------------------------------
// Platform dimensions
// ---------------------------------------------------------------------------

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  youtube:   { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1080 },
  twitter:   { width: 1600, height: 900 },
  linkedin:  { width: 1200, height: 627 },
  tiktok:    { width: 1080, height: 1920 },
  custom:    { width: 1280, height: 720 },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Build a generation-ready prompt from user input + style preset.
 */
export function buildPrompt(ctx: PromptContext): string {
  const preset = STYLE_PRESETS[ctx.style] || STYLE_PRESETS.cinematic;
  return `A professional thumbnail image for: "${ctx.title}". ${preset.promptSuffix}. High quality, professional photography, eye-catching design, scroll-stopping visual, no text, no watermark.`;
}

/**
 * Get the target dimensions for a platform preset.
 */
export function getDimensions(platform: Platform): { width: number; height: number } {
  return PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.youtube;
}

/**
 * Get the full style preset for a given style.
 */
export function getStylePreset(style: ThumbnailStyle): StylePreset {
  return STYLE_PRESETS[style] || STYLE_PRESETS.cinematic;
}
