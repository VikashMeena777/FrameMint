'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Image as ImageIcon,
  Settings,
  CreditCard,
  ChevronLeft,
  Wand2,
  FlaskConical,
  Film,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create', href: '/create', icon: Sparkles },
  { label: 'Editor', href: '/editor', icon: Wand2 },
  { label: 'Gallery', href: '/gallery', icon: ImageIcon },
  { label: 'A/B Testing', href: '/ab-test', icon: FlaskConical },
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

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={cn(
        'glass-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-white/5', collapsed ? 'justify-center px-0' : 'px-4 gap-3')}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)]">
              FrameMint
            </span>
          )}
        </Link>
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-[var(--fm-text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--fm-text)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {onToggle && collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-[26px] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[var(--fm-surface-2)] text-[var(--fm-text-secondary)] shadow-md transition-colors hover:text-[var(--fm-text)]"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--fm-text-muted)]">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center',
                active
                  ? 'bg-violet-600/15 text-[var(--fm-primary-light)] border border-violet-500/20 shadow-sm'
                  : 'text-[var(--fm-text-secondary)] hover:bg-white/[0.04] hover:text-[var(--fm-text)]'
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-[var(--fm-primary-light)]' : '')} style={{ width: '1.125rem', height: '1.125rem' }} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--fm-primary-light)]" />
              )}
            </Link>
          );
        })}

        <div className="my-4 h-px bg-white/5" />

        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--fm-text-muted)]">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center',
                active
                  ? 'bg-violet-600/15 text-[var(--fm-primary-light)] border border-violet-500/20'
                  : 'text-[var(--fm-text-secondary)] hover:bg-white/[0.04] hover:text-[var(--fm-text)]'
              )}
            >
              <item.icon className="shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="p-3">
          <div className="rounded-2xl border border-violet-500/20 p-4" style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--fm-text)]">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-[var(--fm-text-secondary)] mb-3 leading-relaxed">
              100 credits, A/B testing & video extraction.
            </p>
            <Link
              href="/settings/billing"
              className="btn-primary block w-full text-center text-xs py-2 px-3"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
