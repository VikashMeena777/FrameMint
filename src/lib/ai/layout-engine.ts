/**
 * Layout Engine — auto-positions text overlays based on Groq's layout decision.
 *
 * Four layout templates, each optimised for different thumbnail compositions:
 *   1. face-left-text-right  — Subject on left, text on right (reaction / vlog)
 *   2. center-subject-top-text — Central object, text at top and bottom
 *   3. full-text-overlay      — Bold text dominating the entire thumbnail
 *   4. split-screen           — Side-by-side comparison with text across center
 *
 * All positions use generous padding from edges to prevent text clipping.
 * Text anchor and maxWidth are calibrated for readability at thumbnail size.
 */

export type LayoutType =
  | 'face-left-text-right'
  | 'center-subject-top-text'
  | 'full-text-overlay'
  | 'split-screen';

export interface TextPosition {
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
  /** SVG text-anchor */
  anchor: 'start' | 'middle' | 'end';
  /** Max width for text wrapping (px) */
  maxWidth: number;
}

export interface LayoutResult {
  primary: TextPosition;
  secondary?: TextPosition;
}

/**
 * Calculate text positions for a given layout + canvas dimensions.
 * Positions are designed for YouTube-style thumbnails (16:9 ratio)
 * and optimized for readability at small sizes.
 */
export function calculateLayout(
  layout: LayoutType,
  width: number,
  height: number,
): LayoutResult {
  // Safe padding from edges (prevents text getting cut off)
  const padX = Math.round(width * 0.05);
  const padY = Math.round(height * 0.08);

  switch (layout) {
    case 'face-left-text-right':
      // Subject occupies left 45%, text on right 55%
      // Primary text is vertically centered in the right half
      return {
        primary: {
          x: Math.round(width * 0.72),
          y: Math.round(height * 0.35),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.42),
        },
        secondary: {
          x: Math.round(width * 0.72),
          y: Math.round(height * 0.60),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.42),
        },
      };

    case 'center-subject-top-text':
      // Text at the top and bottom, subject in the center
      // More vertical padding for better composition
      return {
        primary: {
          x: Math.round(width * 0.5),
          y: padY + Math.round(height * 0.08),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.85),
        },
        secondary: {
          x: Math.round(width * 0.5),
          y: height - padY - Math.round(height * 0.02),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.7),
        },
      };

    case 'full-text-overlay':
      // Bold text centered, covering the middle of the thumbnail
      // This is the most impactful layout
      return {
        primary: {
          x: Math.round(width * 0.5),
          y: Math.round(height * 0.40),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.88),
        },
        secondary: {
          x: Math.round(width * 0.5),
          y: Math.round(height * 0.68),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.75),
        },
      };

    case 'split-screen':
      // Text at the bottom third, spanning full width
      // Works well for before/after or comparison thumbnails
      return {
        primary: {
          x: Math.round(width * 0.5),
          y: Math.round(height * 0.78),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.92),
        },
        secondary: {
          x: Math.round(width * 0.5),
          y: Math.round(height * 0.92),
          anchor: 'middle',
          maxWidth: Math.round(width * 0.8),
        },
      };

    default:
      // Fallback: full-text-overlay
      return calculateLayout('full-text-overlay', width, height);
  }
}
