import React from 'react';

export default function SectionControlHeader({
  sectionKey,
  title,
  subtitle,
  enabled = true,
  onToggleEnabled,
  extraAction = null,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {extraAction}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Show Section:</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled ? onToggleEnabled(e.target.checked) : null}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      </div>
    </div>
  );
}
