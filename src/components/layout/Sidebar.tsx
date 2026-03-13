'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Image,
  Settings,
  CreditCard,
  Zap,
  ChevronLeft,
  Wand2,
  FlaskConical,
  Film,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create', href: '/create', icon: Sparkles },
  { label: 'Editor', href: '/editor', icon: Wand2 },
  { label: 'Gallery', href: '/gallery', icon: Image },
  { label: 'A/B Testing', href: '/ab-test', icon: FlaskConical },
  { label: 'Video Extract', href: '/video-extract', icon: Film },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'glass-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
            FrameMint
          </span>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 transition-colors hover:bg-white/5"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--fm-primary)]/15 text-[var(--fm-primary-light)] shadow-[inset_0_1px_0_rgba(108,92,231,0.2)]'
                  : 'text-[var(--fm-text-secondary)] hover:bg-white/5 hover:text-[var(--fm-text)]'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[var(--fm-primary)]')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-2xl gradient-pro border border-[var(--fm-primary)]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--fm-primary-light)]" />
            <span className="text-sm font-semibold text-[var(--fm-text)]">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-[var(--fm-text-secondary)] mb-3">
            Get 100 credits, A/B testing, and video-to-thumbnail.
          </p>
          <Link
            href="/settings/billing"
            className="btn-primary block w-full text-center text-sm py-2"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </aside>
  );
}
