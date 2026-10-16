import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function FooterTab({ footer = {}, updateSectionField }) {
  const sl = footer.socialLinks || {};

  const updateSocial = (key, value) => {
    updateSectionField('footer', 'socialLinks', { ...sl, [key]: value });
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="footer"
        title="Global Footer & Social Channels"
        subtitle="Configure brand description, social communication handles, and copyright notice"
        enabled={footer.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('footer', 'enabled', checked)}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline / Description</label>
        <textarea
          rows={2}
          value={footer.tagline || ''}
          onChange={(e) => updateSectionField('footer', 'tagline', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Social Channels & Destinations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">WhatsApp Chat URL</label>
            <input
              type="text"
              value={sl.whatsapp || ''}
              onChange={(e) => updateSocial('whatsapp', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Link</label>
            <input
              type="text"
              value={sl.email || ''}
              onChange={(e) => updateSocial('email', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Google Maps Location</label>
            <input
              type="text"
              value={sl.maps || ''}
              onChange={(e) => updateSocial('maps', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={sl.linkedin || ''}
              onChange={(e) => updateSocial('linkedin', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facebook Page</label>
            <input
              type="text"
              value={sl.facebook || ''}
              onChange={(e) => updateSocial('facebook', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub Repo / Org</label>
            <input
              type="text"
              value={sl.github || ''}
              onChange={(e) => updateSocial('github', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Notice</label>
        <input
          type="text"
          value={footer.copyright || ''}
          onChange={(e) => updateSectionField('footer', 'copyright', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
        />
      </div>
    </div>
  );
}
