import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Menu as MenuIcon,
  FileText,
  Settings,
  FileEdit,
  PenTool,
  Image,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Palette,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Menu: MenuIcon,
  FileText,
  Settings,
  FileEdit,
  PenTool,
  Image,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  Palette,
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function loadMenus() {
      try {
        const data = await api.getMenuConfig();
        setMenus(data.menus || []);
      } catch (err) {
        console.warn('Failed to load dynamic menus, using fallback:', err);
        setMenus([
          { id: '1', label: 'Dashboard', icon: 'LayoutDashboard', routeKey: '/admin/dashboard' },
          { id: '2', label: 'Users', icon: 'Users', routeKey: '/admin/users' },
          { id: '3', label: 'Roles', icon: 'Shield', routeKey: '/admin/roles' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadMenus();
  }, []);

  const renderIcon = (iconName, active) => {
    const IconComponent = ICON_MAP[iconName] || FileText;
    return (
      <IconComponent
        className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${
          active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'
        }`}
      />
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 bg-white shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-slate-900 truncate">
                GyanVaniAi
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600">
                Admin Console
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          menus.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isCurrent = location.pathname === item.routeKey;

            return (
              <div key={item.id} className="space-y-1">
                <NavLink
                  to={item.routeKey || '#'}
                  className={({ isActive }) => {
                    const active = isActive || isCurrent;
                    return `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    } ${collapsed ? 'justify-center' : ''}`;
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {renderIcon(item.icon, isActive || isCurrent)}
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    </>
                  )}
                </NavLink>

                {/* Submenu rendering if not collapsed */}
                {!collapsed && hasChildren && (
                  <div className="ml-6 pl-3 border-l border-slate-200 space-y-1 mt-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.routeKey}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 text-xs rounded-lg transition-colors truncate ${
                            isActive
                              ? 'text-indigo-700 font-semibold bg-indigo-50/80'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer info pill */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>v1.0.0 Enterprise</span>
            </span>
            <span className="text-slate-400">Secure</span>
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto" title="System Online" />
        )}
      </div>
    </aside>
  );
}
