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

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div className="min-h-screen" style={{ background: 'var(--fm-bg)' }}>
      {/* Subtle background for dashboard */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 50% at 60% -10%, rgba(109,40,217,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 100% 50%, rgba(37,99,235,0.06) 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main content */}
      <div
        className="relative flex flex-col transition-all duration-300 ease-in-out"
        style={{ zIndex: 1 }}
      >
        {/* On desktop, offset by sidebar width */}
        <div
          className="hidden lg:block"
          style={{ paddingLeft: sidebarWidth }}
        >
          <Navbar />
          <main className="p-5 lg:p-7 pb-12 min-h-screen">
            {children}
          </main>
        </div>

        {/* Mobile layout — no sidebar offset */}
        <div className="lg:hidden flex flex-col">
          <Navbar />
          <main className="p-4 pb-10 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
