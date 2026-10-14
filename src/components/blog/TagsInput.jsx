import React, { useState } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';

const POPULAR_SUGGESTIONS = [
  'WhatsApp CRM',
  'AI Automation',
  'Sales Growth',
  'Customer Support',
  'RAG Pipelines',
  'Voice AI',
  'Lead Management',
  'Engineering',
];

export default function TagsInput({ tags = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (textToAdd) => {
    const raw = (textToAdd || inputValue).trim();
    if (!raw) return;

    // Disallow duplicates (case-insensitive check)
    const exists = tags.some((t) => t.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setInputValue('');
      return;
    }

    onChange([...tags, raw]);
    setInputValue('');
  };

  const handleRemoveTag = (indexToRemove) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing Tags Pills */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50 border border-slate-200">
        {tags.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            No tags attached. Add tags below or click suggestions.
          </span>
        ) : (
          tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold animate-fade-in"
            >
              <TagIcon className="w-3 h-3 text-indigo-500" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="text-indigo-400 hover:text-indigo-700 transition-colors p-0.5 rounded"
                title={`Remove ${tag}`}
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Input Field with Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <TagIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-8 text-xs py-1.5 w-full"
            placeholder="Add tag and press Enter or comma..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddTag()}
          disabled={!inputValue.trim()}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Suggestions Row */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 block">
          One-Click Suggestions:
        </span>
        <div className="flex flex-wrap gap-1">
          {POPULAR_SUGGESTIONS.map((sug) => {
            const isAdded = tags.some((t) => t.toLowerCase() === sug.toLowerCase());
            if (isAdded) return null;
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddTag(sug)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium transition-all"
              >
                <Plus className="w-2.5 h-2.5 text-slate-400" />
                <span>{sug}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
