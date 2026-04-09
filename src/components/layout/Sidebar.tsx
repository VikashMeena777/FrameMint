'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Image as ImageIcon,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Film,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCredits } from '@/hooks/useCredits';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create', href: '/create', icon: Sparkles },
  { label: 'Editor', href: '/editor', icon: Wand2 },
  { label: 'Gallery', href: '/gallery', icon: ImageIcon },

  { label: 'Video Extract', href: '/video-extract', icon: Film },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { plan } = useCredits();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Don't let /settings match /settings/billing — only match children for non-leaf routes
    if (href === '/settings') return false;
    return href !== '/dashboard' && pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'glass-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'relative flex h-16 items-center border-b border-white/[0.045]',
        collapsed ? 'justify-center px-0' : 'px-4 gap-3'
      )}>
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-violet-900/40 transition-transform group-hover:scale-105">
            <Image src="/logo.jpg" alt="FrameMint" width={32} height={32} className="h-8 w-8 object-cover" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)] truncate">
              FrameMint
            </span>
          )}
        </Link>

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center rounded-lg p-1.5 text-[var(--fm-text-secondary)] transition-all hover:bg-white/[0.05] hover:text-[var(--fm-text)]',
              collapsed
                ? 'absolute -right-3 top-[22px] h-6 w-6 rounded-full border border-white/10 bg-[var(--fm-surface-2)] shadow-lg'
                : 'ml-auto h-7 w-7'
            )}
          >
            {collapsed
              ? <ChevronRight className="h-3 w-3" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-0.5">
        {!collapsed && (
          <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
            Workspace
          </p>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative group',
                collapsed && 'justify-center',
                active
                  ? 'text-[var(--fm-primary-light)]'
                  : 'text-[var(--fm-text-secondary)] hover:bg-white/[0.038] hover:text-[var(--fm-text)]'
              )}
            >
              {active && (
                <div className="absolute inset-0 rounded-xl bg-violet-600/12 border border-violet-500/18" />
              )}
              <item.icon
                className={cn('relative shrink-0', active ? 'text-[var(--fm-primary-light)]' : '')}
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
              {!collapsed && (
                <span className="relative truncate">{item.label}</span>
              )}
              {!collapsed && active && (
                <div className="relative ml-auto h-1.5 w-1.5 rounded-full bg-[var(--fm-primary-light)]" />
              )}
            </Link>
          );
        })}

        <div className="my-3.5 h-px bg-white/[0.045] mx-1" />

        {!collapsed && (
          <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
            Account
          </p>
        )}

        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative',
                collapsed && 'justify-center',
                active
                  ? 'text-[var(--fm-primary-light)]'
                  : 'text-[var(--fm-text-secondary)] hover:bg-white/[0.038] hover:text-[var(--fm-text)]'
              )}
            >
              {active && (
                <div className="absolute inset-0 rounded-xl bg-violet-600/12 border border-violet-500/18" />
              )}
              <item.icon
                className={cn('relative shrink-0', active ? 'text-[var(--fm-primary-light)]' : '')}
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
              {!collapsed && <span className="relative truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA — only for free plan */}
      {!collapsed && plan === 'free' && (
        <div className="p-3 shrink-0">
          <div
            className="rounded-2xl border border-violet-500/18 p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.05) 100%)' }}
          >
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-violet-600/10 blur-xl" />
            <div className="relative flex items-center gap-2 mb-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg gradient-primary shadow-sm shadow-violet-900/30">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--fm-text)]">Upgrade to Pro</span>
            </div>
            <p className="relative text-xs text-[var(--fm-text-secondary)] mb-3.5 leading-relaxed">
              100 credits/mo, priority generation & video extraction.
            </p>
            <Link
              href="/settings/billing"
              className="btn-primary block w-full text-center text-xs py-2 px-3 rounded-xl"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
