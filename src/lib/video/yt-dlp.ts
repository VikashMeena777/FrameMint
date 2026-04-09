/**
 * yt-dlp wrapper — YouTube video download & info extraction
 * Per doc 02-technical-architecture §3.6 (Video Frame Extraction)
 *
 * Requires yt-dlp installed on the system (available on Vercel via layer or fallback)
 */

import { exec as execCb } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(execCb);

/* ---------- types ---------- */

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;       // seconds
  thumbnail: string;      // best thumbnail URL
  uploader: string;
  viewCount: number;
  uploadDate: string;     // YYYYMMDD
  description: string;
  webpage_url: string;
}

/* ---------- helpers ---------- */

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Validate that the URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  return patterns.some((p) => p.test(url));
}

/* ---------- public API ---------- */

/**
 * Get video metadata without downloading
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}"`,
      { timeout: 30_000 }
    );

    const data = JSON.parse(stdout);

    return {
      id: data.id,
      title: data.title || 'Untitled',
      duration: data.duration || 0,
      thumbnail: data.thumbnail || '',
      uploader: data.uploader || 'Unknown',
      viewCount: data.view_count || 0,
      uploadDate: data.upload_date || '',
      description: (data.description || '').slice(0, 500),
      webpage_url: data.webpage_url || url,
    };
  } catch (error) {
    const err = error as Error & { stderr?: string };
    if (err.stderr?.includes('Private video') || err.stderr?.includes('Sign in')) {
      throw new Error('This video is private or requires authentication');
    }
    if (err.stderr?.includes('Video unavailable')) {
      throw new Error('Video is unavailable or has been removed');
    }
    throw new Error(`Failed to get video info: ${err.message}`);
  }
}

/**
 * Download a YouTube video to a local directory
 * Returns the path to the downloaded file
 *
 * @param url - YouTube video URL
 * @param outputDir - directory to save the video (default: /tmp/framemint-video)
 * @param maxHeight - maximum video height in pixels (default: 720)
 */
export async function downloadVideo(
  url: string,
  outputDir: string = '/tmp/framemint-video',
  maxHeight: number = 720
): Promise<string> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  ensureDir(outputDir);

  const outputTemplate = path.join(outputDir, '%(id)s.%(ext)s');

  try {
    const { stdout } = await execAsync(
      `yt-dlp -f "bestvideo[height<=${maxHeight}]+bestaudio/best[height<=${maxHeight}]" ` +
      `--merge-output-format mp4 ` +
      `--no-playlist ` +
      `--print filename ` +
      `-o "${outputTemplate}" "${url}"`,
      { timeout: 120_000 } // 2 minute timeout
    );

    const downloadedPath = stdout.trim().split('\n').pop() || '';

    if (!downloadedPath || !existsSync(downloadedPath)) {
      throw new Error('Download completed but file not found');
    }

    return downloadedPath;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Video download failed: ${err.message}`);
  }
}

/**
 * Download just the best thumbnail of a YouTube video
 * Returns the path to the thumbnail image
 */
export async function downloadThumbnail(
  url: string,
  outputDir: string = '/tmp/framemint-video'
): Promise<string> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  ensureDir(outputDir);

  const outputTemplate = path.join(outputDir, '%(id)s-thumb.%(ext)s');

  try {
    const { stdout } = await execAsync(
      `yt-dlp --write-thumbnail --skip-download --convert-thumbnails png ` +
      `-o "${outputTemplate}" "${url}"`,
      { timeout: 30_000 }
    );

    // yt-dlp prints the filename; find the .png
    const lines = stdout.trim().split('\n');
    const thumbLine = lines.find((l) => l.includes('.png'));
    const thumbPath = thumbLine
      ? thumbLine.replace(/^.*\[info\] Writing .*: /, '').trim()
      : path.join(outputDir, `${url.split('v=')[1]?.split('&')[0] || 'thumb'}-thumb.png`);

    if (existsSync(thumbPath)) return thumbPath;

    // Fallback — look for any png in the output dir
    const { stdout: ls } = await execAsync(`ls "${outputDir}"/*.png 2>/dev/null || true`);
    const found = ls.trim().split('\n').filter(Boolean)[0];
    if (found) return found;

    throw new Error('Thumbnail download completed but file not found');
  } catch (error) {
    const err = error as Error;
    throw new Error(`Thumbnail download failed: ${err.message}`);
  }
}
