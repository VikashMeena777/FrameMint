'use client';

import Link from 'next/link';
import { Menu, Sparkles, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { useUser } from '@/hooks/useUser';
import { useCredits } from '@/hooks/useCredits';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Zap, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user } = useUser();
  const { credits } = useCredits();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'FM';

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Creator';

  const creditPercent = credits
    ? Math.round((credits.remaining / credits.total) * 100)
    : 0;

  const creditColor =
    creditPercent > 50
      ? 'text-emerald-400'
      : creditPercent > 20
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6"
      style={{
        height: 60,
        background: 'rgba(4, 2, 14, 0.88)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.025), 0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Mobile menu trigger */}
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          {/* @ts-expect-error -- asChild not typed in base-ui but works at runtime */}
          <SheetTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[var(--fm-text-secondary)] hover:bg-white/[0.06] hover:text-[var(--fm-text)] transition-all">
              <Menu className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0 border-0" style={{ background: 'rgba(5, 3, 18, 0.99)' }}>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--fm-text)]">FrameMint</span>
        </Link>
      </div>

      <div className="hidden lg:block flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        {/* Credits badge */}
        {credits !== null && (
          <Link
            href="/settings/billing"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 transition-all hover:border-violet-500/25 hover:bg-violet-600/[0.08]"
          >
            <Zap className="h-3 w-3 text-[var(--fm-primary-light)]" />
            <span className={`text-xs font-bold ${creditColor}`}>{credits.remaining}</span>
            <span className="text-xs text-[var(--fm-text-muted)]">/ {credits.total}</span>
          </Link>
        )}

        {/* Bell */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-[var(--fm-text-secondary)] hover:bg-white/[0.06] hover:text-[var(--fm-text)] transition-all">
          <Bell className="h-4 w-4" />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          {/* @ts-expect-error -- asChild not typed in base-ui but works at runtime */}
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="gradient-primary text-white text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-medium text-[var(--fm-text)] max-w-[90px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="h-3 w-3 text-[var(--fm-text-secondary)]" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 rounded-2xl border border-white/[0.07] p-1.5 shadow-2xl"
            style={{ background: 'rgba(6, 4, 22, 0.98)', backdropFilter: 'blur(32px)' }}
          >
            <div className="px-3 py-2.5 mb-1">
              <p className="text-xs font-semibold text-[var(--fm-text)] truncate">{displayName}</p>
              <p className="text-[11px] text-[var(--fm-text-secondary)] truncate mt-0.5">{user?.email}</p>
              {credits && (
                <Badge
                  variant="secondary"
                  className="mt-2 text-[10px] px-2 py-0.5 h-auto bg-violet-600/15 text-[var(--fm-primary-light)] border border-violet-500/18 font-semibold capitalize"
                >
                  {credits.plan} plan
                </Badge>
              )}
            </div>
            <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
            <DropdownMenuItem
              className="cursor-pointer text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] hover:bg-white/[0.05] rounded-xl px-3 py-2"
              onClick={() => router.push('/settings')}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] hover:bg-white/[0.05] rounded-xl px-3 py-2"
              onClick={() => router.push('/settings/billing')}
            >
              Billing & Credits
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.1] rounded-xl px-3 py-2 mb-0.5"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
