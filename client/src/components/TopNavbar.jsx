import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut, Bell, Search } from 'lucide-react';

const TopNavbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 h-[64px] bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-200"
    >
      {/* Left side: Menu toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all duration-150"
          aria-label="Toggle sidebar menu"
        >
          <Menu size={18} />
        </button>

        {/* Search bar — desktop/tablet */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50/80 border border-gray-200 rounded-xl px-3.5 py-2 w-full transition-all duration-150 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:bg-white shadow-xs">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search reports, medicines, appointments..."
            className="bg-transparent border-none outline-none text-body text-gray-900 placeholder-gray-400 w-full"
          />
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-white border border-gray-200 rounded">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right side: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-150">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border border-white" />
        </button>

        {/* User info + Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-body font-semibold text-gray-900 leading-tight">{user?.name || 'User'}</p>
            <p className="text-caption text-gray-500">{user?.email || ''}</p>
          </div>

          {/* Avatar - Blue fill */}
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-caption flex-shrink-0 shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-500 transition-all duration-150"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
