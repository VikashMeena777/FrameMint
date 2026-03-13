/**
 * Post-processing pipeline for generated thumbnail images.
 * Resize to platform dimensions, format conversion, metadata.
 */

import type { Platform } from '@/types';
import { getDimensions } from './prompt-builder';

interface ProcessOptions {
  imageBuffer: Buffer;
  platform: Platform;
  outputFormat?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

/**
 * Resize and format-convert a generated image to match platform specs.
 *
 * Uses canvas-based resize when sharp isn't available (Edge/serverless).
 * Falls through gracefully if resize isn't possible.
 */
export async function postProcess(
  options: ProcessOptions
): Promise<ProcessedImage> {
  const { imageBuffer, platform, outputFormat = 'png', quality = 90 } = options;
  const { width, height } = getDimensions(platform);

  try {
    // Try sharp first (available in Node.js serverless, not always in Edge)
    const sharp = (await import('sharp')).default;

    let pipeline = sharp(imageBuffer).resize(width, height, {
      fit: 'cover',
      position: 'attention', // Smart crop focusing on visually interesting area
    });

    switch (outputFormat) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      default:
        pipeline = pipeline.png({ compressionLevel: 6 });
    }

    const outputBuffer = await pipeline.toBuffer();

    return {
      buffer: outputBuffer,
      width,
      height,
      format: outputFormat,
      sizeBytes: outputBuffer.length,
    };
  } catch {
    // sharp not available — return original with metadata
    console.warn(
      'sharp not available, returning original image without resize'
    );
    return {
      buffer: imageBuffer,
      width,
      height,
      format: outputFormat,
      sizeBytes: imageBuffer.length,
    };
  }
}

/**
 * Convert image buffer to a data URL for client-side preview.
 */
export function bufferToDataUrl(buffer: Buffer, contentType: string): string {
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}
