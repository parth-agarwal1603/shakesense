import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col font-body-md antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Top Header */}
      <Header
        onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-0 lg:pl-20' : 'pl-0 lg:pl-72'
        }`}
      >
        <main className="relative pt-14 min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto pt-5 sm:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
