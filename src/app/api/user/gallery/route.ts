import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const cursor = searchParams.get('cursor');

    let query = supabase
      .from('thumbnails')
      .select(
        `
        id,
        title,
        prompt,
        style_preset,
        platform_preset,
        status,
        created_at,
        thumbnail_variants (
          id,
          image_url,
          width,
          height,
          format,
          is_favourite,
          file_size_bytes
        )
      `
      )
      .eq('user_id', user.id)
      .in('status', ['completed', 'generating'])
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check hasMore

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: thumbnails, error } = await query;

    if (error) {
      console.error('Gallery fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    const hasMore = (thumbnails?.length || 0) > limit;
    const items = (thumbnails || []).slice(0, limit);
    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].created_at
        : null;

    return NextResponse.json({
      thumbnails: items.map((t) => ({
        id: t.id,
        title: t.title,
        prompt: t.prompt,
        style: t.style_preset,
        platform: t.platform_preset,
        status: t.status,
        createdAt: t.created_at,
        variants: (t.thumbnail_variants as Array<{
          id: string;
          image_url: string;
          width: number;
          height: number;
          format: string;
          is_favourite: boolean;
          file_size_bytes: number | null;
        }>).map((v) => ({
          id: v.id,
          imageUrl: v.image_url,
          width: v.width,
          height: v.height,
          format: v.format,
          isFavourite: v.is_favourite,
          sizeBytes: v.file_size_bytes,
        })),
      })),
      cursor: nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Gallery error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { thumbnailId } = await request.json();
    if (!thumbnailId) {
      return NextResponse.json(
        { error: 'thumbnailId is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Get variants to clean up storage
    const { data: variants } = await supabase
      .from('thumbnail_variants')
      .select('storage_key')
      .eq('thumbnail_id', thumbnailId);

    // Delete storage files
    if (variants && variants.length > 0) {
      const keys = variants.map((v) => v.storage_key).filter(Boolean);
      if (keys.length > 0) {
        await supabase.storage.from('thumbnails').remove(keys);
      }
    }

    // Delete thumbnail (cascades to variants)
    const { error } = await supabase
      .from('thumbnails')
      .delete()
      .eq('id', thumbnailId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedVariants: variants?.length || 0,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const { thumbnailId } = await request.json();
    if (!thumbnailId) {
      return NextResponse.json(
        { error: 'thumbnailId is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Verify ownership and get current state
    const { data: thumbnail } = await supabase
      .from('thumbnails')
      .select('id, is_favourite')
      .eq('id', thumbnailId)
      .eq('user_id', user.id)
      .single();

    if (!thumbnail) {
      return NextResponse.json(
        { error: 'Thumbnail not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const newValue = !thumbnail.is_favourite;
    const { error } = await supabase
      .from('thumbnails')
      .update({ is_favourite: newValue })
      .eq('id', thumbnailId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, is_favourite: newValue });
  } catch (error) {
    console.error('Favourite toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
