import React from 'react';
import { Sparkles, Globe, Bot } from 'lucide-react';

const SEO_IMAGE_PRESETS = [
  { label: 'Dashboard Hub', url: 'https://www.gyanvaniai.com/hero_dashboard.webp' },
  { label: 'Humanoid AI Dark', url: 'https://www.gyanvaniai.com/hero_robot_dark.webp' },
  { label: 'CRM System Preview', url: 'https://www.gyanvaniai.com/gyan_vaniai_crm_hero.webp' },
];

export default function SeoTab({ seo = {}, setSeo, setHasUnpublishedChanges }) {
  const titleLen = (seo.title || '').length;
  const descLen = (seo.description || '').length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">SEO & Answer Engine Optimization (AEO) Command Center</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Engineered for both traditional search crawlers (Google, Bing) and AI Answer Engines (Perplexity, ChatGPT Search, Claude, Google SGE/AIO).
        </p>
      </div>

      {/* Traditional SEO Metadata */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          Search Engine Metadata (HTML & Crawlers)
        </h3>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Page Title Tag (Meta Title)</label>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                titleLen >= 50 && titleLen <= 60
                  ? 'bg-emerald-100 text-emerald-800'
                  : titleLen > 60
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {titleLen}/60 chars ({titleLen >= 50 && titleLen <= 60 ? 'Optimal' : titleLen > 60 ? 'Too Long' : 'Recommended: 50-60'})
            </span>
          </div>
          <input
            type="text"
            value={seo.title || ''}
            onChange={(e) => {
              setSeo((prev) => ({ ...prev, title: e.target.value }));
              setHasUnpublishedChanges(true);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Meta Description</label>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                descLen >= 140 && descLen <= 165
                  ? 'bg-emerald-100 text-emerald-800'
                  : descLen > 165
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {descLen}/160 chars ({descLen >= 140 && descLen <= 165 ? 'Optimal' : descLen > 165 ? 'Too Long' : 'Recommended: 150-160'})
            </span>
          </div>
          <textarea
            rows={3}
            value={seo.description || ''}
            onChange={(e) => {
              setSeo((prev) => ({ ...prev, description: e.target.value }));
              setHasUnpublishedChanges(true);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Canonical URL</label>
            <input
              type="text"
              value={seo.canonical || ''}
              onChange={(e) => {
                setSeo((prev) => ({ ...prev, canonical: e.target.value }));
                setHasUnpublishedChanges(true);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Robots Directive</label>
            <select
              value={seo.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
              onChange={(e) => {
                setSeo((prev) => ({ ...prev, robots: e.target.value }));
                setHasUnpublishedChanges(true);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
                Index, Follow (Recommended Production)
              </option>
              <option value="noindex, nofollow">Noindex, Nofollow (Private / Staging)</option>
              <option value="index, nofollow">Index, Nofollow</option>
              <option value="noindex, follow">Noindex, Follow</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Keywords (Comma-separated)</label>
          <input
            type="text"
            value={seo.keywords || ''}
            onChange={(e) => {
              setSeo((prev) => ({ ...prev, keywords: e.target.value }));
              setHasUnpublishedChanges(true);
            }}
            placeholder="e.g. Autonomous AI CRM, Revenue Operations, WhatsApp CRM, AI Lead Qualification"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Social Open Graph Share Image */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">Open Graph (Social Share) Image URL</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
              {SEO_IMAGE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSeo((prev) => ({ ...prev, image: p.url }));
                    setHasUnpublishedChanges(true);
                  }}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={seo.image || ''}
              onChange={(e) => {
                setSeo((prev) => ({ ...prev, image: e.target.value }));
                setHasUnpublishedChanges(true);
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {seo.image && (
              <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex-shrink-0">
                <img src={seo.image} alt="OG Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Engine Optimization (AEO) Section */}
      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-100/70 pb-2.5">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Answer Engine Optimization (AEO) & LLM Retrieval
            </h3>
          </div>
          <span className="text-[11px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
            SGE & Perplexity Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary AEO Target Query / Question</label>
            <input
              type="text"
              value={seo.aeoQuestion || ''}
              onChange={(e) => {
                setSeo((prev) => ({ ...prev, aeoQuestion: e.target.value }));
                setHasUnpublishedChanges(true);
              }}
              placeholder="e.g. What is Gyan VaniAi AI CRM Platform?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400">The exact question prompt AI assistants answer for searchers.</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Speakable Audio Headline (Voice Search)</label>
            <input
              type="text"
              value={seo.speakableHeadline || ''}
              onChange={(e) => {
                setSeo((prev) => ({ ...prev, speakableHeadline: e.target.value }));
                setHasUnpublishedChanges(true);
              }}
              placeholder="e.g. Gyan VaniAi provides autonomous AI CRM and sales orchestration software."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400">Read aloud by Siri, Google Assistant, and Alexa.</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            AEO Direct Factual Answer (Target: 40-60 words concise factual synthesis)
          </label>
          <textarea
            rows={3}
            value={seo.aeoAnswer || ''}
            onChange={(e) => {
              setSeo((prev) => ({ ...prev, aeoAnswer: e.target.value }));
              setHasUnpublishedChanges(true);
            }}
            placeholder="Gyan VaniAi is an Enterprise AI CRM platform with official Meta WhatsApp Coexistence support, sub-300ms RAG chatbots, conversational voice agents, and end-to-end sales automation."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Named Entities (Comma-separated)</label>
          <input
            type="text"
            value={seo.aeoEntities || ''}
            onChange={(e) => {
              setSeo((prev) => ({ ...prev, aeoEntities: e.target.value }));
              setHasUnpublishedChanges(true);
            }}
            placeholder="e.g. Gyan VaniAi, Enterprise CRM, WhatsApp Cloud API, Propensity Lead Scoring"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Interactive AI Answer Engine Simulation Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Live AI Overview Simulation (Perplexity / ChatGPT Search)
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Direct Synthesis</span>
          </div>
          <div className="text-xs font-bold text-slate-200">
            Q: {seo.aeoQuestion || 'What is Gyan VaniAi AI CRM Platform?'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {seo.aeoAnswer || 'Gyan VaniAi is an Enterprise AI CRM platform with official Meta WhatsApp Coexistence support, sub-300ms RAG chatbots, and sales automation.'}
          </p>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(seo.aeoEntities || 'Gyan VaniAi, Enterprise AI CRM, WhatsApp Automation')
                .split(',')
                .map((ent, idx) => (
                  <span key={idx} className="bg-slate-800/80 text-indigo-300 px-2 py-0.5 rounded-md text-[10px]">
                    {ent.trim()}
                  </span>
                ))}
            </div>
            <span className="text-indigo-400 text-[10px] font-semibold flex items-center gap-0.5">
              [1] gyanvaniai.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
