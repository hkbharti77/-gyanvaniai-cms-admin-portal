import React, { useState, useEffect, useMemo } from 'react';
import { Link as LinkIcon, Plus, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function InternalLinkPanel({
  currentPostId,
  currentCategory = '',
  currentTags = [],
  onInsertLink,
}) {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    async function loadPublished() {
      try {
        setLoading(true);
        const res = await api.getPosts({ status: 'published', limit: 50 });
        setPublishedPosts(res.posts || []);
      } catch (err) {
        console.warn('Failed to load published posts for internal link analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublished();
  }, []);

  // Compute recommendations based on category and tag overlap
  const recommendations = useMemo(() => {
    if (publishedPosts.length === 0) return [];

    const activeList = publishedPosts.filter(
      (p) => p.id !== currentPostId && !dismissed.has(p.id)
    );

    const scored = activeList.map((post) => {
      let score = 5; // Base relevance
      let reasons = [];

      if (currentCategory && post.category?.toLowerCase() === currentCategory.toLowerCase()) {
        score += 20;
        reasons.push(`Same category (${post.category})`);
      }

      const sharedTags = (post.tags || []).filter((t) =>
        currentTags.map((ct) => ct.toLowerCase()).includes(t.toLowerCase())
      );
      if (sharedTags.length > 0) {
        score += sharedTags.length * 10;
        reasons.push(`${sharedTags.length} shared tags: ${sharedTags.join(', ')}`);
      }

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category,
        score,
        targetUrl: `/blog/${post.slug}`,
        reason: reasons.length > 0 ? reasons.join(' • ') : 'Topic overlap',
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [publishedPosts, currentPostId, currentCategory, currentTags, dismissed]);

  const handleInsert = (rec) => {
    if (!onInsertLink) return;
    const linkHtml = `<p><em>Related Reading: <a href="${rec.targetUrl}">${rec.title}</a></em></p>\n`;
    onInsertLink(linkHtml);
  };

  const handleCopy = (rec) => {
    const linkHtml = `<a href="${rec.targetUrl}">${rec.title}</a>`;
    navigator.clipboard.writeText(linkHtml).then(() => {
      setCopiedId(rec.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] text-slate-500 font-medium">
          Boost SEO authority with contextual internal cross-links
        </span>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
      </div>

      {recommendations.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
          {loading ? 'Analyzing published library...' : 'No other published articles found for linking.'}
        </div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>+{rec.score} relevance</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{rec.category}</span>
              </div>

              <h5 className="font-semibold text-slate-900 line-clamp-1 leading-snug">
                {rec.title}
              </h5>

              <p className="text-[11px] text-slate-500 line-clamp-1">
                💡 {rec.reason}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <code className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                  {rec.targetUrl}
                </code>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(rec)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                    title="Copy HTML link"
                  >
                    {copiedId === rec.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsert(rec)}
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 text-indigo-700 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert in Content</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
