import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function PortfolioTab({ portfolio = {}, updateSectionField }) {
  const port = portfolio;
  const metrics = port.metrics || [];
  const caseStudies = port.caseStudies || [];

  const updateMetric = (idx, field, value) => {
    const updated = [...metrics];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('portfolio', 'metrics', updated);
  };

  const updateCaseStudy = (idx, field, value) => {
    const updated = [...caseStudies];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('portfolio', 'caseStudies', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="portfolio"
        title="Performance Metrics & Verified Case Studies"
        subtitle="Display production telemetry results and actual deployed client solutions"
        enabled={port.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('portfolio', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
          <input
            type="text"
            value={port.title || ''}
            onChange={(e) => updateSectionField('portfolio', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={port.subtitle || ''}
            onChange={(e) => updateSectionField('portfolio', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* 4 Metrics Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Telemetry Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <input
                type="text"
                value={m.value}
                placeholder="Metric Value (e.g. 40%)"
                onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                className="w-full px-2.5 py-1 text-sm font-extrabold rounded-lg border border-slate-300 text-indigo-700"
              />
              <input
                type="text"
                value={m.label}
                placeholder="Label"
                onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                className="w-full px-2 py-0.5 text-xs font-semibold rounded border border-slate-200"
              />
              <textarea
                rows={2}
                value={m.desc}
                placeholder="Description"
                onChange={(e) => updateMetric(idx, 'desc', e.target.value)}
                className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-200 text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Production Case Studies ({caseStudies.length})
        </h3>
        <div className="space-y-3">
          {caseStudies.map((cs, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500">Case Study Title</label>
                  <input
                    type="text"
                    value={cs.title}
                    onChange={(e) => updateCaseStudy(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Industry</label>
                  <input
                    type="text"
                    value={cs.industry}
                    onChange={(e) => updateCaseStudy(idx, 'industry', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Challenge</label>
                  <textarea
                    rows={2}
                    value={cs.challenge}
                    onChange={(e) => updateCaseStudy(idx, 'challenge', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Solution</label>
                  <textarea
                    rows={2}
                    value={cs.solution}
                    onChange={(e) => updateCaseStudy(idx, 'solution', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Outcome</label>
                  <textarea
                    rows={2}
                    value={cs.outcome}
                    onChange={(e) => updateCaseStudy(idx, 'outcome', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-emerald-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
