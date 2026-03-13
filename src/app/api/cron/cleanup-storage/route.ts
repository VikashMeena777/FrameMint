import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/cron/cleanup-storage
 * Called by Vercel Cron to delete expired thumbnail variants from storage.
 *
 * Protected by CRON_SECRET header check.
 * Cron schedule: 0 2 * * * (daily at 2 AM)
 */
export async function POST(request: Request) {
  try {
    // Verify cron-secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Use service-role client for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find expired variants
    const { data: expired, error: fetchError } = await supabase
      .from('thumbnail_variants')
      .select('id, storage_key')
      .lt('expires_at', new Date().toISOString())
      .not('expires_at', 'is', null)
      .limit(500); // Process in batches

    if (fetchError) {
      console.error('Cleanup fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch expired items', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    if (!expired || expired.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Delete from storage
    const storageKeys = expired.map((v) => v.storage_key).filter(Boolean);
    if (storageKeys.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('thumbnails')
        .remove(storageKeys);

      if (storageError) {
        console.error('Storage cleanup error:', storageError);
        // Continue with DB cleanup even if storage fails
      }
    }

    // Delete expired variant records
    const expiredIds = expired.map((v) => v.id);
    const { error: deleteError } = await supabase
      .from('thumbnail_variants')
      .delete()
      .in('id', expiredIds);

    if (deleteError) {
      console.error('DB cleanup error:', deleteError);
    }

    // Also clean up thumbnails with no remaining variants
    const { error: orphanError } = await supabase.rpc(
      'cleanup_orphan_thumbnails'
    );

    if (orphanError) {
      // Not critical — this RPC may not exist yet
      console.warn('Orphan cleanup skipped:', orphanError.message);
    }

    console.log(
      `Storage cleanup complete. ${expired.length} expired variants removed.`
    );

    return NextResponse.json({
      success: true,
      deleted: expired.length,
      storageKeysRemoved: storageKeys.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron cleanup-storage error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
