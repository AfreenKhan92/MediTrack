import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut, Bell, Search } from 'lucide-react';

const TopNavbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className={`
        sticky top-0 z-30 h-[70px]
        bg-dark-app/80 backdrop-blur-xl
        border-b border-dark-border
        flex items-center justify-between gap-4
        px-4 sm:px-6
        transition-all duration-300 ease-out-expo
      `}
    >
      {/* Left side: Menu toggle + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          aria-label="Toggle sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Search bar — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-dark-border rounded-xl px-4 py-2.5 w-64 lg:w-80 transition-all duration-200 focus-within:border-primary-500/50 focus-within:bg-white/[0.08]">
          <Search size={16} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search records, members..."
            className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
          />
        </div>
      </div>

      {/* Right side: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 animate-pulse-glow" />
        </button>

        {/* User info + Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-border">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-heading font-bold text-sm flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
