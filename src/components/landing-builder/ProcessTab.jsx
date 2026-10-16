import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function ProcessTab({ process = {}, updateSectionField }) {
  const steps = process.steps || [];

  const updateStep = (idx, field, value) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('process', 'steps', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="process"
        title="Automation Workflow & Steps"
        subtitle="Manage the 8-step intelligent revenue pipeline from inbound capture to closed-won"
        enabled={process.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('process', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
          <input
            type="text"
            value={process.title || ''}
            onChange={(e) => updateSectionField('process', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={process.subtitle || ''}
            onChange={(e) => updateSectionField('process', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Workflow Steps ({steps.length})
        </h3>
        <div className="space-y-3">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              <div className="md:col-span-1 text-center font-bold text-xs text-indigo-600 bg-indigo-50 py-1 rounded-lg">
                {st.stepNum || `0${idx + 1}`}
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={st.title}
                  placeholder="Step Title"
                  onChange={(e) => updateStep(idx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  value={st.category || ''}
                  placeholder="Category"
                  onChange={(e) => updateStep(idx, 'category', e.target.value)}
                  className="w-full px-2.5 py-0.5 text-[11px] text-slate-500 rounded border border-transparent hover:border-slate-200 mt-1"
                />
              </div>
              <div className="md:col-span-8">
                <textarea
                  rows={2}
                  value={st.desc}
                  placeholder="Step Description"
                  onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
