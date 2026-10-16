import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function IndustriesTab({ industries = {}, updateSectionField }) {
  const list = industries.list || [];

  const updateIndustry = (idx, field, value) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('industries', 'list', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="industries"
        title="Industry Solutions Matrix"
        subtitle="Configure vertical solutions (SaaS, Healthcare, Real Estate, FinTech, etc.)"
        enabled={industries.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('industries', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
          <input
            type="text"
            value={industries.title || ''}
            onChange={(e) => updateSectionField('industries', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={industries.subtitle || ''}
            onChange={(e) => updateSectionField('industries', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* Industries List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Industry Cards ({list.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <input
                type="text"
                value={item.name}
                placeholder="Industry Name"
                onChange={(e) => updateIndustry(idx, 'name', e.target.value)}
                className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
              />
              <textarea
                rows={2}
                value={item.desc}
                placeholder="Industry description"
                onChange={(e) => updateIndustry(idx, 'desc', e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
              />
              <input
                type="text"
                value={item.to}
                placeholder="Link URL (e.g. /industries/enterprise)"
                onChange={(e) => updateIndustry(idx, 'to', e.target.value)}
                className="w-full px-2.5 py-0.5 text-[11px] text-slate-500 rounded border border-slate-200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
