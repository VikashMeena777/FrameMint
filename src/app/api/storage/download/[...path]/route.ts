import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/storage/download/[...path]
 * Generate a temporary download URL for a file in Supabase Storage.
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

    // Create a signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (error || !data) {
      console.error('Storage download error:', error);
      return NextResponse.json(
        { error: 'File not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
