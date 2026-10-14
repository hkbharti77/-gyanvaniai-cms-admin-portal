import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

export default function AccessDenied() {
  const location = useLocation();
  const requiredPermission = location.state?.requiredPermission;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-6 shadow-sm shadow-rose-100">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">403 — Access Forbidden</h1>
      <p className="text-sm text-slate-600 max-w-md mt-2">
        You do not possess the required authorization permissions to access this administrative resource.
      </p>

      {requiredPermission && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500">Missing Authorization Key: </span>
          <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 ml-1">
            {requiredPermission}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-8">
        <Link to="/admin/dashboard" className="btn-primary text-xs font-semibold">
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
