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
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-white border-r border-gray-200
          flex flex-col
          transition-all duration-200 ease-out
          ${collapsed ? 'w-[72px]' : 'w-[250px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Area */}
        <div className={`
          flex items-center h-[64px] px-4 border-b border-gray-200
          ${collapsed ? 'justify-center' : 'gap-3'}
        `}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Activity size={20} />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg text-gray-900 tracking-tight whitespace-nowrap">
              MediTrack
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5">
          <ul className="flex flex-col gap-1.5">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                    text-body font-medium
                    transition-all duration-150 ease-out
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-slate-50'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Blue Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full" />
                      )}

                      <Icon
                        size={18}
                        className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                          isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                        }`}
                      />
                      {!collapsed && (
                        <span className="whitespace-nowrap">{label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle — desktop only */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-gray-200">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-150"
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
