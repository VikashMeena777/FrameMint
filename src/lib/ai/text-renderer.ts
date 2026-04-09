/**
 * Text Renderer — composites CTR-optimized text onto thumbnail images.
 *
 * Uses sharp SVG composite (NOT diffusion models) to render crisp, readable text
 * with stroke outlines, drop shadows, and auto-sizing based on image dimensions.
 *
 * Font pipeline: loads bundled Google Font TTF files for SVG rendering via sharp.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import type { LayoutType } from './layout-engine';
import { calculateLayout } from './layout-engine';
import type { ThumbnailStyle } from '@/types';

// ---------------------------------------------------------------------------
// Font configuration
// ---------------------------------------------------------------------------

/** Absolute path to the bundled font directory */
const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'ai', 'fonts');

/**
 * Ensure fontconfig is set up for Vercel/Lambda environments.
 * Without this, Sharp's librsvg cannot find any fonts and text renders invisible.
 * Creates a minimal fontconfig.conf in tmpdir pointing to our bundled font dir.
 */
let fontconfigReady = false;
function ensureFontconfig(): void {
  if (fontconfigReady) return;

  try {
    const tmp = os.tmpdir();
    const tmpFontsDir = path.join(tmp, 'framemint-fonts');
    const configPath = path.join(tmp, 'framemint-fonts.conf');
    const cacheDir = path.join(tmp, 'framemint-fontcache');

    // Copy bundled fonts to tmp so fontconfig can reliably access them
    if (!fs.existsSync(tmpFontsDir)) {
      fs.mkdirSync(tmpFontsDir, { recursive: true });
      const fontFiles = fs.readdirSync(FONT_DIR).filter(f => f.endsWith('.ttf'));
      for (const file of fontFiles) {
        const src = path.join(FONT_DIR, file);
        const dest = path.join(tmpFontsDir, file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
        }
      }
      console.log(`[TextRenderer] Copied ${fs.readdirSync(tmpFontsDir).length} fonts to ${tmpFontsDir}`);
    }

    // Write minimal fontconfig pointing to our fonts
    if (!fs.existsSync(configPath)) {
      // Use forward slashes for fontconfig compatibility on all platforms
      const fontsPath = tmpFontsDir.replace(/\\/g, '/');
      const cachePath = cacheDir.replace(/\\/g, '/');
      const fontconfigXml = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${fontsPath}</dir>
  <cachedir>${cachePath}</cachedir>
  <config>
    <rescan><int>0</int></rescan>
  </config>
</fontconfig>`;
      fs.writeFileSync(configPath, fontconfigXml);
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log(`[TextRenderer] Created fontconfig.conf at ${configPath}`);
    }

    // Set env vars BEFORE Sharp/librsvg loads fontconfig
    process.env.FONTCONFIG_FILE = configPath;
    process.env.FONTCONFIG_PATH = tmp;

    fontconfigReady = true;
  } catch (err) {
    console.warn('[TextRenderer] Fontconfig setup failed:', err);
  }
}

/**
 * Module-level cache so each font is read from disk + base64-encoded ONCE
 * per Lambda warm instance (not per request). Saves ~2MB I/O per call.
 */
const fontCache = new Map<string, string>();

/**
 * Build a @font-face CSS block if the font file exists on disk,
 * embedding it as a base64 data URI so sharp's librsvg can resolve it.
 * Results are cached in memory across requests.
 */
function fontFaceCSS(family: string, filename: string): string {
  const cacheKey = `${family}:${filename}`;
  const cached = fontCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const filePath = path.join(FONT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fontCache.set(cacheKey, '');
    return '';
  }
  const b64 = fs.readFileSync(filePath).toString('base64');
  const css = `@font-face { font-family: '${family}'; src: url('data:font/truetype;base64,${b64}'); }`;
  fontCache.set(cacheKey, css);
  return css;
}

/**
 * Premium font collection — 12 Google Fonts, each chosen to match the
 * psychological profile of its thumbnail style.
 *
 * Font selection philosophy:
 *   cinematic   → Oswald         (cinematic condensed, poster-grade)
 *   gaming      → Russo One      (angular, tech-forward)
 *   vlog        → Poppins        (warm, rounded, approachable)
 *   educational → Space Grotesk  (technical clarity, modern geometric)
 *   podcast     → Syne           (editorial, sophisticated)
 *   minimal     → Montserrat     (versatile geometric sans-serif)
 *   bold-text   → Bangers        (maximum impact, comic-book energy)
 *   split-screen→ Barlow Cond.   (space-efficient, industrial)
 *   custom      → Exo 2          (neutral, futuristic)
 *
 * Fallback chain: bundled TTF → Bebas Neue → Anton → Impact → Arial Black
 */

/** All available fonts in the bundle */
const FONT_REGISTRY: Record<string, string> = {
  'Oswald':              'Oswald-Variable.ttf',
  'Russo One':           'RussoOne-Regular.ttf',
  'Poppins':             'Poppins-Bold.ttf',
  'Space Grotesk':       'SpaceGrotesk-Variable.ttf',
  'Syne':                'Syne-Variable.ttf',
  'Montserrat':          'Montserrat-Variable.ttf',
  'Bangers':             'Bangers-Regular.ttf',
  'Barlow Condensed':    'BarlowCondensed-Black.ttf',
  'Exo 2':               'Exo2-Variable.ttf',
  'Righteous':           'Righteous-Regular.ttf',
  'Bebas Neue':          'BebasNeue-Regular.ttf',
  'Anton':               'Anton-Regular.ttf',
};

/**
 * Map each style to a primary font + weight-appropriate fallbacks.
 */
const STYLE_FONTS: Record<string, { primary: string; fallback: string }> = {
  cinematic:      { primary: 'Oswald',           fallback: 'Bebas Neue' },
  gaming:         { primary: 'Russo One',        fallback: 'Bangers' },
  vlog:           { primary: 'Poppins',          fallback: 'Montserrat' },
  educational:    { primary: 'Space Grotesk',    fallback: 'Montserrat' },
  podcast:        { primary: 'Syne',             fallback: 'Oswald' },
  minimal:        { primary: 'Montserrat',       fallback: 'Space Grotesk' },
  'bold-text':    { primary: 'Bangers',          fallback: 'Russo One' },
  'split-screen': { primary: 'Barlow Condensed', fallback: 'Oswald' },
  custom:         { primary: 'Exo 2',            fallback: 'Bebas Neue' },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TextOverlays {
  primary: string;
  secondary?: string;
  emoji?: string;
}

export interface TextColors {
  primary: string;   // Main text color
  accent: string;    // Highlight / secondary color
  background: string; // Stroke / shadow color
}

export interface RenderTextOptions {
  imageBuffer: Buffer;
  width: number;
  height: number;
  textOverlays: TextOverlays;
  layout: LayoutType;
  colors: TextColors;
  style: ThumbnailStyle;
}

/**
 * Render text on top of a thumbnail image and return the composited buffer.
 */
export async function renderTextOverlay(opts: RenderTextOptions): Promise<Buffer> {
  // Set up fontconfig for Vercel/Lambda (fonts won't render without this)
  ensureFontconfig();

  const sharp = (await import('sharp')).default;

  const svgText = buildTextSVG(opts);
  console.log(`[TextRenderer] SVG overlay: ${svgText.length} chars, text="${opts.textOverlays.primary}"`);

  return sharp(opts.imageBuffer)
    .composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ])
    .toBuffer();
}

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

function buildTextSVG(opts: RenderTextOptions): string {
  const { width, height, textOverlays, layout, colors, style } = opts;
  const positions = calculateLayout(layout, width, height);

  // Determine font — try primary, then fallback, then system stack
  const fontMap = STYLE_FONTS[style] || STYLE_FONTS.cinematic;
  const primaryFile = FONT_REGISTRY[fontMap.primary];
  const fallbackFile = FONT_REGISTRY[fontMap.fallback];

  const primaryCSS = primaryFile ? fontFaceCSS(fontMap.primary, primaryFile) : '';
  const fallbackCSS = fallbackFile ? fontFaceCSS(fontMap.fallback, fallbackFile) : '';
  const fontFace = `${primaryCSS}\n${fallbackCSS}`.trim();

  const fontFamily = primaryCSS
    ? `'${fontMap.primary}', '${fontMap.fallback}', Impact, sans-serif`
    : fallbackCSS
      ? `'${fontMap.fallback}', Impact, 'Arial Black', sans-serif`
      : "'Impact', 'Arial Black', sans-serif";

  // Calculate font sizes — large for thumbnail readability
  const primarySize = calculateFontSize(textOverlays.primary, width, 0.10);
  const secondarySize = textOverlays.secondary
    ? calculateFontSize(textOverlays.secondary, width, 0.05)
    : 0;

  // Thick strokes for contrast
  const primaryStroke = Math.max(3, Math.round(primarySize * 0.08));
  const secondaryStroke = Math.max(2, Math.round(secondarySize * 0.06));

  // Build background panels + text elements
  const primaryPanel = buildBackgroundPanel({
    text: textOverlays.primary.toUpperCase(),
    pos: positions.primary,
    fontSize: primarySize,
    panelColor: colors.background,
    panelOpacity: 0.7,
    borderRadius: 12,
    paddingX: 24,
    paddingY: 14,
  });

  const primaryText = buildTextElement({
    text: textOverlays.primary.toUpperCase(),
    pos: positions.primary,
    fontSize: primarySize,
    fontFamily,
    fillColor: colors.primary,
    strokeColor: colors.background,
    strokeWidth: primaryStroke,
    isPrimary: true,
  });

  let secondaryPanel = '';
  let secondaryText = '';
  if (textOverlays.secondary && positions.secondary) {
    secondaryPanel = buildBackgroundPanel({
      text: textOverlays.secondary.toUpperCase(),
      pos: positions.secondary,
      fontSize: secondarySize,
      panelColor: colors.accent,
      panelOpacity: 0.25,
      borderRadius: 8,
      paddingX: 18,
      paddingY: 10,
    });

    secondaryText = buildTextElement({
      text: textOverlays.secondary.toUpperCase(),
      pos: positions.secondary,
      fontSize: secondarySize,
      fontFamily,
      fillColor: colors.accent,
      strokeColor: colors.background,
      strokeWidth: secondaryStroke,
      isPrimary: false,
    });
  }

  // Bottom gradient overlay for layouts with bottom text
  const needsBottomGradient = layout === 'split-screen' || layout === 'center-subject-top-text';
  const bottomGradient = needsBottomGradient ? `
  <defs>
    <linearGradient id="bottom-fade" x1="0" y1="0.6" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
  </defs>
  <rect x="0" y="${Math.round(height * 0.55)}" width="${width}" height="${Math.round(height * 0.45)}" fill="url(#bottom-fade)" />` : '';

  // NOTE: No emoji rendering — librsvg cannot render emoji (shows hex garbage)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>${fontFace}</style>
    <filter id="text-shadow">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#000000" flood-opacity="0.95" />
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6" />
    </filter>
    <filter id="text-shadow-soft">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>
  ${bottomGradient}
  ${primaryPanel}
  ${primaryText}
  ${secondaryPanel}
  ${secondaryText}
</svg>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BackgroundPanelOpts {
  text: string;
  pos: { x: number; y: number; anchor: string; maxWidth: number };
  fontSize: number;
  panelColor: string;
  panelOpacity: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
}

/**
 * Build a semi-transparent rounded-rect behind text for readability.
 * This is how professional YouTube thumbnails make text pop over any background.
 */
function buildBackgroundPanel(opts: BackgroundPanelOpts): string {
  const { text, pos, fontSize, panelColor, panelOpacity, borderRadius, paddingX, paddingY } = opts;

  const lines = wrapText(text, pos.maxWidth, fontSize);
  const avgCharWidth = fontSize * 0.58;
  const maxLineLen = Math.max(...lines.map(l => l.length));
  const textWidth = Math.min(maxLineLen * avgCharWidth, pos.maxWidth);
  const lineHeight = fontSize * 1.25;
  const textHeight = fontSize + (lines.length - 1) * lineHeight;

  const panelW = textWidth + paddingX * 2;
  const panelH = textHeight + paddingY * 2;

  // Calculate panel position based on text anchor
  let panelX: number;
  if (pos.anchor === 'middle') {
    panelX = pos.x - panelW / 2;
  } else if (pos.anchor === 'end') {
    panelX = pos.x - panelW;
  } else {
    panelX = pos.x;
  }
  const panelY = pos.y - fontSize / 2 - paddingY;

  return `<rect x="${Math.round(panelX)}" y="${Math.round(panelY)}" width="${Math.round(panelW)}" height="${Math.round(panelH)}" rx="${borderRadius}" ry="${borderRadius}" fill="${panelColor}" fill-opacity="${panelOpacity}" />`;
}

interface TextElementOpts {
  text: string;
  pos: { x: number; y: number; anchor: string; maxWidth: number };
  fontSize: number;
  fontFamily: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  isPrimary: boolean;
}

function buildTextElement(opts: TextElementOpts): string {
  const { text, pos, fontSize, fontFamily, fillColor, strokeColor, strokeWidth, isPrimary } = opts;

  const lines = wrapText(text, pos.maxWidth, fontSize);
  const filterId = isPrimary ? 'text-shadow' : 'text-shadow-soft';
  const lineHeight = fontSize * 1.25;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${pos.x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('\n      ');

  return `
  <text
    x="${pos.x}" y="${pos.y}"
    font-family="${fontFamily}"
    font-size="${fontSize}"
    font-weight="900"
    letter-spacing="${isPrimary ? '2' : '1'}"
    text-anchor="${pos.anchor}"
    dominant-baseline="central"
    filter="url(#${filterId})"
    paint-order="stroke fill"
    stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"
    fill="${fillColor}"
  >
    ${tspans}
  </text>`;
}

/**
 * Calculate font size based on text length and image width.
 * Designed for readability at thumbnail sizes.
 */
function calculateFontSize(
  text: string,
  imageWidth: number,
  maxRatio: number,
): number {
  const len = text.length;
  let ratio: number;

  if (len <= 5)       ratio = maxRatio * 1.1;
  else if (len <= 10) ratio = maxRatio;
  else if (len <= 15) ratio = maxRatio * 0.85;
  else if (len <= 20) ratio = maxRatio * 0.7;
  else if (len <= 30) ratio = maxRatio * 0.55;
  else                ratio = maxRatio * 0.4;

  return Math.round(Math.max(36, imageWidth * ratio));
}

/**
 * Word-wrap: splits text into lines that fit within maxWidth.
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.58;
  const maxChars = Math.floor(maxWidth / avgCharWidth);

  if (text.length <= maxChars) return [text];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [text];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

