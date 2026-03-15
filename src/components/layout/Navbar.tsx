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

export function Navbar() {
  const { user } = useUser();
  const { credits } = useCredits();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard redirect to clear server-side cookies (router.push keeps stale session)
    window.location.href = '/login';
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'FM';

  const creditPercent = credits ? Math.round((credits.remaining / credits.total) * 100) : 0;
  const creditColor = creditPercent > 50 ? 'text-emerald-400' : creditPercent > 20 ? 'text-yellow-400' : 'text-red-400';

  return (
    <header className="glass-navbar sticky top-0 z-30 flex h-15 items-center justify-between px-4 lg:px-6" style={{ height: '60px' }}>
      {/* Mobile menu */}
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/5">
                <Menu className="h-5 w-5 text-[var(--fm-text-secondary)]" />
              </button>
            }
          />
          <SheetContent side="left" className="w-[240px] p-0 border-0" style={{ background: 'rgba(8, 8, 26, 0.98)' }}>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--fm-text)]">FrameMint</span>
        </div>
      </div>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        {/* Credits badge */}
        {credits && (
          <Link href="/settings/billing">
            <div className={`flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 transition-all hover:bg-white/6 hover:border-white/12 cursor-pointer`}>
              <Sparkles className={`h-3.5 w-3.5 ${creditColor}`} />
              <span className={`text-xs font-semibold ${creditColor}`}>{credits.remaining}</span>
              <span className="text-xs text-[var(--fm-text-muted)]">/ {credits.total}</span>
            </div>
          </Link>
        )}

        {/* Notification bell */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/5 text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)]">
          <Bell className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5">
                <Avatar className="h-8 w-8 border border-violet-500/30 shadow-lg">
                  <AvatarFallback className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-[var(--fm-text)] leading-tight">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-[var(--fm-text-secondary)] capitalize leading-tight">
                    {credits?.plan || 'free'} plan
                  </p>
                </div>
              </button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border border-white/8 shadow-2xl"
            style={{ background: 'rgba(8, 8, 26, 0.97)', backdropFilter: 'blur(24px)' }}
          >
            <div className="px-3 py-3">
              <p className="text-sm font-medium text-[var(--fm-text)] truncate">{user?.email}</p>
              <p className="text-xs text-[var(--fm-text-secondary)] capitalize mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto bg-violet-600/15 text-[var(--fm-primary-light)] border-violet-500/20">
                  {credits?.plan || 'free'} plan
                </Badge>
              </p>
            </div>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="cursor-pointer text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] hover:bg-white/5 rounded-lg mx-1" onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] hover:bg-white/5 rounded-lg mx-1" onClick={() => router.push('/settings/billing')}>
              Billing & Credits
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/8 rounded-lg mx-1 mb-1"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
