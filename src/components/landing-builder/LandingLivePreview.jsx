import React from 'react';
import { Zap, MessageSquare } from 'lucide-react';

export default function LandingLivePreview({
  sections = {},
  previewSlideIdx = 0,
  setPreviewSlideIdx,
}) {
  const hero = sections.hero || {};
  const trust = sections.trust || {};
  const feat = sections.features || {};
  const proc = sections.process || {};
  const ind = sections.industries || {};
  const omni = sections.omnichannel || {};
  const sec = sections.security || {};
  const port = sections.portfolio || {};
  const faq = sections.faq || {};
  const contact = sections.contact || {};

  const safeSlideIdx = previewSlideIdx < (hero.slides?.length || 0) ? previewSlideIdx : 0;
  const activeSlide = hero.slides?.[safeSlideIdx] || hero.slides?.[0] || {};

  return (
    <div className="text-slate-100 font-sans text-xs selection:bg-indigo-500 selection:text-white">
      {/* Navigation Mock */}
      <header className="border-b border-slate-800/80 px-4 py-3 flex items-center justify-between bg-slate-900/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
            G
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Gyan VaniAi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Live Mockup ({hero.slides?.length || 0} Slides)
          </span>
        </div>
      </header>

      {/* 1. Hero Preview */}
      {hero.enabled !== false && (
        <section className="p-6 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>{activeSlide.badge || 'AI-POWERED REVENUE PLATFORM'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white max-w-xl mx-auto leading-tight">
            {activeSlide.titlePrefix || 'Autonomous AI CRM for '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
              {activeSlide.titleGradient || 'high-velocity revenue teams'}
            </span>
          </h1>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            {activeSlide.subtitle || 'Capture, enrich, qualify, assign and convert leads.'}
          </p>

          {/* Slide Image Preview in Live Mockup */}
          {activeSlide.imageDark && (
            <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900/60 my-2">
              <img
                src={activeSlide.imageDark}
                alt={activeSlide.altText || 'Hero Visual Media'}
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Interactive Slide Dots in Mockup */}
          {hero.slides?.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {hero.slides.map((_, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setPreviewSlideIdx(sIdx)}
                  className={`h-1.5 rounded-full transition-all ${
                    sIdx === safeSlideIdx ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Preview Slide #${sIdx + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="px-3.5 py-1.5 rounded-lg bg-indigo-600 font-semibold text-white text-xs">
              {hero.primaryCta?.label || 'Book a Demo'}
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {hero.whatsappCta?.label || 'WhatsApp Demo'}
            </span>
          </div>
        </section>
      )}

      {/* 2. Trust Bar Preview */}
      {trust.enabled !== false && (
        <section className="px-6 py-4 border-b border-slate-800 bg-slate-950 text-center space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{trust.heading}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap text-[11px] text-slate-400">
            {(trust.integrations || []).slice(0, 4).map((item, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-medium">
                {item.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 3. Features Preview */}
      {feat.enabled !== false && (
        <section className="p-6 border-b border-slate-800 bg-slate-900/60 space-y-4">
          <div className="text-center">
            <h2 className="text-base font-bold text-white">{feat.heading}</h2>
            <p className="text-[11px] text-slate-400">{feat.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(feat.capabilities || []).slice(0, 4).map((cap, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{cap.title}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {cap.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Process Workflow Preview */}
      {proc.enabled !== false && (
        <section className="p-6 border-b border-slate-800 bg-slate-950 space-y-4">
          <div className="text-center">
            <h2 className="text-base font-bold text-white">{proc.title}</h2>
            <p className="text-[11px] text-slate-400">{proc.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(proc.steps || []).slice(0, 4).map((st, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] font-bold text-indigo-400">{st.stepNum}</span>
                <div className="font-semibold text-white text-[11px]">{st.title}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Security Preview */}
      {sec.enabled !== false && (
        <section className="p-6 border-b border-slate-800 bg-slate-900 space-y-3">
          <div className="text-center">
            <h2 className="text-base font-bold text-white">{sec.title}</h2>
            <p className="text-[11px] text-slate-400">{sec.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(sec.cards || []).slice(0, 4).map((c, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="block text-white text-[11px]">{c.title}</strong>
                <span className="text-[10px] text-slate-400 line-clamp-2">{c.desc}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Metrics Preview */}
      {port.enabled !== false && (
        <section className="p-6 border-b border-slate-800 bg-slate-950 text-center space-y-3">
          <h2 className="text-base font-bold text-white">{port.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(port.metrics || []).map((m, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-black text-indigo-400">{m.value}</span>
                <p className="text-[10px] text-slate-300 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Contact CTA Preview */}
      {contact.enabled !== false && (
        <section className="p-6 bg-gradient-to-br from-indigo-950/40 to-slate-900 text-center space-y-2 border-b border-slate-800">
          <span className="text-[10px] uppercase font-bold text-indigo-400">{contact.eyebrow}</span>
          <h2 className="text-base font-bold text-white">{contact.title}</h2>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">{contact.subtitle}</p>
          <div className="pt-2">
            <span className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-white text-xs inline-block">
              Request Architecture Consultation
            </span>
          </div>
        </section>
      )}

      {/* Footer Mock */}
      <footer className="p-4 bg-slate-950 text-slate-500 text-center text-[10px]">
        © 2026 Gyan VaniAi. Enterprise Dynamic Landing Page CMS.
      </footer>
    </div>
  );
}
