import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits_remaining, credits_monthly_limit, tier, credits_reset_at')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      // New user — return defaults
      return NextResponse.json({
        remaining: 5,
        total: 5,
        used: 0,
        percentage: 0,
        plan: 'free',
        resetsAt: null,
      });
    }

    const used = profile.credits_monthly_limit - profile.credits_remaining;
    return NextResponse.json({
      remaining: profile.credits_remaining,
      total: profile.credits_monthly_limit,
      used,
      percentage: Math.round((used / profile.credits_monthly_limit) * 100),
      plan: profile.tier,
      resetsAt: profile.credits_reset_at,
    });
  } catch (error) {
    console.error('Credits fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
