import React from 'react';
import { Globe } from 'lucide-react';

export default function GoogleSearchPreview({ title, description, slug }) {
  const displayTitle = title || 'Untitled Article';
  const displayDesc = description || 'No description provided. Add an excerpt or SEO description to optimize click-through rate from search engines.';
  const displaySlug = slug || 'article-slug';

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-indigo-500" />
          <span>Google SERP Search Result Card</span>
        </span>
        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Mobile & Desktop Snippet
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        {/* Favicon & Breadcrumb Path */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-tight">GyanVaniAi Blog</span>
            <span className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
              https://www.gyanvaniai.com › blog › {displaySlug}
            </span>
          </div>
        </div>

        {/* Clickable Google Blue Title */}
        <h4 className="text-[15px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug pt-0.5">
          {displayTitle} | GyanVaniAi
        </h4>

        {/* Snippet Description */}
        <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
          {displayDesc}
        </p>
      </div>
    </div>
  );
}
