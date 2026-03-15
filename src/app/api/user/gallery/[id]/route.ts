import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/gallery/[id]
 * Fetch a single thumbnail by ID (for the editor page).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;

    const { data: thumbnail, error } = await supabase
      .from('thumbnails')
      .select(
        `
        id,
        title,
        prompt,
        style_preset,
        platform_preset,
        status,
        is_favourite,
        created_at,
        thumbnail_variants (
          id,
          image_url,
          width,
          height,
          format,
          file_size_bytes
        )
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !thumbnail) {
      return NextResponse.json(
        { error: 'Thumbnail not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: thumbnail.id,
      title: thumbnail.title,
      prompt: thumbnail.prompt,
      style: thumbnail.style_preset,
      platform: thumbnail.platform_preset,
      status: thumbnail.status,
      isFavourite: thumbnail.is_favourite,
      createdAt: thumbnail.created_at,
      variants: (
        thumbnail.thumbnail_variants as Array<{
          id: string;
          image_url: string;
          width: number;
          height: number;
          format: string;
          file_size_bytes: number | null;
        }>
      ).map((v) => ({
        id: v.id,
        imageUrl: v.image_url,
        width: v.width,
        height: v.height,
        format: v.format,
        sizeBytes: v.file_size_bytes,
      })),
    });
  } catch (error) {
    console.error('Gallery single fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
