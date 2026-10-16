import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import SectionControlHeader from './SectionControlHeader';

export default function FaqTab({ faq = {}, updateSectionField }) {
  const items = faq.items || [];

  const updateFaqItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('faq', 'items', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="faq"
        title="Frequently Asked Questions & Schema"
        subtitle="Manage buyer FAQs and automated FAQPage structured JSON-LD schema generation"
        enabled={faq.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('faq', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
          <input
            type="text"
            value={faq.title || ''}
            onChange={(e) => updateSectionField('faq', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={faq.subtitle || ''}
            onChange={(e) => updateSectionField('faq', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Questions & Answers ({items.length})
          </h3>
          <button
            onClick={() => {
              const updated = [...items, { question: 'New Question?', answer: 'Detailed verified answer.' }];
              updateSectionField('faq', 'items', updated);
            }}
            className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">Q#{idx + 1}</span>
                <button
                  onClick={() => {
                    const updated = items.filter((_, i) => i !== idx);
                    updateSectionField('faq', 'items', updated);
                  }}
                  className="text-slate-400 hover:text-rose-600 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={it.question}
                placeholder="Enter Question"
                onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
              />
              <textarea
                rows={3}
                value={it.answer}
                placeholder="Enter Answer"
                onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
