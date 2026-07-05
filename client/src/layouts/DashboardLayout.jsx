import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-dark-app">
      {/* Ambient background effect */}
      <div className="gradient-bg" />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area — shifts right based on sidebar width */}
      <div
        className={`
          min-h-screen flex flex-col
          transition-all duration-300 ease-out-expo
          lg:ml-[260px]
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
        {/* Top Navbar */}
        <TopNavbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-dashboard mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-dark-border text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} MediTrack — Family Health Record Manager
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
