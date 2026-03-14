import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDownloadUrl } from '@/lib/storage/gdrive';

/**
 * GET /api/storage/download/[...path]
 * Generate a download URL for a file stored on Google Drive.
 * Only allows authenticated users to download their own files.
 *
 * Path pattern: /api/storage/download/{userId}/{...rest}
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json(
        { error: 'File path is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const storagePath = pathSegments.join('/');

    // Security: ensure user can only download their own files
    // Storage keys follow pattern: {userId}/...
    if (!storagePath.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get a share URL from Google Drive
    try {
      const shareUrl = await getDownloadUrl(storagePath);

      // Convert to direct download URL
      let downloadUrl = shareUrl;
      const idMatch = shareUrl.match(/[?&]id=([^&]+)/);
      if (idMatch) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
      }

      return NextResponse.json({
        downloadUrl,
        expiresIn: null, // GDrive links don't expire
      });
    } catch {
      return NextResponse.json(
        { error: 'File not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
