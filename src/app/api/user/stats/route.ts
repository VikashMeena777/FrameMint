import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/stats — Aggregate dashboard stats for the current user
 * Returns: thumbnail count, total credits used, time saved estimate, recent thumbnails
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get thumbnail count (only successful generations)
    const { count: thumbnailCount } = await supabase
      .from('thumbnails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Get total credits used
    const { data: creditsData } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'usage');

    const totalCreditsUsed = creditsData?.reduce(
      (sum, row) => sum + Math.abs(row.amount),
      0
    ) ?? 0;

    // Estimate time saved (avg 15 min per thumbnail manually → ~1 min with AI)
    const timeSavedMinutes = (thumbnailCount ?? 0) * 14;
    const timeSavedHours = Math.round(timeSavedMinutes / 60 * 10) / 10;

    // Get recent thumbnails (last 6)
    const { data: recentThumbnails } = await supabase
      .from('thumbnails')
      .select(`
        id,
        title,
        style,
        platform,
        is_favourite,
        created_at,
        thumbnail_variants (
          id,
          image_url,
          variant_index
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    return NextResponse.json({
      thumbnailCount: thumbnailCount ?? 0,
      totalCreditsUsed,
      timeSavedHours,
      timeSavedMinutes,
      recentThumbnails: recentThumbnails ?? [],
    });
  } catch (error) {
    console.error('[Stats API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
