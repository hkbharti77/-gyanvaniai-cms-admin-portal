import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function ContactTab({ contact = {}, updateSectionField }) {
  const checklist = contact.checklist || [];

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="contact"
        title="Final CTA & Contact Lead Form"
        subtitle="Configure consultation headlines, SLA checklist highlights, and contact information"
        enabled={contact.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('contact', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Eyebrow</label>
          <input
            type="text"
            value={contact.eyebrow || ''}
            onChange={(e) => updateSectionField('contact', 'eyebrow', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={contact.title || ''}
            onChange={(e) => updateSectionField('contact', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
        <textarea
          rows={2}
          value={contact.subtitle || ''}
          onChange={(e) => updateSectionField('contact', 'subtitle', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
        />
      </div>

      {/* Checklist Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Guaranteed Service Checklist
        </h3>
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...checklist];
                updated[idx] = e.target.value;
                updateSectionField('contact', 'checklist', updated);
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Business Inquiries</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="text"
              value={contact.contactInfo?.email || ''}
              onChange={(e) =>
                updateSectionField('contact', 'contactInfo', {
                  ...(contact.contactInfo || {}),
                  email: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={contact.contactInfo?.phone || ''}
              onChange={(e) =>
                updateSectionField('contact', 'contactInfo', {
                  ...(contact.contactInfo || {}),
                  phone: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={contact.contactInfo?.location || ''}
              onChange={(e) =>
                updateSectionField('contact', 'contactInfo', {
                  ...(contact.contactInfo || {}),
                  location: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
