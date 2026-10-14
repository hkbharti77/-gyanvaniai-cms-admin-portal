import React, { useMemo } from 'react';
import { Sparkles, Bot, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AeoPanel({
  title = '',
  excerpt = '',
  content = '',
  seoDescription = '',
  aeoData = {},
  onChange,
}) {
  const directQuestion = aeoData.directQuestion || '';
  const directAnswer = aeoData.directAnswer || '';
  const keyTakeaways = Array.isArray(aeoData.keyTakeaways)
    ? aeoData.keyTakeaways.join(', ')
    : (aeoData.keyTakeaways || '');

  // Calculate AEO Readiness Score
  const aeoScore = useMemo(() => {
    let score = 0;
    if (directQuestion.trim().length >= 10) score += 25;
    if (directAnswer.trim().length >= 40 && directAnswer.trim().length <= 400) {
      score += 30;
    } else if (directAnswer.trim().length > 0) {
      score += 15;
    }
    if (keyTakeaways.trim().length >= 5) score += 20;
    if (content && /<h[23][^>]*>/i.test(content)) score += 15;
    if (seoDescription && seoDescription.trim().length >= 50) score += 10;

    let grade = 'Needs Work';
    let color = 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 90) {
      grade = 'A+ (Elite AI Citation)';
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (score >= 75) {
      grade = 'A (Optimal AEO)';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (score >= 50) {
      grade = 'B (Moderate)';
      color = 'text-cyan-700 bg-cyan-50 border-cyan-200';
    }

    return { score, grade, color };
  }, [directQuestion, directAnswer, keyTakeaways, content, seoDescription]);

  const handleFieldChange = (field, val) => {
    onChange({
      ...aeoData,
      [field]: val,
    });
  };

  const handleAutoGenerateQuestion = () => {
    if (!title.trim()) return;
    const cleanTitle = title.replace(/^how to /i, '').replace(/\?$/, '');
    const autoQ = `What is ${cleanTitle} and how does it work?`;
    handleFieldChange('directQuestion', autoQ);
  };

  const handleUseExcerpt = () => {
    if (!excerpt.trim()) return;
    handleFieldChange('directAnswer', excerpt.trim());
  };

  return (
    <div className="space-y-4">
      {/* AEO Intro & Score Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-950 font-medium">
            Prepares content for <strong>Google AI Overviews, Perplexity, ChatGPT & Claude</strong>.
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${aeoScore.color} flex-shrink-0`}>
          AEO: {aeoScore.score}/100 • {aeoScore.grade}
        </span>
      </div>

      {/* Target Question */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">Target AI Question</label>
          <button
            type="button"
            onClick={handleAutoGenerateQuestion}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Auto-Generate
          </button>
        </div>
        <input
          type="text"
          value={directQuestion}
          onChange={(e) => handleFieldChange('directQuestion', e.target.value)}
          placeholder="e.g. What is WhatsApp Business API Coexistence and how does it work?"
          className="input-field text-xs py-2 w-full"
        />
      </div>

      {/* Direct Answer 40-60 Words Snippet */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Direct Answer Snippet (40–60 words for featured extraction)
          </label>
          <button
            type="button"
            onClick={handleUseExcerpt}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Use Excerpt
          </button>
        </div>
        <textarea
          rows={3}
          value={directAnswer}
          onChange={(e) => handleFieldChange('directAnswer', e.target.value)}
          placeholder="A direct, definitive 1-3 sentence explanation directly answering the question for AI engines..."
          className="input-field text-xs leading-relaxed resize-none w-full"
        />
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span
            className={
              directAnswer.length >= 40 && directAnswer.length <= 400
                ? 'text-emerald-600 font-semibold'
                : 'text-amber-600'
            }
          >
            {directAnswer.length} / 400 characters (Optimal: 50–300 chars)
          </span>
          <span className="text-slate-400">Used by QAPage JSON-LD Schema</span>
        </div>
      </div>

      {/* Key Takeaways */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Key Technical Takeaways (Comma separated)
        </label>
        <input
          type="text"
          value={keyTakeaways}
          onChange={(e) => handleFieldChange('keyTakeaways', e.target.value)}
          placeholder="Sub-300ms latency, Official Meta WABA API, Zero message drops, Multi-tenant security"
          className="input-field text-xs py-2 w-full"
        />
      </div>

      {/* Live AI Answer Engine Card Preview (Eye-Friendly Enterprise Light Mode) */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/40 border border-emerald-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-[11px] border-b border-emerald-100 pb-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Answer Engine Preview (ChatGPT • Perplexity • Google AI)</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
            QAPage JSON-LD Schema
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-900 block mb-1">
            Q: {directQuestion || (title ? `What is ${title}?` : 'Direct AI Target Question')}
          </span>
          <div className="p-3 rounded-lg bg-white border border-emerald-100 text-xs text-slate-700 leading-relaxed shadow-xs">
            <strong className="text-emerald-800">Direct Answer: </strong>
            <span>{directAnswer || excerpt || 'Enter a concise direct answer snippet above to see AI synthesis preview.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
