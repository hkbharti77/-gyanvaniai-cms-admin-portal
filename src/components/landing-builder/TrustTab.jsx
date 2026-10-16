import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import SectionControlHeader from './SectionControlHeader';

export default function TrustTab({ trust = {}, updateSectionField }) {
  const integrations = trust.integrations || [];
  const badges = trust.badges || [];

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="trust"
        title="Trust Indicators & Tech Integrations Bar"
        subtitle="Manage verified integration partners and platform SLA trust badges"
        enabled={trust.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('trust', 'enabled', checked)}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Section Heading</label>
        <input
          type="text"
          value={trust.heading || ''}
          onChange={(e) => updateSectionField('trust', 'heading', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
        />
      </div>

      {/* Integrations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Integrations Grid ({integrations.length})
          </h3>
          <button
            onClick={() => {
              const updated = [...integrations, { name: 'New Integration', type: 'API & Webhooks' }];
              updateSectionField('trust', 'integrations', updated);
            }}
            className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...integrations];
                    updated[idx].name = e.target.value;
                    updateSectionField('trust', 'integrations', updated);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => {
                    const updated = [...integrations];
                    updated[idx].type = e.target.value;
                    updateSectionField('trust', 'integrations', updated);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <button
                onClick={() => {
                  const updated = integrations.filter((_, i) => i !== idx);
                  updateSectionField('trust', 'integrations', updated);
                }}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Badges List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trust SLA Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {badges.map((b, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
              <label className="text-[11px] font-semibold text-slate-500">Badge #{idx + 1}</label>
              <input
                type="text"
                value={b.label}
                onChange={(e) => {
                  const updated = [...badges];
                  updated[idx].label = e.target.value;
                  updateSectionField('trust', 'badges', updated);
                }}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
