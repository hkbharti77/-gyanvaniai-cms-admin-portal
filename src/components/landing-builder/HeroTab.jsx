import React from 'react';
import {
  Plus,
  MoveUp,
  MoveDown,
  Copy,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  UploadCloud,
  Bot,
} from 'lucide-react';
import SectionControlHeader from './SectionControlHeader';

const HERO_IMAGE_PRESETS = [
  { label: 'Humanoid Robot', dark: '/hero_robot_dark.webp', light: '/hero_robot_light.webp' },
  { label: 'WhatsApp Agent', dark: '/hero_slide_2_dark.webp', light: '/hero_slide_2_light.webp' },
  { label: 'Predictive Intelligence', dark: '/hero_slide_3_dark.webp', light: '/hero_slide_3_light.webp' },
  { label: 'Agentic Orchestration', dark: '/hero_slide_4_dark.webp', light: '/hero_slide_4_light.webp' },
  { label: 'Dashboard Hub', dark: '/hero_dashboard.webp', light: '/hero_dashboard.webp' },
  { label: 'Enterprise Platform', dark: '/gyan_vaniai_crm_hero.webp', light: '/gyan_vaniai_crm_hero.webp' },
];

export default function HeroTab({
  hero = {},
  updateSectionField,
  uploadingSlideKey,
  handleDirectFileUpload,
  openMediaPicker,
}) {
  const slides = hero.slides || [];

  const updateSlide = (index, field, value) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    updateSectionField('hero', 'slides', updated);
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: '',
      badgeIcon: '',
      titlePrefix: '',
      titleGradient: '',
      subtitle: '',
      imageDark: '',
      imageLight: '',
      altText: '',
      telemetry: [
        { dot: 'dot-emerald', icon: 'Zap', text: '', value: '' },
        { dot: 'dot-cyan', icon: 'TrendingUp', text: '', value: '' },
        { dot: 'dot-green', icon: 'ShieldCheck', text: '', value: '' },
      ],
    };
    updateSectionField('hero', 'slides', [...slides, newSlide]);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('The Hero section must contain at least one slide.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete Slide #${index + 1}? This will remove it from the live carousel after publishing.`
      )
    ) {
      const updated = slides.filter((_, i) => i !== index);
      updateSectionField('hero', 'slides', updated);
    }
  };

  const moveSlide = (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    updateSectionField('hero', 'slides', updated);
  };

  const duplicateSlide = (index) => {
    const source = slides[index];
    const clone = {
      ...JSON.parse(JSON.stringify(source)),
      id: `slide-${Date.now()}`,
      titlePrefix: source.titlePrefix ? `${source.titlePrefix} (Copy)` : '',
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, clone);
    updateSectionField('hero', 'slides', updated);
  };

  const updateSlideTelemetry = (slideIdx, tIdx, field, val) => {
    const updated = [...slides];
    const slide = { ...updated[slideIdx] };
    const telemetry = [
      ...(slide.telemetry && slide.telemetry.length > 0
        ? slide.telemetry
        : [
            { dot: 'dot-emerald', icon: 'Zap', text: '', value: '' },
            { dot: 'dot-cyan', icon: 'TrendingUp', text: '', value: '' },
            { dot: 'dot-green', icon: 'ShieldCheck', text: '', value: '' },
          ]),
    ];
    telemetry[tIdx] = { ...telemetry[tIdx], [field]: val };
    slide.telemetry = telemetry;
    updated[slideIdx] = slide;
    updateSectionField('hero', 'slides', updated);
  };

  return (
    <div className="space-y-6">
      <SectionControlHeader
        sectionKey="hero"
        title="Hero Banner & Interactive Carousel"
        subtitle="Manage value propositions, add/delete/reorder images, customize 3D telemetry and CTAs"
        enabled={hero.enabled !== false}
        onToggleEnabled={(checked) => updateSectionField('hero', 'enabled', checked)}
        extraAction={
          <button
            type="button"
            onClick={addSlide}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Slide
          </button>
        }
      />

      {/* Global Hero CTAs */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Primary Call To Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary CTA Label</label>
            <input
              type="text"
              value={hero.primaryCta?.label || ''}
              onChange={(e) =>
                updateSectionField('hero', 'primaryCta', { ...(hero.primaryCta || {}), label: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp CTA Label</label>
            <input
              type="text"
              value={hero.whatsappCta?.label || ''}
              onChange={(e) =>
                updateSectionField('hero', 'whatsappCta', { ...(hero.whatsappCta || {}), label: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp URL / Target</label>
            <input
              type="text"
              value={hero.whatsappCta?.destination || ''}
              onChange={(e) =>
                updateSectionField('hero', 'whatsappCta', { ...(hero.whatsappCta || {}), destination: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Hero-Level AEO Context */}
      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
          <Bot className="w-3.5 h-3.5 text-indigo-600" />
          Hero Section AEO Intent & Direct Answer
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Target Intent Query</label>
            <input
              type="text"
              value={hero.aeoTargetQuery || ''}
              onChange={(e) => updateSectionField('hero', 'aeoTargetQuery', e.target.value)}
              placeholder="e.g. What is Gyan VaniAi autonomous CRM?"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Direct Answer Snippet</label>
            <input
              type="text"
              value={hero.aeoSummary || ''}
              onChange={(e) => updateSectionField('hero', 'aeoSummary', e.target.value)}
              placeholder="e.g. Gyan VaniAi captures, qualifies, and converts revenue leads in real time with autonomous agents."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Slides Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hero Carousel Slides ({slides.length})
            </h3>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              Drag, Reorder, Add, or Delete Images
            </span>
          </div>
          <button
            type="button"
            onClick={addSlide}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slide #{slides.length + 1}
          </button>
        </div>

        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs hover:border-slate-300 transition-all"
          >
            {/* Slide Control Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                  Slide #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {slide.titlePrefix || slide.titleGradient ? (
                    <>
                      {slide.titlePrefix} <span className="text-indigo-600 font-bold">{slide.titleGradient}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic font-normal text-xs">(New Blank Slide)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => moveSlide(idx, -1)}
                  disabled={idx === 0}
                  title="Move slide up"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(idx, 1)}
                  disabled={idx === slides.length - 1}
                  title="Move slide down"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                {/* Duplicate Button */}
                <button
                  type="button"
                  onClick={() => duplicateSlide(idx)}
                  title="Duplicate slide"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteSlide(idx)}
                  disabled={slides.length <= 1}
                  title={slides.length <= 1 ? 'At least one slide required' : 'Delete slide'}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tagline & Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  value={slide.badge || ''}
                  onChange={(e) => updateSlide(idx, 'badge', e.target.value)}
                  placeholder="e.g. AI-POWERED REVENUE PLATFORM"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Icon (Lucide)</label>
                <input
                  type="text"
                  value={slide.badgeIcon || ''}
                  onChange={(e) => updateSlide(idx, 'badgeIcon', e.target.value)}
                  placeholder="Zap, Bot, MessageSquare, TrendingUp, ShieldCheck"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Title & Gradient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title Prefix</label>
                <input
                  type="text"
                  value={slide.titlePrefix || ''}
                  onChange={(e) => updateSlide(idx, 'titlePrefix', e.target.value)}
                  placeholder="e.g. Autonomous AI CRM for "
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gradient Highlight Title</label>
                <input
                  type="text"
                  value={slide.titleGradient || ''}
                  onChange={(e) => updateSlide(idx, 'titleGradient', e.target.value)}
                  placeholder="e.g. high-velocity revenue teams"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={slide.subtitle || ''}
                onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                placeholder="e.g. Capture, enrich, qualify, assign and convert leads with intelligent AI-powered workflows."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            {/* Image Management & Presets */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Slide Images & Visual Media
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 mr-1">Choose Preset:</span>
                  {HERO_IMAGE_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        const updated = [...slides];
                        updated[idx] = {
                          ...updated[idx],
                          imageDark: preset.dark,
                          imageLight: preset.light,
                          altText: `Gyan VaniAi ${preset.label}`,
                        };
                        updateSectionField('hero', 'slides', updated);
                      }}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Dark Mode Image */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Dark Mode Image</label>
                    <div className="flex items-center gap-1.5">
                      <label className="cursor-pointer px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition-colors">
                        {uploadingSlideKey === `${idx}-imageDark` ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                        ) : (
                          <UploadCloud className="w-3 h-3 text-indigo-600" />
                        )}
                        <span>{uploadingSlideKey === `${idx}-imageDark` ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingSlideKey !== null}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleDirectFileUpload(idx, 'imageDark', e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker(idx, 'imageDark')}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3 text-slate-500" />
                        <span>Library</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slide.imageDark || ''}
                      onChange={(e) => updateSlide(idx, 'imageDark', e.target.value)}
                      placeholder="/hero_robot_dark.webp or https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    {slide.imageDark && (
                      <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex-shrink-0 shadow-xs">
                        <img src={slide.imageDark} alt="Dark Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Light Mode Image */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Light Mode Image</label>
                    <div className="flex items-center gap-1.5">
                      <label className="cursor-pointer px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition-colors">
                        {uploadingSlideKey === `${idx}-imageLight` ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                        ) : (
                          <UploadCloud className="w-3 h-3 text-indigo-600" />
                        )}
                        <span>{uploadingSlideKey === `${idx}-imageLight` ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingSlideKey !== null}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleDirectFileUpload(idx, 'imageLight', e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker(idx, 'imageLight')}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3 text-slate-500" />
                        <span>Library</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slide.imageLight || ''}
                      onChange={(e) => updateSlide(idx, 'imageLight', e.target.value)}
                      placeholder="/hero_robot_light.webp or https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    {slide.imageLight && (
                      <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-xs">
                        <img src={slide.imageLight} alt="Light Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Alt Text (Vital for SEO, AEO Image Retrieval & Accessibility)
                </label>
                <input
                  type="text"
                  value={slide.altText || ''}
                  onChange={(e) => updateSlide(idx, 'altText', e.target.value)}
                  placeholder="e.g. Autonomous AI Humanoid Robot orchestrating enterprise CRM revenue operations"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* 3D Floating Telemetry Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Interactive 3D Telemetry Indicator Cards (3 Pillars)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {(slide.telemetry && slide.telemetry.length > 0
                  ? slide.telemetry
                  : [
                      { dot: 'dot-emerald', icon: 'Zap', text: '', value: '' },
                      { dot: 'dot-cyan', icon: 'TrendingUp', text: '', value: '' },
                      { dot: 'dot-green', icon: 'ShieldCheck', text: '', value: '' },
                    ]
                ).map((tItem, tIdx) => (
                  <div key={tIdx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Card #{tIdx + 1}</span>
                      <select
                        value={tItem.dot || 'dot-emerald'}
                        onChange={(e) => updateSlideTelemetry(idx, tIdx, 'dot', e.target.value)}
                        className="text-[10px] rounded border border-slate-200 bg-white px-1 py-0.5"
                      >
                        <option value="dot-emerald">Emerald Dot</option>
                        <option value="dot-cyan">Cyan Dot</option>
                        <option value="dot-green">Green Dot</option>
                        <option value="dot-amber">Amber Dot</option>
                        <option value="dot-purple">Purple Dot</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={tItem.text || ''}
                      onChange={(e) => updateSlideTelemetry(idx, tIdx, 'text', e.target.value)}
                      placeholder="Label (e.g. AI Lead Scoring: )"
                      className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={tItem.value || ''}
                      onChange={(e) => updateSlideTelemetry(idx, tIdx, 'value', e.target.value)}
                      placeholder="Value (e.g. 98/100 Intent)"
                      className="w-full px-2 py-1 text-[11px] font-bold rounded border border-slate-200 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
