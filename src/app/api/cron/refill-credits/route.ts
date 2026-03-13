import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/cron/refill-credits
 * Called by Vercel Cron to refill monthly credits for all eligible users.
 *
 * Protected by CRON_SECRET header check.
 * Cron schedule: 0 0 * * * (daily at midnight, checks per-user reset date)
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

    // Call the refill_credits() database function
    const { error } = await supabase.rpc('refill_credits');

    if (error) {
      console.error('Credit refill error:', error);
      return NextResponse.json(
        { error: 'Credit refill failed', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    // Count how many were refilled (for logging)
    const { count } = await supabase
      .from('credit_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'monthly_refill')
      .gte('created_at', new Date(Date.now() - 60_000).toISOString()); // Last minute

    console.log(`Credit refill complete. ${count ?? 0} users refilled.`);

    return NextResponse.json({
      success: true,
      refilled: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron refill-credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
