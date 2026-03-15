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

      {/* Main content area — pushes right on large screens based on sidebar width */}
      <div
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{ paddingLeft: undefined }}
      >
        {/* Spacer that matches sidebar width on lg+ screens */}
        <style>{`
          @media (min-width: 1024px) {
            [data-dashboard-main] {
              margin-left: ${collapsed ? '68px' : '240px'};
            }
          }
        `}</style>
        <div data-dashboard-main="" className="flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          <Navbar />
          <main className="flex-1 p-4 lg:p-6 pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
