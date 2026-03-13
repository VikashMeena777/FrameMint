'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--fm-bg)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main content area */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? '68px' : '240px' }}
      >
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile: no margin, sidebar is in Sheet */}
      <style jsx>{`
        @media (max-width: 1023px) {
          div[style] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
