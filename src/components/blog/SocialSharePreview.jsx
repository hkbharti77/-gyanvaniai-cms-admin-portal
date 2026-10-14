import React from 'react';
import { Share2 } from 'lucide-react';

const FALLBACK_OG_IMAGE = '/portfolio_crm.webp';

export default function SocialSharePreview({ title, description, imageUrl }) {
  const displayTitle = title || 'Untitled Article';
  const displayDesc = description || 'Read insightful strategies on WhatsApp CRM, multi-agent AI, and enterprise automation on GyanVaniAi.';
  const displayImage = imageUrl || FALLBACK_OG_IMAGE;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Share2 className="w-3 h-3 text-sky-500" />
          <span>Social Share & OpenGraph Preview</span>
        </span>
        <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
          LinkedIn • X • WhatsApp
        </span>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200/90 bg-white shadow-xs">
        <div className="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden relative">
          <img
            src={displayImage}
            alt="OpenGraph preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_OG_IMAGE;
            }}
          />
        </div>

        <div className="p-3.5 space-y-1 bg-slate-50/50">
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
            GYANVANIAI.COM
          </span>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
            {displayTitle}
          </h4>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
