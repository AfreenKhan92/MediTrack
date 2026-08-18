import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

const TopNavbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 h-[64px] bg-white dark:bg-[#111214] border-b border-gray-200 dark:border-[#2A2C30] flex items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-200"
    >
      {/* Left side: Menu toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 dark:border-[#2A2C30] bg-white dark:bg-[#17181A] hover:bg-slate-50 dark:hover:bg-[#1D1F22] flex items-center justify-center text-gray-700 dark:text-[#A1A1AA] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150"
          aria-label="Toggle sidebar menu"
        >
          <Menu size={18} />
        </button>

        {/* Global Search — replaces the old static input */}
        <GlobalSearch />
      </div>

      {/* Right side: Dark Theme Toggle + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-[#2A2C30] bg-white dark:bg-[#17181A] hover:bg-blue-50 dark:hover:bg-[#1D1F22] hover:border-blue-200 dark:hover:border-[#3F4248] flex items-center justify-center text-gray-600 dark:text-[#A1A1AA] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150"
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User info + Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-[#2A2C30]">
          <div className="hidden sm:block text-right">
            <p className="text-body font-semibold text-gray-900 dark:text-[#F5F5F5] leading-tight">{user?.name || 'User'}</p>
            <p className="text-caption text-gray-500 dark:text-[#A1A1AA]">{user?.email || ''}</p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-caption flex-shrink-0 shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center text-gray-500 dark:text-[#A1A1AA] transition-all duration-150"
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
