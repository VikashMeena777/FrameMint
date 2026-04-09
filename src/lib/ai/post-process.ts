/**
 * Post-processing pipeline for generated thumbnails.
 *
 * LAYER 3 — Resize to exact platform dimensions + color/contrast enhancement.
 *
 * Enhancements applied (in order):
 *   1. Resize with attention-based crop
 *   2. Colour saturation boost (+25 %)
 *   3. Slight brightness lift (+5 %)
 *   4. Sharpen (sigma 1.2)
 *   5. Auto-contrast normalisation
 */

export interface ProcessOptions {
  imageBuffer: Buffer;
  targetWidth: number;
  targetHeight: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

/**
 * Post-process a raw AI-generated image:
 *   – resize to exact platform dimensions
 *   – boost colour saturation and contrast
 *   – sharpen for crisp thumbnail display
 */
export async function postProcess(options: ProcessOptions): Promise<ProcessedImage> {
  const sharp = (await import('sharp')).default;

  const {
    imageBuffer,
    targetWidth,
    targetHeight,
    outputFormat = 'png',
  } = options;

  let pipeline = sharp(imageBuffer)
    // 1. Resize to exact target dimensions (attention-based smart crop)
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'attention', // libvips saliency-based crop
    })
    // 2–3. Colour + brightness boost
    .modulate({
      brightness: 1.05,
      saturation: 1.25,
    })
    // 4. Sharpen after resize
    .sharpen({ sigma: 1.2 })
    // 5. Auto-contrast normalisation
    .normalise();

  // Output format
  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 92, mozjpeg: true });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 92 });
      break;
    default:
      pipeline = pipeline.png({ compressionLevel: 6 });
      break;
  }

  const buffer = await pipeline.toBuffer();

  return {
    buffer,
    width: targetWidth,
    height: targetHeight,
    format: outputFormat,
    sizeBytes: buffer.byteLength,
  };
}
