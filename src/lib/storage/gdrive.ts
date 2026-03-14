/**
 * Google Drive Storage — rclone wrapper
 * Per doc 02-technical-architecture §3.5
 *
 * Flow: decode RCLONE_CONFIG_BASE64 → write /tmp/.rclone/rclone.conf
 *       → spawn rclone → upload to GDrive → return share link
 *
 * Folder structure: /framemint/{user_id}/thumbnails/
 */

import { exec as execCb } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(execCb);

/* ---------- config ---------- */

const RCLONE_REMOTE = process.env.RCLONE_REMOTE_NAME || 'gdrive';
const RCLONE_BASE_DIR = 'framemint';

/* ---------- internal helpers ---------- */

/**
 * Decode base64-encoded rclone config and write to temp dir
 * Returns the path to the config file.
 */
function ensureRcloneConfig(): string {
  const configDir = path.join(os.tmpdir(), '.rclone');
  const configPath = path.join(configDir, 'rclone.conf');

  // Only re-write if env var exists (skip in dev if already present)
  const base64Config = process.env.RCLONE_CONFIG_BASE64;
  if (!base64Config) {
    // Check if a local config exists (for local dev with decode-rclone.sh)
    if (existsSync(configPath)) return configPath;
    throw new Error('RCLONE_CONFIG_BASE64 not set and no local config found');
  }

  mkdirSync(configDir, { recursive: true });
  const decoded = Buffer.from(base64Config, 'base64').toString('utf-8');
  writeFileSync(configPath, decoded, { mode: 0o600 });
  return configPath;
}

/**
 * Execute an rclone command with the decoded config
 */
async function rclone(args: string): Promise<string> {
  const cfg = ensureRcloneConfig();
  const cmd = `rclone --config "${cfg}" ${args}`;

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 60_000 });
    if (stderr && !stderr.includes('Transferred')) {
      console.warn('[rclone] stderr:', stderr.trim());
    }
    return stdout.trim();
  } catch (error) {
    const err = error as Error & { stderr?: string };
    console.error('[rclone] command failed:', cmd);
    console.error('[rclone] error:', err.stderr || err.message);
    throw new Error(`rclone failed: ${err.message}`);
  }
}

/* ---------- public API ---------- */

/**
 * Upload a local file to Google Drive
 * @param localPath - absolute path to local file
 * @param remotePath - relative path within /framemint/ (e.g. "user123/thumbnails/img.png")
 * @returns public share URL
 */
export async function uploadToGDrive(
  localPath: string,
  remotePath: string
): Promise<string> {
  const fullRemote = `${RCLONE_REMOTE}:${RCLONE_BASE_DIR}/${remotePath}`;

  // Upload the file
  await rclone(`copyto "${localPath}" "${fullRemote}"`);

  // Get a shareable link
  const linkOutput = await rclone(`link "${fullRemote}"`);
  return linkOutput; // public share URL
}

/**
 * Get a direct download URL for a file on Google Drive
 */
export async function getDownloadUrl(remotePath: string): Promise<string> {
  const fullRemote = `${RCLONE_REMOTE}:${RCLONE_BASE_DIR}/${remotePath}`;
  return rclone(`link "${fullRemote}"`);
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFile(remotePath: string): Promise<void> {
  const fullRemote = `${RCLONE_REMOTE}:${RCLONE_BASE_DIR}/${remotePath}`;
  await rclone(`deletefile "${fullRemote}"`);
}

/**
 * Delete an entire directory (e.g. user folder cleanup)
 */
export async function deleteDir(remotePath: string): Promise<void> {
  const fullRemote = `${RCLONE_REMOTE}:${RCLONE_BASE_DIR}/${remotePath}`;
  await rclone(`purge "${fullRemote}"`);
}

/**
 * List files in a remote directory
 * Returns array of filenames
 */
export async function listFiles(remotePath: string): Promise<string[]> {
  const fullRemote = `${RCLONE_REMOTE}:${RCLONE_BASE_DIR}/${remotePath}`;
  try {
    const output = await rclone(`ls "${fullRemote}"`);
    if (!output) return [];
    // rclone ls output format: "  <size> <filename>"
    return output
      .split('\n')
      .map((line) => line.trim().split(/\s+/).slice(1).join(' '))
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Upload a generated thumbnail and return its GDrive URL
 * Convenience wrapper with standard path structure
 */
export async function uploadThumbnail(
  userId: string,
  thumbnailId: string,
  localPath: string,
  filename: string
): Promise<string> {
  const remotePath = `${userId}/thumbnails/${thumbnailId}/${filename}`;
  return uploadToGDrive(localPath, remotePath);
}

/**
 * Clean up temp files after upload
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    console.warn(`[gdrive] Failed to cleanup temp file: ${filePath}`);
  }
}
