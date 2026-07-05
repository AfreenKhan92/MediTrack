import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Bell,
  Syringe,
  UserCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/family',        label: 'Family Members', icon: Users },
  { path: '/reports',       label: 'Reports',        icon: FileText },
  { path: '/appointments',  label: 'Appointments',   icon: CalendarDays },
  { path: '/reminders',     label: 'Reminders',      icon: Bell },
  { path: '/vaccines',      label: 'Vaccines',       icon: Syringe },
  { path: '/profile',       label: 'Profile',        icon: UserCircle },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-dark-surface/95 backdrop-blur-xl
          border-r border-dark-border
          flex flex-col
          transition-all duration-300 ease-out-expo
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Area */}
        <div className={`
          flex items-center h-[70px] px-4 border-b border-dark-border
          ${collapsed ? 'justify-center' : 'gap-3'}
        `}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            <Activity size={20} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg text-white whitespace-nowrap">
              Medi<span className="text-primary-400">Track</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium
                    transition-all duration-200 ease-out-expo
                    ${isActive
                      ? 'bg-primary-600/15 text-primary-400 shadow-sm shadow-primary-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon
                    size={20}
                    className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle — desktop only */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-dark-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
