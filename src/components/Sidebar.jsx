import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  ChevronDown,
  Plus,
  Palette,
  Mail,
  Inbox,
  Layers,
  Sparkles,
  X,
  ExternalLink,
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
  Palette,
  Mail,
  Inbox,
  Layers,
  Sparkles,
};

// Canonical enterprise 6-section sidebar organization
const SECTIONS_CONFIG = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        routeKey: '/admin/dashboard',
        defaultLabel: 'Dashboard',
        defaultIcon: 'LayoutDashboard',
        permission: 'dashboard.read',
      },
    ],
  },
  {
    id: 'content',
    label: 'Content & Publishing',
    items: [
      {
        routeKey: '/admin/blog-manager',
        defaultLabel: 'Articles Manager',
        defaultIcon: 'FileEdit',
        permission: 'posts.read',
        activeSubpaths: ['/admin/blog-manager', '/admin/create', '/admin/edit'],
        children: [
          {
            routeKey: '/admin/create',
            defaultLabel: 'Create New Article',
            defaultIcon: 'PenTool',
            permission: 'posts.create',
          },
        ],
      },
      {
        routeKey: '/admin/media',
        defaultLabel: 'Media Library',
        defaultIcon: 'Image',
        permission: 'media.read',
      },
    ],
  },
  {
    id: 'growth',
    label: 'Growth & Marketing',
    items: [
      {
        routeKey: '/admin/blog/analytics',
        defaultLabel: 'Traffic Analytics',
        defaultIcon: 'BarChart3',
        permission: 'analytics.read',
      },
      {
        routeKey: '/admin/blog/seo',
        defaultLabel: 'SEO Intelligence',
        defaultIcon: 'TrendingUp',
        permission: 'seo.read',
      },
      {
        routeKey: '/admin/leads',
        defaultLabel: 'Leads & Inquiries',
        defaultIcon: 'Inbox',
        permission: 'leads.read',
      },
      {
        routeKey: '/admin/subscribers',
        defaultLabel: 'Newsletter Subscribers',
        defaultIcon: 'Mail',
        permission: 'subscribers.read',
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform Management',
    items: [
      {
        routeKey: '/admin/website-theme',
        defaultLabel: 'Website Themes',
        defaultIcon: 'Palette',
        permission: 'settings.read',
      },
      {
        routeKey: '/admin/cookies',
        defaultLabel: 'Cookie Consents',
        defaultIcon: 'ShieldCheck',
        permission: 'cookies.read',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Access',
    items: [
      {
        routeKey: '/admin/users',
        defaultLabel: 'Administrative Users',
        defaultIcon: 'Users',
        permission: 'users.read',
      },
      {
        routeKey: '/admin/roles',
        defaultLabel: 'Roles & Access',
        defaultIcon: 'Shield',
        permission: 'roles.read',
      },
      {
        routeKey: '/admin/permissions',
        defaultLabel: 'Permissions Catalog',
        defaultIcon: 'KeyRound',
        permission: 'permissions.read',
      },
      {
        routeKey: '/admin/menus',
        defaultLabel: 'Dynamic Menus',
        defaultIcon: 'Menu',
        permission: 'menus.read',
      },
      {
        routeKey: '/admin/audit-logs',
        defaultLabel: 'Security Audit Logs',
        defaultIcon: 'FileText',
        permission: 'audit.read',
      },
    ],
  },
  {
    id: 'system',
    label: 'System Configuration',
    items: [
      {
        routeKey: '/admin/settings',
        defaultLabel: 'System Settings',
        defaultIcon: 'Settings',
        permission: 'settings.read',
      },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dynamicMenus, setDynamicMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapsible section state (default all open)
  const [openSections, setOpenSections] = useState({
    overview: true,
    content: true,
    growth: true,
    platform: true,
    security: true,
    system: true,
  });

  // Collapsible nested submenus state (e.g. Articles Manager)
  const [openSubmenus, setOpenSubmenus] = useState({
    '/admin/blog-manager': true,
  });

  // Tooltip state in collapsed desktop mode
  const [tooltipState, setTooltipState] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  // Fetch dynamic menu configuration from server
  useEffect(() => {
    let isMounted = true;
    async function loadMenus() {
      try {
        const data = await api.getMenuConfig();
        if (isMounted) {
          setDynamicMenus(data.menus || []);
        }
      } catch (err) {
        console.warn('Notice: dynamic menu config fallback active:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMenus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map dynamic menu items by routeKey for metadata override and authorization checks
  const dynamicMap = useMemo(() => {
    const map = new Map();
    function index(items) {
      if (!Array.isArray(items)) return;
      for (const it of items) {
        if (it.routeKey) map.set(it.routeKey, it);
        if (Array.isArray(it.children)) index(it.children);
      }
    }
    index(dynamicMenus);
    return map;
  }, [dynamicMenus]);

  // Build filtered, authorized sections based on RBAC and dynamic menus
  const visibleSections = useMemo(() => {
    const isDynamicLoaded = dynamicMenus.length > 0;
    const handledRouteKeys = new Set();

    const sections = SECTIONS_CONFIG.map((sec) => {
      const visibleItems = [];

      for (const item of sec.items) {
        handledRouteKeys.add(item.routeKey);

        // Check RBAC permission
        if (item.permission && !hasPermission(item.permission)) {
          continue;
        }

        // Check if dynamic menus were loaded: if loaded, item must exist in authorized dynamic menus
        let label = item.defaultLabel;
        let iconName = item.defaultIcon;

        if (isDynamicLoaded) {
          const dyn = dynamicMap.get(item.routeKey);
          if (!dyn) {
            // Disabled or hidden in dynamic menus
            continue;
          }
          if (dyn.label) label = dyn.label;
          if (dyn.icon) iconName = dyn.icon;
        }

        // Check child items if present (e.g. Create New Article under Articles Manager)
        const visibleChildren = [];
        if (Array.isArray(item.children)) {
          for (const ch of item.children) {
            handledRouteKeys.add(ch.routeKey);

            if (ch.permission && !hasPermission(ch.permission)) {
              continue;
            }

            let chLabel = ch.defaultLabel;
            let chIconName = ch.defaultIcon;

            if (isDynamicLoaded) {
              const dynCh = dynamicMap.get(ch.routeKey);
              if (dynCh) {
                if (dynCh.label) chLabel = dynCh.label;
                if (dynCh.icon) chIconName = dynCh.icon;
              }
            }

            visibleChildren.push({
              ...ch,
              label: chLabel,
              icon: chIconName,
            });
          }
        }

        visibleItems.push({
          ...item,
          label,
          icon: iconName,
          children: visibleChildren,
        });
      }

      return {
        ...sec,
        items: visibleItems,
      };
    }).filter((sec) => sec.items.length > 0);

    // If an administrator configured custom dynamic menu items not in standard sections, append them cleanly
    if (isDynamicLoaded) {
      const extraItems = [];
      for (const [routeKey, dyn] of dynamicMap.entries()) {
        if (!handledRouteKeys.has(routeKey)) {
          extraItems.push({
            routeKey,
            label: dyn.label || 'Custom Menu',
            icon: dyn.icon || 'Layers',
            children: [],
          });
        }
      }
      if (extraItems.length > 0) {
        sections.push({
          id: 'custom-extensions',
          label: 'Custom Modules',
          items: extraItems,
        });
      }
    }

    return sections;
  }, [dynamicMenus, dynamicMap, hasPermission]);

  // Determine active section and automatically expand the section containing the active route
  useEffect(() => {
    const currentPath = location.pathname;

    for (const sec of visibleSections) {
      let isSecActive = false;
      for (const item of sec.items) {
        if (
          item.routeKey === currentPath ||
          (item.activeSubpaths && item.activeSubpaths.some((sub) => currentPath.startsWith(sub))) ||
          (item.children && item.children.some((ch) => ch.routeKey === currentPath))
        ) {
          isSecActive = true;
          break;
        }
      }

      if (isSecActive) {
        // Automatically ensure the section is expanded
        setOpenSections((prev) => (prev[sec.id] ? prev : { ...prev, [sec.id]: true }));

        // If the active route is inside Articles Manager, ensure the submenu is open
        if (
          currentPath.startsWith('/admin/blog-manager') ||
          currentPath.startsWith('/admin/create') ||
          currentPath.startsWith('/admin/edit')
        ) {
          setOpenSubmenus((prev) => ({ ...prev, '/admin/blog-manager': true }));
        }
        break;
      }
    }
  }, [location.pathname, visibleSections]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSubmenu = (routeKey) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [routeKey]: !prev[routeKey],
    }));
  };

  const renderIcon = (iconName, active) => {
    const IconComponent = ICON_MAP[iconName] || FileText;
    return (
      <IconComponent
        className={`w-4 h-4 flex-shrink-0 transition-colors ${
          active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
        }`}
      />
    );
  };

  // Tooltip trigger in collapsed desktop state
  const handleMouseEnterItem = (e, item) => {
    if (!collapsed) return;
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipState({
      item,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleMouseLeaveItem = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipState(null);
    }, 100);
  };

  // Render navigation items list (shared between desktop and mobile drawer)
  const renderNavContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 select-none">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          visibleSections.map((section, sIdx) => {
            const isOpen = openSections[section.id] !== false;

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer"
                  >
                    <span className="truncate">{section.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                ) : (
                  sIdx > 0 && <div className="border-t border-slate-800/70 my-2 mx-1" />
                )}

                {/* Section Items */}
                {(isCollapsed || isOpen) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                      const isSubmenuOpen = openSubmenus[item.routeKey] !== false;

                      // Exact or sub-path active detection
                      const isExactActive = location.pathname === item.routeKey;
                      const isChildActive =
                        hasChildren && item.children.some((c) => location.pathname === c.routeKey);
                      const isSubpathActive =
                        item.activeSubpaths &&
                        item.activeSubpaths.some((sub) => location.pathname.startsWith(sub));
                      const isItemActive = isExactActive || isChildActive || isSubpathActive;

                      return (
                        <div key={item.routeKey || item.label} className="space-y-0.5">
                          <div
                            className="relative group flex items-center"
                            onMouseEnter={(e) => handleMouseEnterItem(e, item)}
                            onMouseLeave={handleMouseLeaveItem}
                          >
                            <NavLink
                              to={item.routeKey || '#'}
                              onClick={() => {
                                if (isMobile) setMobileOpen(false);
                              }}
                              className={({ isActive }) => {
                                const active = isActive || isItemActive;
                                return `flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                                  active
                                    ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500 rounded-r-lg rounded-l-none pl-2'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`;
                              }}
                            >
                              {renderIcon(item.icon, isItemActive)}
                              {!isCollapsed && (
                                <span className="truncate flex-1 text-left">{item.label}</span>
                              )}
                            </NavLink>

                            {/* Quick Action & Submenu Controls for Articles Manager */}
                            {!isCollapsed && hasChildren && (
                              <div className="flex items-center gap-0.5 pr-1">
                                {hasPermission('posts.create') && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate('/admin/create');
                                      if (isMobile) setMobileOpen(false);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors opacity-70 group-hover:opacity-100"
                                    title="Create New Article"
                                    aria-label="Create New Article"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleSubmenu(item.routeKey);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                                  title={isSubmenuOpen ? 'Collapse submenu' : 'Expand submenu'}
                                  aria-label={isSubmenuOpen ? 'Collapse submenu' : 'Expand submenu'}
                                >
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isSubmenuOpen ? 'rotate-0' : '-rotate-90'
                                    }`}
                                  />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Nested Submenu rendering (Expanded) */}
                          {!isCollapsed && hasChildren && isSubmenuOpen && (
                            <div className="ml-5 pl-2.5 border-l border-slate-800 space-y-0.5 mt-0.5">
                              {item.children.map((child) => {
                                const isChildLinkActive = location.pathname === child.routeKey;
                                return (
                                  <NavLink
                                    key={child.routeKey}
                                    to={child.routeKey}
                                    onClick={() => isMobile && setMobileOpen(false)}
                                    className={`group flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] rounded-md transition-colors truncate ${
                                      isChildLinkActive
                                        ? 'text-blue-400 font-semibold bg-blue-600/15 border-l-2 border-blue-500 rounded-r-md rounded-l-none pl-1.5'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                                    }`}
                                  >
                                    {renderIcon(child.icon, isChildLinkActive)}
                                    <span className="truncate">{child.label}</span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 bottom-0 z-40 flex-col transition-all duration-300 ease-in-out border-r border-slate-800 bg-[#0d1527] shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/90 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img
                src="/logo.webp"
                alt="Gyan Vani AI"
                className="w-full h-full object-contain filter drop-shadow(0 1px 3px rgba(37, 99, 235, 0.4))"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  GyanVaniAi
                </span>
                <span className="text-[9.5px] uppercase tracking-wider font-bold text-blue-400">
                  Admin Console
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        {renderNavContent(false)}

        {/* Footer info pill */}
        <div className="p-3 border-t border-slate-800/90 bg-[#090e1c] flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Enterprise v1.0</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Secure</span>
            </div>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto animate-pulse"
              title="GyanVani Enterprise System Secure & Online"
            />
          )}
        </div>
      </aside>

      {/* FLOATING TOOLTIP FOR COLLAPSED DESKTOP SIDEBAR */}
      {collapsed && tooltipState && (
        <div
          role="tooltip"
          style={{ top: `${tooltipState.top}px`, left: `${tooltipState.left}px` }}
          className="fixed -translate-y-1/2 z-50 bg-slate-900 text-slate-100 text-xs font-medium px-3 py-2 rounded-lg shadow-2xl border border-slate-700 pointer-events-none animate-fade-in flex flex-col gap-1 min-w-[130px]"
        >
          <div className="flex items-center gap-2 font-semibold text-white">
            <span>{tooltipState.item.label}</span>
          </div>
          {Array.isArray(tooltipState.item.children) && tooltipState.item.children.length > 0 && (
            <div className="pt-1 mt-1 border-t border-slate-800 text-[10.5px] text-slate-400 flex flex-col gap-1">
              {tooltipState.item.children.map((c) => (
                <div key={c.routeKey} className="flex items-center gap-1.5 text-blue-400">
                  <span>↳</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MOBILE NAVIGATION DRAWER & BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d1527] border-r border-slate-800 shadow-2xl flex flex-col md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        {/* Mobile Header with Close Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img
                src="/logo.webp"
                alt="Gyan Vani AI"
                className="w-full h-full object-contain filter drop-shadow(0 1px 3px rgba(37, 99, 235, 0.4))"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                GyanVaniAi
              </span>
              <span className="text-[9.5px] uppercase tracking-wider font-bold text-blue-400">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close navigation drawer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        {renderNavContent(true)}

        {/* Mobile Footer */}
        <div className="p-3 border-t border-slate-800/90 bg-[#090e1c] flex-shrink-0">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Enterprise v1.0 Mobile</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Secure</span>
          </div>
        </div>
      </div>
    </>
  );
}
