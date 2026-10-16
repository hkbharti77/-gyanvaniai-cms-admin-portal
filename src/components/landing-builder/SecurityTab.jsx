import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function SecurityTab({ security = {}, updateSectionField }) {
  const sec = security;
  const cards = sec.cards || [];

  const updateCard = (idx, field, value) => {
    const updated = [...cards];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('security', 'cards', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="security"
        title="Enterprise Security & Compliance Features"
        subtitle="Manage verified SOC2, tenant isolation, and cryptographic encryption claims"
        enabled={sec.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('security', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
          <input
            type="text"
            value={sec.title || ''}
            onChange={(e) => updateSectionField('security', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={sec.subtitle || ''}
            onChange={(e) => updateSectionField('security', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* Security Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Security Pillars ({cards.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <input
                type="text"
                value={c.title}
                placeholder="Pillar Title"
                onChange={(e) => updateCard(idx, 'title', e.target.value)}
                className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
              />
              <textarea
                rows={2}
                value={c.desc}
                placeholder="Security claim and guardrail description"
                onChange={(e) => updateCard(idx, 'desc', e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
