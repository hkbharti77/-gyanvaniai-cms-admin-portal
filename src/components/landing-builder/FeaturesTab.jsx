import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function FeaturesTab({ features = {}, updateSectionField }) {
  const capabilities = features.capabilities || [];

  const updateCapability = (idx, field, value) => {
    const updated = [...capabilities];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('features', 'capabilities', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="features"
        title="Capabilities & Features Matrix"
        subtitle="Showcase autonomous AI capabilities, intent scoring, routing, and playbooks"
        enabled={features.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('features', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
          <input
            type="text"
            value={features.heading || ''}
            onChange={(e) => updateSectionField('features', 'heading', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={features.subtitle || ''}
            onChange={(e) => updateSectionField('features', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Feature Cards ({capabilities.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">Card #{idx + 1}</span>
                <input
                  type="text"
                  value={cap.tag || ''}
                  placeholder="Tag (e.g. Intelligence)"
                  onChange={(e) => updateCapability(idx, 'tag', e.target.value)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-slate-200 bg-slate-50 w-28"
                />
              </div>
              <input
                type="text"
                value={cap.title}
                placeholder="Card Title"
                onChange={(e) => updateCapability(idx, 'title', e.target.value)}
                className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
              />
              <textarea
                rows={2}
                value={cap.description}
                placeholder="Card Description"
                onChange={(e) => updateCapability(idx, 'description', e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
              />
              <input
                type="text"
                value={cap.to}
                placeholder="Target Link (e.g. /services/crm-development)"
                onChange={(e) => updateCapability(idx, 'to', e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
