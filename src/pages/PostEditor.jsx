import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Save,
  Globe,
  ArrowLeft,
  Eye,
  History,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Tag as TagIcon,
  Image as ImageIcon,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Bot,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send,
} from 'lucide-react';

import RichTextEditor from '../components/blog/RichTextEditor';
import FeaturedImageUpload from '../components/blog/FeaturedImageUpload';
import GoogleSearchPreview from '../components/blog/GoogleSearchPreview';
import SocialSharePreview from '../components/blog/SocialSharePreview';
import TagsInput from '../components/blog/TagsInput';
import AeoPanel from '../components/blog/AeoPanel';
import EditorialReviewPanel from '../components/blog/EditorialReviewPanel';
import InternalLinkPanel from '../components/blog/InternalLinkPanel';

export default function PostEditor() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Accordion sections
  const [openSections, setOpenSections] = useState({
    seo: true,
    aeo: true,
    publishing: true,
    editorialReview: true,
    taxonomy: true,
    featuredImage: true,
    internalLinks: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'WhatsApp CRM',
    tags: [],
    status: 'draft',
    isFeatured: false,
    featuredImageUrl: '/portfolio_crm.webp',
    featuredImageAlt: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoCanonicalUrl: '',
    seoOgImage: '',
    seoKeywords: '',
    aeo: {
      directQuestion: '',
      directAnswer: '',
      keyTakeaways: [],
    },
    editorialReview: {
      status: 'none',
      notes: '',
      reviewedBy: null,
      reviewedAt: null,
    },
    changeSummary: '',
    version: 1,
  });

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Categories & Post (if editing)
  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);

        if (isEditMode) {
          const postRes = await api.getPostById(id);
          const p = postRes.post;
          setFormData({
            title: p.title || '',
            slug: p.slug || '',
            excerpt: p.excerpt || '',
            content: p.content || '',
            category: p.category || (catRes.categories?.[0]?.name || 'General'),
            tags: Array.isArray(p.tags) ? p.tags : [],
            status: p.status || 'draft',
            isFeatured: Boolean(p.isFeatured),
            featuredImageUrl: typeof p.featuredImage === 'string'
              ? p.featuredImage
              : (p.featuredImage?.url || p.imageUrl || '/portfolio_crm.webp'),
            featuredImageAlt: (typeof p.featuredImage === 'object' && p.featuredImage?.alt)
              ? p.featuredImage.alt
              : (p.title || ''),
            seoMetaTitle: p.seo?.metaTitle || '',
            seoMetaDescription: p.seo?.metaDescription || '',
            seoCanonicalUrl: p.seo?.canonicalUrl || '',
            seoOgImage: p.seo?.ogImage || '',
            seoKeywords: Array.isArray(p.seo?.keywords) ? p.seo.keywords.join(', ') : '',
            aeo: {
              directQuestion: p.aeo?.directQuestion || p.aeoDirectQuestion || '',
              directAnswer: p.aeo?.directAnswer || p.aeoDirectAnswer || '',
              keyTakeaways: Array.isArray(p.aeo?.keyTakeaways)
                ? p.aeo.keyTakeaways
                : (p.aeoKeyTakeaways || []),
            },
            editorialReview: {
              status: p.editorialReview?.status || 'none',
              notes: p.editorialReview?.notes || '',
              reviewedBy: p.editorialReview?.reviewedBy || null,
              reviewedAt: p.editorialReview?.reviewedAt || null,
            },
            changeSummary: '',
            version: p.version || 1,
          });

          // Load revisions
          try {
            const revRes = await api.getRevisions(id);
            setRevisions(revRes.revisions || []);
          } catch (rErr) {
            console.warn('Could not load revisions:', rErr);
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to load article data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditMode]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Direct Content Update
  const handleContentChange = (newContent) => {
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({ ...prev, slug: generated }));
    showToast('Slug generated from article title.');
  };

  const handleCopySlug = () => {
    const fullUrl = `https://www.gyanvaniai.com/blog/${formData.slug || 'article-slug'}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    });
  };

  // Insert internal link block directly into content
  const handleInsertInternalLink = (linkHtml) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n${linkHtml}` : linkHtml,
    }));
    showToast('Internal link inserted into article draft.');
  };

  // Word count & Reading Time Calculation
  const wordCount = formData.content
    ? formData.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // SEO Health Length Status Helpers
  const seoTitleLen = (formData.seoMetaTitle || formData.title).length;
  const seoDescLen = (formData.seoMetaDescription || formData.excerpt).length;

  const getLengthStatus = (len, min, max) => {
    if (len === 0) return { label: 'Empty', color: 'text-slate-400', barColor: 'bg-slate-200', pct: 0 };
    if (len < min) return { label: 'Short', color: 'text-amber-600', barColor: 'bg-amber-400', pct: Math.min(100, Math.round((len / max) * 100)) };
    if (len > max) return { label: 'Too Long', color: 'text-rose-600', barColor: 'bg-rose-500', pct: 100 };
    return { label: 'Optimal', color: 'text-emerald-700 font-bold', barColor: 'bg-emerald-500', pct: Math.round((len / max) * 100) };
  };

  const seoTitleStatus = getLengthStatus(seoTitleLen, 40, 60);
  const seoDescStatus = getLengthStatus(seoDescLen, 120, 160);

  // Save / Update Post
  const handleSave = async (targetStatus = null) => {
    if (!formData.title.trim()) {
      showToast('Please enter an article title.', 'error');
      return;
    }
    if (!formData.excerpt.trim()) {
      showToast('Please provide an article excerpt.', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('Please enter article content.', 'error');
      return;
    }

    try {
      setSaving(true);
      const postStatus = targetStatus || formData.status;

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        status: postStatus,
        isFeatured: formData.isFeatured,
        featuredImage: {
          url: formData.featuredImageUrl,
          alt: formData.featuredImageAlt || formData.title,
        },
        imageUrl: formData.featuredImageUrl,
        seo: {
          metaTitle: formData.seoMetaTitle || formData.title,
          metaDescription: formData.seoMetaDescription || formData.excerpt.slice(0, 160),
          canonicalUrl: formData.seoCanonicalUrl || `https://www.gyanvaniai.com/blog/${formData.slug}`,
          ogImage: formData.seoOgImage || formData.featuredImageUrl,
          twitterCard: 'summary_large_image',
          keywords: formData.seoKeywords ? formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        },
        aeo: formData.aeo,
        editorialReview: formData.editorialReview,
        changeSummary: formData.changeSummary || (isEditMode ? 'Updated article details' : 'Initial creation'),
      };

      if (isEditMode) {
        const res = await api.updatePost(id, payload);
        showToast(`Article "${res.post.title}" saved successfully (v${res.post.version}).`);
        setFormData((prev) => ({
          ...prev,
          version: res.post.version,
          status: res.post.status,
          changeSummary: '',
        }));

        // Refresh revisions
        const revRes = await api.getRevisions(id);
        setRevisions(revRes.revisions || []);
      } else {
        const res = await api.createPost(payload);
        showToast(`Article "${res.post.title}" created successfully.`);
        navigate(`/admin/edit/${res.post.id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save article', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Direct Publish Action
  const handlePublishNow = async () => {
    if (isEditMode) {
      try {
        setSaving(true);
        await api.publishPost(id);
        showToast('Article published live to gyanvaniai.com!');
        setFormData((prev) => ({ ...prev, status: 'published', version: prev.version + 1 }));
        const revRes = await api.getRevisions(id);
        setRevisions(revRes.revisions || []);
      } catch (err) {
        showToast(err.message || 'Publishing failed', 'error');
      } finally {
        setSaving(false);
      }
    } else {
      handleSave('published');
    }
  };

  // Rollback to Revision
  const handleRollback = async (version) => {
    try {
      setSaving(true);
      const res = await api.rollbackRevision(id, version);
      showToast(`Restored article state to revision v${version}.`);
      const p = res.post;
      setFormData((prev) => ({
        ...prev,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: Array.isArray(p.tags) ? p.tags : [],
        status: p.status,
        version: p.version,
      }));
      const revRes = await api.getRevisions(id);
      setRevisions(revRes.revisions || []);
      setShowRevisions(false);
    } catch (err) {
      showToast(err.message || 'Rollback failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Live Preview Trigger
  const handlePreview = async () => {
    if (!isEditMode) {
      showToast('Please save the article draft first to generate a preview link.', 'error');
      return;
    }
    try {
      if (formData.status === 'published') {
        window.open(`https://www.gyanvaniai.com/blog/${formData.slug}`, '_blank');
      } else {
        const tokenRes = await api.getPreviewToken(id);
        window.open(tokenRes.previewUrl, '_blank');
      }
    } catch (err) {
      showToast(err.message || 'Preview generation failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center card-enterprise">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading article details and revision tree...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-fade-in border ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Modern High-Visibility Enterprise Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Breadcrumb Row */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-slate-600 transition-colors">Portal</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link to="/admin/blog-manager" className="hover:text-slate-600 transition-colors">Articles Manager</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-semibold text-slate-800">{isEditMode ? 'Edit Article' : 'New Article Draft'}</span>
        </div>

        {/* Title & Action Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5">
            <Link
              to="/admin/blog-manager"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              title="Return to Articles Manager"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isEditMode ? 'Edit Article' : 'Draft New Article'}
                </h1>
                
                {isEditMode && (
                  <span className="badge badge-slate font-mono text-xs font-bold">
                    v{formData.version}
                  </span>
                )}

                <span
                  className={`badge text-xs font-bold ${
                    formData.status === 'published'
                      ? 'badge-emerald'
                      : formData.status === 'review'
                      ? 'badge-cyan'
                      : 'badge-amber'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.status === 'published'
                        ? 'bg-emerald-500 animate-pulse'
                        : formData.status === 'review'
                        ? 'bg-cyan-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{formData.status.toUpperCase()}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{wordCount}</strong> words
                </span>
                <span>•</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~<strong>{readingTimeMinutes}</strong> min read
                </span>
                <span>•</span>
                <span className="text-slate-400">
                  {formData.category}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isEditMode && (
              <button
                type="button"
                onClick={handlePreview}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Live Preview</span>
              </button>
            )}

            {isEditMode && revisions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRevisions(!showRevisions)}
                className={`btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-xs transition-colors ${
                  showRevisions
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'text-indigo-700 border-indigo-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Revisions ({revisions.length})</span>
              </button>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-xs hover:border-slate-300"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <Save className="w-4 h-4 text-slate-600" />}
              <span>Save Draft</span>
            </button>

            {hasPermission('posts.publish') && (
              <button
                type="button"
                disabled={saving}
                onClick={handlePublishNow}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-md"
              >
                <Globe className="w-4 h-4" />
                <span>{formData.status === 'published' ? 'Update Live Article' : 'Publish Article Live'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Content Editor vs Sidebar Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Content Editor & Search Optimization (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Title Headline & Slug Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Display Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Article Title Headline <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">H1 Primary Header</span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling article headline..."
                className="w-full text-xl sm:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-200 focus:border-indigo-600 outline-none pb-2 bg-transparent transition-colors placeholder:text-slate-300 placeholder:font-bold"
              />
            </div>

            {/* URL Slug Pill Row */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Canonical URL Route</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Generate from title
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="px-3 py-2 text-xs font-mono text-slate-400 bg-slate-100/60 border-r border-slate-200 select-none">
                    https://www.gyanvaniai.com/blog/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="article-url-slug"
                    className="flex-1 px-3 py-2 text-xs font-mono font-medium text-slate-800 outline-none bg-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopySlug}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-medium flex items-center gap-1 shadow-xs"
                  title="Copy full article URL"
                >
                  {copiedSlug ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Summary Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Summary Excerpt & Subtitle <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.excerpt.length}/250 chars
                </span>
              </div>
              <textarea
                name="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="A compelling 1-2 sentence lead overview. Displayed prominently below article headline and as the default search engine snippet..."
                className="input-field text-xs leading-relaxed resize-none w-full"
              />
            </div>
          </div>

          {/* WYSIWYG & Raw HTML Body Content Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Article Body Content</h3>
                  <p className="text-[11px] text-slate-500">
                    Use Heading 2 & Heading 3 to automatically generate the reader Table of Contents.
                  </p>
                </div>
              </div>
              <span className="badge badge-indigo font-mono text-[11px]">
                {wordCount} words
              </span>
            </div>

            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Start drafting your article... Format key sections with Heading 2 (H2) and sub-sections with Heading 3 (H3)."
            />
          </div>

          {/* Change Summary (for Revisions) */}
          {isEditMode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Version {formData.version + 1} Change Summary
              </label>
              <input
                type="text"
                name="changeSummary"
                value={formData.changeSummary}
                onChange={handleChange}
                placeholder="e.g. Added section on Meta WhatsApp Cloud API webhooks and latency benchmarks"
                className="input-field text-xs w-full"
              />
              <p className="text-[11px] text-slate-400">
                This note will be logged in the immutable revision snapshot history when saved.
              </p>
            </div>
          )}

          {/* SEO Metadata Accordion */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div
              className="flex items-center justify-between cursor-pointer select-none group"
              onClick={() => toggleSection('seo')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Search Engine Optimization (SEO) & Social Graph
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure Google search metadata, OpenGraph cards, and canonical URLs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${seoTitleStatus.color}`}>
                  SEO: {seoTitleStatus.label}
                </span>
                {openSections.seo ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {openSections.seo && (
              <div className="space-y-5 pt-4 border-t border-slate-100 animate-fade-in">
                {/* SEO Title Tag with Gauge Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      SEO Title Tag <span className="text-slate-400 font-normal">(Optimal: 40–60 chars)</span>
                    </label>
                    <span className={`text-xs ${seoTitleStatus.color}`}>
                      {seoTitleLen}/60 chars • {seoTitleStatus.label}
                    </span>
                  </div>
                  <input
                    type="text"
                    name="seoMetaTitle"
                    value={formData.seoMetaTitle}
                    onChange={handleChange}
                    placeholder={formData.title || 'Enter search engine title tag...'}
                    className="input-field text-xs w-full"
                  />
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${seoTitleStatus.barColor}`}
                      style={{ width: `${seoTitleStatus.pct}%` }}
                    />
                  </div>
                </div>

                {/* Meta Description with Gauge Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Meta Description <span className="text-slate-400 font-normal">(Optimal: 120–160 chars)</span>
                    </label>
                    <span className={`text-xs ${seoDescStatus.color}`}>
                      {seoDescLen}/160 chars • {seoDescStatus.label}
                    </span>
                  </div>
                  <textarea
                    name="seoMetaDescription"
                    rows={3}
                    value={formData.seoMetaDescription}
                    onChange={handleChange}
                    placeholder={formData.excerpt || 'Enter search engine snippet description...'}
                    className="input-field text-xs w-full resize-none leading-relaxed"
                  />
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${seoDescStatus.barColor}`}
                      style={{ width: `${seoDescStatus.pct}%` }}
                    />
                  </div>
                </div>

                {/* Canonical URL & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Canonical URL Override (Optional)
                    </label>
                    <input
                      type="text"
                      name="seoCanonicalUrl"
                      value={formData.seoCanonicalUrl}
                      onChange={handleChange}
                      placeholder={`https://www.gyanvaniai.com/blog/${formData.slug}`}
                      className="input-field text-xs w-full font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Focus Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      name="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={handleChange}
                      placeholder="WhatsApp CRM, Meta Cloud API, Coexistence"
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                {/* Previews: Google SERP & Social Share Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <GoogleSearchPreview
                    title={formData.seoMetaTitle || formData.title}
                    description={formData.seoMetaDescription || formData.excerpt}
                    slug={formData.slug || 'article-slug'}
                  />

                  <SocialSharePreview
                    title={formData.seoMetaTitle || formData.title}
                    description={formData.seoMetaDescription || formData.excerpt}
                    imageUrl={formData.seoOgImage || formData.featuredImageUrl}
                  />
                </div>
              </div>
            )}
          </div>

          {/* AEO (Answer Engine Optimization) Accordion */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div
              className="flex items-center justify-between cursor-pointer select-none group"
              onClick={() => toggleSection('aeo')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    AEO Studio (Answer Engine Optimization for AI Search)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Structure content for Google AI Overviews, Perplexity, ChatGPT & Claude citations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.aeo ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {openSections.aeo && (
              <div className="pt-4 border-t border-slate-100 animate-fade-in">
                <AeoPanel
                  title={formData.title}
                  excerpt={formData.excerpt}
                  content={formData.content}
                  seoDescription={formData.seoMetaDescription}
                  aeoData={formData.aeo}
                  onChange={(nextAeo) => setFormData((prev) => ({ ...prev, aeo: nextAeo }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workflow, Taxonomy & Asset Panels (1 col) */}
        <div className="space-y-6">
          {/* Publishing Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleSection('publishing')}
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Publishing Workflow</span>
              </h3>
              {openSections.publishing ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.publishing && (
              <div className="space-y-4 pt-1 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Publication State
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field text-xs w-full font-bold"
                  >
                    <option value="draft">Draft (Private editorial)</option>
                    <option value="review">In Review (Editorial approval required)</option>
                    {hasPermission('posts.publish') && (
                      <option value="published">Published (Live on public website)</option>
                    )}
                    <option value="archived">Archived (Unlisted)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                  >
                    Feature on Blog Hero Banner
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave()}
                    className="btn-secondary text-xs w-full justify-center py-2.5 font-bold shadow-xs"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Draft Changes</span>
                  </button>

                  {hasPermission('posts.publish') && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handlePublishNow}
                      className="btn-primary text-xs w-full justify-center py-2.5 font-bold shadow-md"
                    >
                      <Globe className="w-4 h-4" />
                      <span>
                        {formData.status === 'published' ? 'Update Live Article' : 'Publish to Live Website'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editorial Review Workflow Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleSection('editorialReview')}
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Editorial Governance</span>
              </h3>
              {openSections.editorialReview ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.editorialReview && (
              <div className="pt-1 animate-fade-in">
                <EditorialReviewPanel
                  reviewData={formData.editorialReview}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, editorialReview: updated }))
                  }
                  onStatusChange={(newStatus) => {
                    if (newStatus === 'in_review') {
                      setFormData((prev) => ({ ...prev, status: 'review' }));
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Taxonomy: Category & Tag Pills Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleSection('taxonomy')}
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-4 h-4 text-indigo-600" />
                <span>Taxonomy & Tags</span>
              </h3>
              {openSections.taxonomy ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.taxonomy && (
              <div className="space-y-4 pt-1 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Primary Content Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field text-xs w-full font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Article Tags ({formData.tags?.length || 0})
                  </label>
                  <TagsInput
                    tags={formData.tags}
                    onChange={(nextTags) => setFormData((prev) => ({ ...prev, tags: nextTags }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Canvas WebP Featured Image Asset Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleSection('featuredImage')}
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Cover Image Asset</span>
              </h3>
              {openSections.featuredImage ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.featuredImage && (
              <div className="pt-1 animate-fade-in">
                <FeaturedImageUpload
                  value={formData.featuredImageUrl}
                  altText={formData.featuredImageAlt}
                  onChange={(url) => setFormData((prev) => ({ ...prev, featuredImageUrl: url }))}
                  onAltChange={(alt) => setFormData((prev) => ({ ...prev, featuredImageAlt: alt }))}
                />
              </div>
            )}
          </div>

          {/* Internal Link Recommendations Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleSection('internalLinks')}
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>Internal Cross-Links</span>
              </h3>
              {openSections.internalLinks ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.internalLinks && (
              <div className="pt-1 animate-fade-in">
                <InternalLinkPanel
                  currentPostId={id}
                  currentCategory={formData.category}
                  currentTags={formData.tags}
                  onInsertLink={handleInsertInternalLink}
                />
              </div>
            )}
          </div>

          {/* Revisions Drawer Box */}
          {showRevisions && revisions.length > 0 && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Revision History</span>
                </h3>
                <span className="badge badge-indigo font-mono text-[11px] font-bold">
                  {revisions.length} snapshots
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-slate font-mono text-[10px] font-bold">v{rev.version}</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {rev.changeSummary || 'Revision snapshot'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {hasPermission('posts.update') && rev.version !== formData.version && (
                      <button
                        type="button"
                        onClick={() => handleRollback(rev.version)}
                        className="btn-secondary text-[11px] py-1 px-2.5 font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
