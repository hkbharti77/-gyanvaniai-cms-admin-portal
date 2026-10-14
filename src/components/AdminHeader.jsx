import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Shield,
} from 'lucide-react';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Build breadcrumb segments
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = '/' + pathParts.slice(0, index + 1).join('/');
    const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { title, url };
  });

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.url}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-slate-900 font-bold truncate'
                  : 'text-slate-500 truncate hover:text-slate-700'
              }
            >
              {crumb.title}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        {/* Link to public website */}
        <a
          href="https://www.gyanvaniai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-full">
                  {user.isSuperAdmin ? 'Super Admin' : user.roles?.[0]?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
          title="Sign out of administration console"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
