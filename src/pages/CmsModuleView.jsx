import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  FileEdit,
  PenTool,
  Image,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Plus,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';

export default function CmsModuleView({ moduleTitle, iconName, description, requiredPermission }) {
  const location = useLocation();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>CMS Expansion Module</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{moduleTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.gyanvaniai.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <span>Preview Live Blog</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      <div className="card-enterprise p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <FileEdit className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{moduleTitle} Ready for Publishing</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          This administration module is fully registered with permission gate{' '}
          <code className="text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded font-mono font-semibold">
            {requiredPermission}
          </code>{' '}
          and dynamic sidebar routing.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/admin/dashboard" className="btn-secondary text-xs">
            Return to Dashboard
          </Link>
          <Link to="/admin/menus" className="btn-primary text-xs">
            Configure in Navigation
          </Link>
        </div>
      </div>
    </div>
  );
}
