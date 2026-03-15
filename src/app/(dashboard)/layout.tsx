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
    <div className="min-h-screen" style={{ background: 'var(--fm-bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main content area shifts based on sidebar state */}
      <div
        className="flex flex-col transition-all duration-300 ease-in-out lg:ml-60"
        style={{ marginLeft: 0 }}
      >
        <Navbar />
        <main className="flex-1 p-4 lg:p-6 pb-10">
          {children}
        </main>
      </div>

      {/* Override sidebar offset on desktop */}
      <style jsx>{`
        @media (min-width: 1024px) {
          div.flex.flex-col {
            margin-left: ${collapsed ? '68px' : '240px'};
          }
        }
      `}</style>
    </div>
  );
}
