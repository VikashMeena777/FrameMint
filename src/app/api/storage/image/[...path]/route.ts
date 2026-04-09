import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDownloadUrl } from '@/lib/storage/gdrive';

/**
 * GET /api/storage/image/[...path]
 * Server-side proxy that fetches the image from Google Drive and returns it.
 * Solves CORS issues with direct GDrive URLs.
 *
 * Path pattern: /api/storage/image/{storageKey...}
 * e.g. /api/storage/image/{userId}/thumbnails/{thumbnailId}/variant_1.png
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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Path required', { status: 400 });
    }

    const storagePath = pathSegments.join('/');

    // Security: user can only view their own files
    if (!storagePath.startsWith(user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get the GDrive share URL via rclone
    const shareUrl = await getDownloadUrl(storagePath);

    // Convert to direct download URL
    let directUrl = shareUrl;
    const idMatch = shareUrl.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      directUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }

    // Fetch image from Google Drive server-side (bypasses CORS)
    const imageResponse = await fetch(directUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0', // GDrive sometimes blocks bot-like UAs
      },
    });

    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24h
        'Content-Length': String(imageBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}
