import React from 'react';
import SectionControlHeader from './SectionControlHeader';

export default function OmnichannelTab({ omnichannel = {}, updateSectionField }) {
  const omni = omnichannel;
  const channels = omni.channels || [];

  const updateChannel = (idx, field, value) => {
    const updated = [...channels];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSectionField('omnichannel', 'channels', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="omnichannel"
        title="AI Orchestration & Omnichannel Communication"
        subtitle="Control 3D planetary diagram labels, central engine name, and channel cards"
        enabled={omni.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('omnichannel', 'enabled', checked)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
          <input
            type="text"
            value={omni.title || ''}
            onChange={(e) => updateSectionField('omnichannel', 'title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={omni.subtitle || ''}
            onChange={(e) => updateSectionField('omnichannel', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>

      {/* Central Engine Tag & Title */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3D Orbit Central Engine Node</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Center Node Title</label>
            <input
              type="text"
              value={omni.centerNode?.title || 'Gyan VaniAi Brain'}
              onChange={(e) =>
                updateSectionField('omnichannel', 'centerNode', {
                  ...(omni.centerNode || {}),
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={omni.centerNode?.tag || 'Central Engine'}
              onChange={(e) =>
                updateSectionField('omnichannel', 'centerNode', {
                  ...(omni.centerNode || {}),
                  tag: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Supported Channels ({channels.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {channels.map((ch, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={ch.title}
                  placeholder="Channel Title"
                  onChange={(e) => updateChannel(idx, 'title', e.target.value)}
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  value={ch.stat || ''}
                  placeholder="Stat Badge"
                  onChange={(e) => updateChannel(idx, 'stat', e.target.value)}
                  className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-200 w-28 text-right"
                />
              </div>
              <input
                type="text"
                value={ch.highlight || ''}
                placeholder="Highlight (e.g. Coexistence Mode)"
                onChange={(e) => updateChannel(idx, 'highlight', e.target.value)}
                className="w-full px-2 py-0.5 text-xs text-indigo-600 rounded border border-slate-200"
              />
              <textarea
                rows={2}
                value={ch.desc}
                placeholder="Channel description"
                onChange={(e) => updateChannel(idx, 'desc', e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
