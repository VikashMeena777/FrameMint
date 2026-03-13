/**
 * FFmpeg wrapper — video frame extraction
 * Per doc 02-technical-architecture §3.6 (Video Frame Extraction)
 *
 * Supports:
 * - Even-interval frame extraction (N frames spread across duration)
 * - Scene-change / keyframe detection
 *
 * Requires ffmpeg + ffprobe installed on the system
 */

import { exec as execCb } from 'child_process';
import { mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(execCb);

/* ---------- types ---------- */

export interface ExtractedFrame {
  path: string;       // absolute path to the frame image
  filename: string;   // just the filename
  timestamp: number;  // seconds into the video
  index: number;      // 0-based index
}

/* ---------- helpers ---------- */

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get the duration of a video in seconds using ffprobe
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration ` +
    `-of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { timeout: 15_000 }
  );

  const duration = parseFloat(stdout.trim());
  if (isNaN(duration) || duration <= 0) {
    throw new Error('Could not determine video duration');
  }
  return duration;
}

/**
 * Get video dimensions
 */
export async function getVideoDimensions(
  videoPath: string
): Promise<{ width: number; height: number }> {
  const { stdout } = await execAsync(
    `ffprobe -v error -select_streams v:0 ` +
    `-show_entries stream=width,height ` +
    `-of csv=s=x:p=0 "${videoPath}"`,
    { timeout: 15_000 }
  );

  const [w, h] = stdout.trim().split('x').map(Number);
  if (!w || !h) throw new Error('Could not determine video dimensions');
  return { width: w, height: h };
}

/* ---------- public API ---------- */

/**
 * Extract N frames at even intervals throughout the video
 *
 * @param videoPath - absolute path to video file
 * @param count - number of frames to extract (default: 8)
 * @param outputDir - directory for extracted frames (default: /tmp/framemint-frames)
 * @returns array of ExtractedFrame objects
 */
export async function extractFrames(
  videoPath: string,
  count: number = 8,
  outputDir: string = '/tmp/framemint-frames'
): Promise<ExtractedFrame[]> {
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  ensureDir(outputDir);

  const duration = await getVideoDuration(videoPath);
  const interval = duration / (count + 1); // +1 to avoid exact start/end
  const frames: ExtractedFrame[] = [];

  // Extract frames in parallel using a single ffmpeg command with select filter
  const timestamps = Array.from({ length: count }, (_, i) => (i + 1) * interval);

  // Use ffmpeg's select filter for efficient multi-frame extraction
  const selectExpr = timestamps
    .map((t) => `gte(t\\,${t.toFixed(2)})*lt(t\\,${(t + 0.1).toFixed(2)})`)
    .join('+');

  const outputPattern = path.join(outputDir, 'frame_%03d.png');

  try {
    await execAsync(
      `ffmpeg -y -i "${videoPath}" ` +
      `-vf "select='${selectExpr}',setpts=N/FRAME_RATE/TB" ` +
      `-vsync vfr -frames:v ${count} ` +
      `"${outputPattern}"`,
      { timeout: 60_000 }
    );
  } catch {
    // Fallback: extract frames one by one using -ss (slower but more reliable)
    for (let i = 0; i < count; i++) {
      const ts = timestamps[i];
      const outFile = path.join(outputDir, `frame_${String(i + 1).padStart(3, '0')}.png`);

      try {
        await execAsync(
          `ffmpeg -y -ss ${ts.toFixed(2)} -i "${videoPath}" ` +
          `-vframes 1 -q:v 2 "${outFile}"`,
          { timeout: 15_000 }
        );
      } catch {
        console.warn(`[ffmpeg] Failed to extract frame at ${ts.toFixed(2)}s`);
      }
    }
  }

  // Collect results
  const files = readdirSync(outputDir)
    .filter((f) => f.startsWith('frame_') && f.endsWith('.png'))
    .sort();

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(outputDir, files[i]);
    if (existsSync(filePath) && statSync(filePath).size > 0) {
      frames.push({
        path: filePath,
        filename: files[i],
        timestamp: timestamps[i] || (i + 1) * interval,
        index: i,
      });
    }
  }

  return frames;
}

/**
 * Extract keyframes based on scene-change detection
 * Useful for getting visually distinct frames
 *
 * @param videoPath - absolute path to video file
 * @param outputDir - directory for extracted frames
 * @param threshold - scene change sensitivity (0.0 - 1.0, lower = more frames). Default: 0.3
 * @param maxFrames - maximum number of keyframes to extract. Default: 12
 */
export async function extractKeyFrames(
  videoPath: string,
  outputDir: string = '/tmp/framemint-keyframes',
  threshold: number = 0.3,
  maxFrames: number = 12
): Promise<ExtractedFrame[]> {
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  ensureDir(outputDir);

  const outputPattern = path.join(outputDir, 'keyframe_%03d.png');

  try {
    await execAsync(
      `ffmpeg -y -i "${videoPath}" ` +
      `-vf "select='gt(scene,${threshold})',setpts=N/FRAME_RATE/TB" ` +
      `-vsync vfr -frames:v ${maxFrames} ` +
      `-q:v 2 "${outputPattern}"`,
      { timeout: 60_000 }
    );
  } catch (error) {
    const err = error as Error;
    throw new Error(`Keyframe extraction failed: ${err.message}`);
  }

  // Collect results
  const frames: ExtractedFrame[] = [];
  const files = readdirSync(outputDir)
    .filter((f) => f.startsWith('keyframe_') && f.endsWith('.png'))
    .sort();

  const duration = await getVideoDuration(videoPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(outputDir, files[i]);
    if (existsSync(filePath) && statSync(filePath).size > 0) {
      frames.push({
        path: filePath,
        filename: files[i],
        timestamp: (duration / (files.length + 1)) * (i + 1), // approximate
        index: i,
      });
    }
  }

  return frames;
}

/**
 * Extract a single frame at a specific timestamp
 * Useful for preview/thumbnail purposes
 */
export async function extractSingleFrame(
  videoPath: string,
  timestamp: number,
  outputPath: string
): Promise<string> {
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  ensureDir(path.dirname(outputPath));

  try {
    await execAsync(
      `ffmpeg -y -ss ${timestamp.toFixed(2)} -i "${videoPath}" ` +
      `-vframes 1 -q:v 2 "${outputPath}"`,
      { timeout: 15_000 }
    );

    if (!existsSync(outputPath)) {
      throw new Error('Frame extraction produced no output');
    }

    return outputPath;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Single frame extraction failed: ${err.message}`);
  }
}
