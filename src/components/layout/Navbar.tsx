'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Sparkles } from 'lucide-react';
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
    router.push('/');
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'FM';

  return (
    <header className="glass-navbar sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6">
      {/* Mobile menu */}
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger>
            <span className="rounded-lg p-2 transition-colors hover:bg-white/5 inline-flex">
              <Menu className="h-5 w-5" />
            </span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0 glass-sidebar border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.jpg"
            alt="FrameMint"
            width={28}
            height={28}
            className="rounded-lg transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
            FrameMint
          </span>
        </Link>
      </div>

      {/* Desktop spacer (sidebar handles logo) */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Credits badge */}
        {credits && (
          <Link href="/settings/billing">
            <Badge
              variant="secondary"
              className="h-8 gap-1.5 rounded-full bg-[var(--fm-primary)]/10 px-3 text-[var(--fm-primary-light)] hover:bg-[var(--fm-primary)]/20 transition-colors cursor-pointer border border-[var(--fm-primary)]/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{credits.remaining}</span>
            </Badge>
          </Link>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/5">
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarFallback className="bg-[var(--fm-primary)]/20 text-[var(--fm-primary-light)] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 glass-card border-white/10"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[var(--fm-text)]">{user?.email}</p>
              <p className="text-xs text-[var(--fm-text-secondary)] capitalize">
                {credits?.plan || 'free'} plan
              </p>
            </div>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings/billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-[var(--fm-accent)]"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
