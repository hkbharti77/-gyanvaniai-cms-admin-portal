import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit3,
  ExternalLink,
  Sparkles,
  Layers,
  Globe,
  Share2,
  FileText,
  RefreshCw,
  Loader2,
  Check,
  X,
  Smartphone,
  Monitor,
  Download,
  Tag,
  ArrowRight,
  Info,
  ShieldCheck,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

/* ── Helper: Evaluate Single Post SEO ────────────────────────────────────── */
function analyzePostSeo(post) {
  const title = (post.seo?.metaTitle || post.title || '').trim();
  const titleLen = title.length;
  const isTitleOptimal = titleLen >= 40 && titleLen <= 60;
  const isTitleTooShort = titleLen > 0 && titleLen < 40;
  const isTitleTooLong = titleLen > 60;
  const isTitleMissing = titleLen === 0;

  const desc = (post.seo?.metaDescription || post.excerpt || '').trim();
  const descLen = desc.length;
  const isDescOptimal = descLen >= 120 && descLen <= 160;
  const isDescTooShort = descLen > 0 && descLen < 120;
  const isDescTooLong = descLen > 160;
  const isDescMissing = descLen === 0;

  const rawOgImage = post.seo?.ogImage || (typeof post.featuredImage === 'string' ? post.featuredImage : post.featuredImage?.url) || post.imageUrl || '';
  const hasOgImage = Boolean(rawOgImage && rawOgImage.trim().length > 5);

  const rawKeywords = post.seo?.keywords;
  const keywords = Array.isArray(rawKeywords)
    ? rawKeywords.map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean)
    : (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(s => s.trim()).filter(Boolean) : []);
  const hasKeywords = keywords.length > 0;

  const canonical = post.seo?.canonicalUrl || (post.slug ? `https://www.gyanvaniai.com/blog/${post.slug}` : '');
  const hasCanonical = Boolean(canonical && canonical.startsWith('http'));

  // Calculate composite score (out of 100)
  let score = 0;
  if (isTitleOptimal) score += 25;
  else if (!isTitleMissing) score += 15;

  if (isDescOptimal) score += 30;
  else if (!isDescMissing) score += 15;

  if (hasOgImage) score += 20;
  if (hasKeywords) score += 15;
  if (hasCanonical) score += 10;

  let grade = 'Needs Work';
  let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  let barColor = 'bg-rose-500';

  if (score >= 85) {
    grade = 'Optimized';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    barColor = 'bg-emerald-500';
  } else if (score >= 60) {
    grade = 'Moderate';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return {
    post,
    title,
    titleLen,
    isTitleOptimal,
    isTitleTooShort,
    isTitleTooLong,
    isTitleMissing,
    desc,
    descLen,
    isDescOptimal,
    isDescTooShort,
    isDescTooLong,
    isDescMissing,
    ogImage: rawOgImage,
    hasOgImage,
    keywords,
    hasKeywords,
    canonical,
    hasCanonical,
    score,
    grade,
    badgeColor,
    barColor,
  };
}

export default function BlogSeoManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'keywords' | 'opportunities' | 'technical'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');

  // Quick Edit Drawer State
  const [editingPost, setEditingPost] = useState(null);
  const [drawerTab, setDrawerTab] = useState('seo'); // 'seo' | 'aeo' | 'geo'
  const [editForm, setEditForm] = useState({
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoCanonicalUrl: '',
    seoOgImage: '',
    seoKeywords: '',
    // AEO (Answer Engine Optimization)
    aeoDirectQuestion: '',
    aeoDirectAnswer: '',
    aeoKeyTakeaways: '',
    // GEO (Generative & Geographic Targeting)
    geoTargetCountry: 'Global',
    geoTargetCity: '',
    geoLanguage: 'en-US',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPingingIndexNow, setIsPingingIndexNow] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // SERP Preview Modal / Drawer Device Preview
  const [previewDevice, setPreviewDevice] = useState('desktop');

  /* ── Load Posts ──────────────────────────────────────────────────────────── */
  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await api.getPosts({ limit: 100 });
      const rawList = res?.posts || (Array.isArray(res) ? res : []);
      setPosts(rawList);
    } catch (err) {
      console.error('Failed to load posts for SEO audit:', err);
      setError(err.message || 'Failed to load blog posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* ── Analyze All Posts ───────────────────────────────────────────────────── */
  const auditedPosts = useMemo(() => {
    return posts.map(analyzePostSeo);
  }, [posts]);

  /* ── Global Statistics ───────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = auditedPosts.length;
    if (total === 0) {
      return {
        total: 0,
        publishedTotal: 0,
        avgScore: 0,
        optimalTitles: 0,
        optimalDescriptions: 0,
        missingOg: 0,
        uniqueKeywordsCount: 0,
        cannibalizedKeywords: [],
      };
    }

    const published = auditedPosts.filter(p => p.post.status === 'published');
    const publishedTotal = published.length || total;
    const targetSet = published.length > 0 ? published : auditedPosts;

    const totalScore = targetSet.reduce((sum, p) => sum + p.score, 0);
    const avgScore = Math.round(totalScore / targetSet.length);

    const optimalTitles = targetSet.filter(p => p.isTitleOptimal).length;
    const optimalDescriptions = targetSet.filter(p => p.isDescOptimal).length;
    const missingOg = targetSet.filter(p => !p.hasOgImage).length;
    const missingDesc = targetSet.filter(p => p.isDescMissing).length;

    // Keyword index and cannibalization detection
    const keywordMap = {};
    targetSet.forEach(item => {
      item.keywords.forEach(kw => {
        const normalized = kw.toLowerCase().trim();
        if (!keywordMap[normalized]) {
          keywordMap[normalized] = { keyword: kw, posts: [] };
        }
        keywordMap[normalized].posts.push(item);
      });
    });

    const uniqueKeywordsCount = Object.keys(keywordMap).length;
    const cannibalizedKeywords = Object.values(keywordMap).filter(v => v.posts.length > 1);

    return {
      total,
      publishedTotal,
      avgScore,
      optimalTitles,
      optimalDescriptions,
      missingOg,
      missingDesc,
      uniqueKeywordsCount,
      keywordMap,
      cannibalizedKeywords,
    };
  }, [auditedPosts]);

  /* ── Filtered Posts for Table ────────────────────────────────────────────── */
  const filteredPosts = useMemo(() => {
    return auditedPosts.filter(item => {
      // Status filter
      if (statusFilter !== 'all' && item.post.status !== statusFilter) {
        return false;
      }

      // Health filter
      if (healthFilter === 'optimized' && item.score < 85) return false;
      if (healthFilter === 'needs-attention' && item.score >= 85) return false;
      if (healthFilter === 'missing-desc' && !item.isDescMissing) return false;
      if (healthFilter === 'missing-og' && item.hasOgImage) return false;
      if (healthFilter === 'missing-keywords' && item.hasKeywords) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = (item.post.title || '').toLowerCase().includes(query);
        const seoTitleMatch = item.title.toLowerCase().includes(query);
        const slugMatch = (item.post.slug || '').toLowerCase().includes(query);
        const kwMatch = item.keywords.some(k => k.toLowerCase().includes(query));
        if (!titleMatch && !seoTitleMatch && !slugMatch && !kwMatch) {
          return false;
        }
      }

      return true;
    });
  }, [auditedPosts, statusFilter, healthFilter, searchTerm]);

  /* ── Open Quick Edit Drawer ──────────────────────────────────────────────── */
  const handleOpenEdit = (postItem) => {
    const p = postItem.post;
    setEditingPost(postItem);
    setDrawerTab('seo');
    setEditForm({
      seoMetaTitle: p.seo?.metaTitle || p.title || '',
      seoMetaDescription: p.seo?.metaDescription || p.excerpt || '',
      seoCanonicalUrl: p.seo?.canonicalUrl || (p.slug ? `https://www.gyanvaniai.com/blog/${p.slug}` : ''),
      seoOgImage: p.seo?.ogImage || (typeof p.featuredImage === 'string' ? p.featuredImage : p.featuredImage?.url) || p.imageUrl || '',
      seoKeywords: Array.isArray(p.seo?.keywords)
        ? p.seo.keywords.join(', ')
        : (typeof p.seo?.keywords === 'string' ? p.seo.keywords : ''),
      // AEO fields
      aeoDirectQuestion: p.aeo?.directQuestion || `What is ${p.title} and how does it work?`,
      aeoDirectAnswer: p.aeo?.directAnswer || p.excerpt || '',
      aeoKeyTakeaways: Array.isArray(p.aeo?.keyTakeaways)
        ? p.aeo.keyTakeaways.join('\n')
        : (typeof p.aeo?.keyTakeaways === 'string' ? p.aeo.keyTakeaways : ''),
      // GEO fields
      geoTargetCountry: p.geo?.targetCountry || 'Global',
      geoTargetCity: p.geo?.targetCity || '',
      geoLanguage: p.geo?.language || 'en-US',
    });
  };

  const handleCloseEdit = () => {
    setEditingPost(null);
  };

  /* ── Instant IndexNow Search Engine Ping ──────────────────────────────────── */
  const handlePingIndexNow = async (postId) => {
    setIsPingingIndexNow(true);
    setSaveToast(null);
    try {
      await api.pingPostIndexNow(postId);
      setSaveToast({
        type: 'success',
        message: 'Bing, Yandex, Seznam & partner engines notified for immediate indexation!',
      });
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error('IndexNow ping failed:', err);
      setSaveToast({ type: 'error', message: err.message || 'Failed to ping search engines.' });
    } finally {
      setIsPingingIndexNow(false);
    }
  };

  /* ── Save SEO, AEO & GEO Metadata ─────────────────────────────────────────── */
  const handleSaveSeo = async (e) => {
    e?.preventDefault();
    if (!editingPost) return;

    setIsSaving(true);
    setSaveToast(null);

    const postId = editingPost.post._id || editingPost.post.id;
    const keywordsArray = editForm.seoKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const takeawaysArray = editForm.aeoKeyTakeaways
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const updatedSeoPayload = {
      metaTitle: editForm.seoMetaTitle.trim(),
      metaDescription: editForm.seoMetaDescription.trim(),
      canonicalUrl: editForm.seoCanonicalUrl.trim(),
      ogImage: editForm.seoOgImage.trim(),
      keywords: keywordsArray,
    };

    const updatedAeoPayload = {
      directQuestion: editForm.aeoDirectQuestion.trim(),
      directAnswer: editForm.aeoDirectAnswer.trim(),
      keyTakeaways: takeawaysArray,
    };

    const updatedGeoPayload = {
      targetCountry: editForm.geoTargetCountry.trim(),
      targetCity: editForm.geoTargetCity.trim(),
      language: editForm.geoLanguage.trim(),
    };

    try {
      await api.updatePost(postId, {
        seo: updatedSeoPayload,
        aeo: updatedAeoPayload,
        geo: updatedGeoPayload,
        changeSummary: 'Advanced SEO, AEO & GEO Optimization',
      });

      // Update local state smoothly
      setPosts(prev =>
        prev.map(p => {
          if ((p._id || p.id) === postId) {
            return {
              ...p,
              seo: {
                ...(p.seo || {}),
                ...updatedSeoPayload,
              },
              aeo: {
                ...(p.aeo || {}),
                ...updatedAeoPayload,
              },
              geo: {
                ...(p.geo || {}),
                ...updatedGeoPayload,
              },
            };
          }
          return p;
        })
      );

      setSaveToast({
        type: 'success',
        message: 'SEO, AEO & GEO metadata updated and pushed to search engines!',
      });
      setTimeout(() => {
        setSaveToast(null);
        handleCloseEdit();
      }, 1400);
    } catch (err) {
      console.error('Failed to update metadata:', err);
      setSaveToast({ type: 'error', message: err.message || 'Failed to save metadata.' });
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Export CSV Report ───────────────────────────────────────────────────── */
  const handleExportCsv = () => {
    if (auditedPosts.length === 0) return;
    const headers = ['Title', 'Slug', 'Status', 'SEO Score', 'SEO Title', 'SEO Title Chars', 'Meta Description', 'Desc Chars', 'OG Image Exists', 'Focus Keywords', 'Canonical URL'];
    const rows = auditedPosts.map(p => [
      `"${(p.post.title || '').replace(/"/g, '""')}"`,
      `"${p.post.slug || ''}"`,
      `"${p.post.status || ''}"`,
      p.score,
      `"${p.title.replace(/"/g, '""')}"`,
      p.titleLen,
      `"${p.desc.replace(/"/g, '""')}"`,
      p.descLen,
      p.hasOgImage ? 'Yes' : 'No',
      `"${p.keywords.join(', ').replace(/"/g, '""')}"`,
      `"${p.canonical}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blog-seo-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live drawer length indicators
  const drawerTitleLen = editForm.seoMetaTitle.length;
  const drawerDescLen = editForm.seoMetaDescription.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Search Engine Optimization Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>SEO Intelligence & Growth Hub</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit, optimize, and manage search engine rankings, Google SERP snippets, and social graph cards for all blog articles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
            className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
            title="Refresh SEO metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>{refreshing ? 'Auditing...' : 'Re-Audit'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={auditedPosts.length === 0}
            className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
            title="Export CSV audit report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <a
            href="https://www.gyanvaniai.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs h-9 px-3.5 flex items-center gap-1.5"
          >
            <span>Live Blog</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/90" />
          </a>
        </div>
      </div>

      {/* ── Metric Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="card-enterprise p-5 flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={stats.avgScore >= 80 ? 'text-emerald-500' : stats.avgScore >= 60 ? 'text-amber-500' : 'text-rose-500'}
                strokeDasharray={`${stats.avgScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900">{stats.avgScore}%</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Index</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {stats.avgScore >= 80 ? 'High Optimization' : stats.avgScore >= 60 ? 'Moderate Health' : 'Needs Optimization'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {stats.total} total articles
            </div>
          </div>
        </div>

        {/* Optimal Titles */}
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title Tags</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.optimalTitles} <span className="text-xs font-normal text-slate-400">/ {stats.total}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            40–60 chars optimal Google length
          </div>
        </div>

        {/* Optimal Descriptions */}
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meta Descriptions</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.optimalDescriptions} <span className="text-xs font-normal text-slate-400">/ {stats.total}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.missingDesc > 0 ? (
              <span className="text-rose-600 font-medium">{stats.missingDesc} missing descriptions</span>
            ) : (
              '120–160 chars optimal SERP snippet'
            )}
          </div>
        </div>

        {/* Keywords & Cannibalization */}
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Keywords & Intent</span>
            <span className={`p-1.5 rounded-lg ${stats.cannibalizedKeywords.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.uniqueKeywordsCount} <span className="text-xs font-normal text-slate-400">keywords</span>
          </div>
          <div className="text-[11px] mt-1">
            {stats.cannibalizedKeywords.length > 0 ? (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {stats.cannibalizedKeywords.length} cannibalization conflicts
              </span>
            ) : (
              <span className="text-slate-500">No keyword conflicts detected</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Articles SEO Audit</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {filteredPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'keywords'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Keyword Coverage & Cannibalization</span>
            {stats.cannibalizedKeywords.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold">
                {stats.cannibalizedKeywords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('opportunities')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'opportunities'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>High-Impact Opportunities</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'technical'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Technical & Sitemaps</span>
          </button>
        </nav>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchPosts()} className="ml-auto underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* ── Tab 1: Articles SEO Audit ──────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="card-enterprise p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by article title, slug, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 text-xs h-9"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field text-xs h-9 py-1 px-2.5 w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="review">Review</option>
              </select>

              {/* Health Filter */}
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="input-field text-xs h-9 py-1 px-2.5 w-auto"
              >
                <option value="all">All SEO Health</option>
                <option value="needs-attention">Needs Attention (Score &lt; 85)</option>
                <option value="optimized">Optimized (Score 85+)</option>
                <option value="missing-desc">Missing Description</option>
                <option value="missing-og">Missing OG Image</option>
                <option value="missing-keywords">Missing Keywords</option>
              </select>
            </div>
          </div>

          {/* Audit Table */}
          <div className="card-enterprise overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-medium">Running search engine optimization audit...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800">No articles match your filter</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-3">SEO Health</th>
                      <th className="py-3 px-3">Title Tag (40–60)</th>
                      <th className="py-3 px-3">Description (120–160)</th>
                      <th className="py-3 px-3">OG Image</th>
                      <th className="py-3 px-3">Keywords</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPosts.map((item) => {
                      const p = item.post;
                      const postId = p._id || p.id;
                      return (
                        <tr key={postId} className="hover:bg-slate-50/60 transition-colors">
                          {/* Article Info */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 truncate" title={p.title}>
                              {p.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500">/{p.slug || 'no-slug'}</span>
                              <span>•</span>
                              <span className={`capitalize font-medium ${p.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {p.status}
                              </span>
                            </div>
                          </td>

                          {/* SEO Health Score */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${item.barColor} transition-all`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-slate-800 text-[11px]">{item.score}%</span>
                            </div>
                            <span className={`inline-block mt-1 px-1.5 py-0.2 text-[10px] font-medium rounded border ${item.badgeColor}`}>
                              {item.grade}
                            </span>
                          </td>

                          {/* Title Tag */}
                          <td className="py-3.5 px-3 max-w-[200px]">
                            <div className="truncate text-slate-700 font-medium" title={item.title}>
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                  item.isTitleOptimal
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.isTitleMissing
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {item.titleLen} chars
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {item.isTitleOptimal ? 'Optimal' : item.isTitleTooShort ? 'Too Short' : item.isTitleTooLong ? 'Too Long' : 'Missing'}
                              </span>
                            </div>
                          </td>

                          {/* Meta Description */}
                          <td className="py-3.5 px-3 max-w-[220px]">
                            {item.isDescMissing ? (
                              <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Missing snippet
                              </span>
                            ) : (
                              <>
                                <div className="truncate text-slate-600 text-[11px]" title={item.desc}>
                                  {item.desc}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                      item.isDescOptimal
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {item.descLen} chars
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {item.isDescOptimal ? 'Optimal' : item.isDescTooShort ? 'Under 120' : 'Over 160'}
                                  </span>
                                </div>
                              </>
                            )}
                          </td>

                          {/* OG Image */}
                          <td className="py-3.5 px-3">
                            {item.hasOgImage ? (
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={item.ogImage}
                                  alt="OG Preview"
                                  className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Ready
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Missing OG
                              </span>
                            )}
                          </td>

                          {/* Keywords */}
                          <td className="py-3.5 px-3 max-w-[140px]">
                            {item.hasKeywords ? (
                              <div className="flex flex-wrap gap-1">
                                {item.keywords.slice(0, 2).map((k, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] truncate max-w-[110px]"
                                    title={k}
                                  >
                                    {k}
                                  </span>
                                ))}
                                {item.keywords.length > 2 && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    +{item.keywords.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">None</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                title="Quick Edit SEO Metadata"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Quick SEO</span>
                              </button>

                              <Link
                                to={`/admin/blog/posts/edit/${postId}`}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                title="Open Full Post Editor"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Keyword Coverage & Cannibalization ──────────────────────── */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {/* Cannibalization Warning Banner if any conflicts exist */}
          {stats.cannibalizedKeywords.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Keyword Cannibalization Alert ({stats.cannibalizedKeywords.length} terms found)</span>
              </div>
              <p className="mt-1 text-amber-800 leading-relaxed">
                When multiple articles target the exact same focus keyword, they compete against each other in Google rankings, diluting your organic search authority. Differentiate intent or consolidate competing posts.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Great job! No keyword cannibalization conflicts detected across your blog articles.</span>
            </div>
          )}

          {/* Keywords Grid / Grouping */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.keywordMap &&
              Object.entries(stats.keywordMap).map(([normKey, group]) => {
                const isConflict = group.posts.length > 1;
                return (
                  <div
                    key={normKey}
                    className={`card-enterprise p-4 transition-all ${
                      isConflict ? 'border-amber-300 bg-amber-50/20' : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold">
                        <Tag className="w-3 h-3 text-indigo-600" />
                        <span>{group.keyword}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isConflict ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {group.posts.length} {group.posts.length === 1 ? 'article' : 'competing articles'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {group.posts.map((pItem) => {
                        const pid = pItem.post._id || pItem.post.id;
                        return (
                          <div
                            key={pid}
                            className="flex items-center justify-between text-xs p-1.5 rounded bg-white border border-slate-100"
                          >
                            <span className="truncate max-w-[200px] text-slate-700 font-medium" title={pItem.post.title}>
                              {pItem.post.title}
                            </span>
                            <button
                              onClick={() => handleOpenEdit(pItem)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Edit SEO
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Tab 3: High-Impact Opportunities ───────────────────────────────── */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action 1: Missing Meta Descriptions */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Missing Meta Descriptions</h3>
                <p className="text-[11px] text-slate-500">Google creates random snippet previews if missing.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {auditedPosts.filter(p => p.isDescMissing).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  All articles have meta descriptions!
                </div>
              ) : (
                auditedPosts
                  .filter(p => p.isDescMissing)
                  .map(p => (
                    <div key={p.post._id || p.post.id} className="py-2.5 flex items-center justify-between">
                      <span className="truncate max-w-xs text-xs text-slate-800 font-medium">
                        {p.post.title}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Fix Now →
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Action 2: Titles Under 40 Characters */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Short SEO Titles (&lt; 40 chars)</h3>
                <p className="text-[11px] text-slate-500">Expand title to 40–60 characters to capture more search volume.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {auditedPosts.filter(p => p.isTitleTooShort).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  No short titles found!
                </div>
              ) : (
                auditedPosts
                  .filter(p => p.isTitleTooShort)
                  .map(p => (
                    <div key={p.post._id || p.post.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="truncate max-w-xs text-xs text-slate-800 font-medium block">
                          {p.post.title}
                        </span>
                        <span className="text-[10px] text-amber-600 font-mono">
                          Current: {p.titleLen} chars
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Optimize →
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Action 3: Missing Social OG Images */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Share2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Missing Open Graph Share Image</h3>
                <p className="text-[11px] text-slate-500">Articles shared on WhatsApp/LinkedIn without banner cards.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {auditedPosts.filter(p => !p.hasOgImage).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  All articles have dedicated share graphics!
                </div>
              ) : (
                auditedPosts
                  .filter(p => !p.hasOgImage)
                  .map(p => (
                    <div key={p.post._id || p.post.id} className="py-2.5 flex items-center justify-between">
                      <span className="truncate max-w-xs text-xs text-slate-800 font-medium">
                        {p.post.title}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Set Image →
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Action 4: Missing Keywords */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Tag className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Articles Missing Focus Keywords</h3>
                <p className="text-[11px] text-slate-500">Add 2–4 targeted search queries to track search rankings.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {auditedPosts.filter(p => !p.hasKeywords).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  All articles have target keywords indexed!
                </div>
              ) : (
                auditedPosts
                  .filter(p => !p.hasKeywords)
                  .map(p => (
                    <div key={p.post._id || p.post.id} className="py-2.5 flex items-center justify-between">
                      <span className="truncate max-w-xs text-xs text-slate-800 font-medium">
                        {p.post.title}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Add Keywords →
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Technical & Sitemaps ────────────────────────────────────── */}
      {activeTab === 'technical' && (
        <div className="space-y-4 max-w-4xl">
          <div className="card-enterprise p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">XML Sitemaps & Search Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Verify search crawler access and structured Schema.org data delivered by your website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Blog XML Sitemap</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2 break-all">
                  https://www.gyanvaniai.com/blog-sitemap.xml
                </p>
                <div className="mt-3">
                  <a
                    href="https://www.gyanvaniai.com/blog-sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    <span>Inspect XML Output</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Robots.txt Directive</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2 break-all">
                  https://www.gyanvaniai.com/robots.txt
                </p>
                <div className="mt-3">
                  <a
                    href="https://www.gyanvaniai.com/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    <span>View Robots.txt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Automatic Schema.org & AEO Engines</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                When you publish any blog article, your frontend automatically injects valid <strong>JSON-LD BlogPosting</strong>, <strong>BreadcrumbList</strong>, and <strong>QAPage AEO Schema</strong> into the page header, ensuring Google Rich Snippet compliance and generative AI citation indexing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Quick Edit Drawer ───────────────────────────────────── */}
      {editingPost && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-fade-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-3 h-3" />
                  <span>Quick SEO Optimizer</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-md">
                  {editingPost.post.title}
                </h2>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex space-x-4">
              <button
                type="button"
                onClick={() => setDrawerTab('seo')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'seo'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search SEO & Meta</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('aeo')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'aeo'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AEO (AI Answer Engines)</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('geo')}
                className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'geo'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>GEO (Regional Targeting)</span>
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleSaveSeo} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Toast Notification */}
              {saveToast && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    saveToast.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {saveToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{saveToast.message}</span>
                </div>
              )}

              {/* ── SUB-TAB 1: Standard SEO & SERP ── */}
              {drawerTab === 'seo' && (
                <div className="space-y-5">
                  {/* Live Google Search Preview (SERP Card) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Live Google SERP Snippet Preview
                      </span>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1 rounded text-xs ${
                            previewDevice === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                          }`}
                          title="Desktop Search Preview"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1 rounded text-xs ${
                            previewDevice === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                          }`}
                          title="Mobile Search Preview"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`p-3.5 rounded-lg bg-white border border-slate-200 font-sans ${
                        previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          G
                        </div>
                        <div className="truncate text-xs text-slate-800 font-normal">
                          <span>www.gyanvaniai.com</span>
                          <span className="text-slate-400 mx-1">›</span>
                          <span>blog</span>
                          <span className="text-slate-400 mx-1">›</span>
                          <span className="text-slate-500">{editingPost.post.slug}</span>
                        </div>
                      </div>
                      <h4 className="text-[15px] font-medium text-[#1a0dab] hover:underline cursor-pointer truncate leading-snug">
                        {editForm.seoMetaTitle || editingPost.post.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {editForm.seoMetaDescription || editingPost.post.excerpt || 'Enter a meta description to preview how your article snippet appears to searchers on Google.'}
                      </p>
                    </div>
                  </div>

                  {/* Field 1: SEO Title Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        SEO Meta Title <span className="text-slate-400 font-normal">(Optimal: 40–60 chars)</span>
                      </label>
                      <span
                        className={`text-xs font-mono font-medium ${
                          drawerTitleLen >= 40 && drawerTitleLen <= 60
                            ? 'text-emerald-600'
                            : drawerTitleLen === 0
                            ? 'text-slate-400'
                            : 'text-amber-600'
                        }`}
                      >
                        {drawerTitleLen}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editForm.seoMetaTitle}
                      onChange={(e) => setEditForm(prev => ({ ...prev, seoMetaTitle: e.target.value }))}
                      placeholder="e.g. Enterprise WhatsApp CRM Automation Guide (2026)"
                      className="input-field text-xs"
                    />
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          drawerTitleLen >= 40 && drawerTitleLen <= 60
                            ? 'bg-emerald-500'
                            : drawerTitleLen > 60
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (drawerTitleLen / 60) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Field 2: Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        SEO Meta Description <span className="text-slate-400 font-normal">(Optimal: 120–160 chars)</span>
                      </label>
                      <span
                        className={`text-xs font-mono font-medium ${
                          drawerDescLen >= 120 && drawerDescLen <= 160
                            ? 'text-emerald-600'
                            : drawerDescLen === 0
                            ? 'text-slate-400'
                            : 'text-amber-600'
                        }`}
                      >
                        {drawerDescLen}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editForm.seoMetaDescription}
                      onChange={(e) => setEditForm(prev => ({ ...prev, seoMetaDescription: e.target.value }))}
                      placeholder="Write a clear, enticing summary including your main focus keywords to maximize Google click-through rates..."
                      className="input-field text-xs leading-relaxed"
                    />
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          drawerDescLen >= 120 && drawerDescLen <= 160
                            ? 'bg-emerald-500'
                            : drawerDescLen > 160
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (drawerDescLen / 160) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Field 3: Focus Keywords */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Focus Keywords <span className="text-slate-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.seoKeywords}
                      onChange={(e) => setEditForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                      placeholder="e.g. WhatsApp Automation, CRM Software, Sales AI"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Field 4: Open Graph Image */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Open Graph Social Share Image URL
                    </label>
                    <input
                      type="text"
                      value={editForm.seoOgImage}
                      onChange={(e) => setEditForm(prev => ({ ...prev, seoOgImage: e.target.value }))}
                      placeholder="https://www.gyanvaniai.com/images/blog-banner.webp"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Field 5: Canonical URL */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={editForm.seoCanonicalUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, seoCanonicalUrl: e.target.value }))}
                      placeholder="https://www.gyanvaniai.com/blog/your-slug"
                      className="input-field text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* ── SUB-TAB 2: AEO (Answer Engine Optimization) ── */}
              {drawerTab === 'aeo' && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Answer Engine Optimization (AEO) Engine</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                      AEO structures your content as direct Q&A and bulleted key takeaways. Generative search engines (Perplexity, ChatGPT, Claude, and Google Gemini AI Overviews) prioritize these concise snippets for AI citations and answers.
                    </p>
                  </div>

                  {/* Direct Question */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Direct Question <span className="text-slate-400 font-normal">(Primary search query answered)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.aeoDirectQuestion}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aeoDirectQuestion: e.target.value }))}
                      placeholder="e.g. How does WhatsApp CRM automation increase sales conversions?"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Direct Answer */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Direct Answer <span className="text-slate-400 font-normal">(Optimal: 40–60 words for AI citations)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {editForm.aeoDirectAnswer.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={editForm.aeoDirectAnswer}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aeoDirectAnswer: e.target.value }))}
                      placeholder="Provide a clear, authoritative, and direct answer with zero fluff. AI search bots extract this directly into AI search overviews."
                      className="input-field text-xs leading-relaxed"
                    />
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Key Takeaways / TL;DR <span className="text-slate-400 font-normal">(One takeaway per line)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.aeoKeyTakeaways}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aeoKeyTakeaways: e.target.value }))}
                      placeholder="Enter 2 to 4 bullet points, one per line&#10;Sub-300ms response time on WhatsApp automation&#10;45% reduction in customer support operating costs&#10;Zero server management with automated webhooks"
                      className="input-field text-xs font-mono leading-relaxed"
                    />
                  </div>

                  {/* AI Overview Citation Card Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Overview Citation Preview
                      </span>
                      <span className="text-[10px] text-slate-400">Perplexity / ChatGPT format</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed italic">
                      "{editForm.aeoDirectAnswer || 'Direct answer preview will appear here...'}"
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>Source: Gyan VaniAi Technical Publications</span>
                      <span className="text-indigo-400 underline">gyanvaniai.com</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SUB-TAB 3: GEO (Geographic & Language Targeting) ── */}
              {drawerTab === 'geo' && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950">
                    <div className="font-bold flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Geographic Engine & International Targeting (GEO)</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                      Specify target country and language to deliver localized Schema.org geographical coverage (contentLocation, spatialCoverage) and optimize your organic visibility in localized regional search markets.
                    </p>
                  </div>

                  {/* Target Country */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Target Country / Region
                    </label>
                    <select
                      value={editForm.geoTargetCountry}
                      onChange={(e) => setEditForm(prev => ({ ...prev, geoTargetCountry: e.target.value }))}
                      className="input-field text-xs"
                    >
                      <option value="Global">Global (Worldwide Coverage)</option>
                      <option value="United States">United States (US)</option>
                      <option value="India">India (IN)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                      <option value="Singapore">Singapore (SG)</option>
                      <option value="Canada">Canada (CA)</option>
                      <option value="Australia">Australia (AU)</option>
                      <option value="Germany">Germany (DE)</option>
                      <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                    </select>
                  </div>

                  {/* Target City */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Target City / Hub <span className="text-slate-400 font-normal">(Optional for regional targeting)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.geoTargetCity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, geoTargetCity: e.target.value }))}
                      placeholder="e.g. New York, London, Bengaluru, Dubai"
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Document Language Code
                    </label>
                    <select
                      value={editForm.geoLanguage}
                      onChange={(e) => setEditForm(prev => ({ ...prev, geoLanguage: e.target.value }))}
                      className="input-field text-xs"
                    >
                      <option value="en-US">English (US - en-US)</option>
                      <option value="en-GB">English (UK - en-GB)</option>
                      <option value="en-IN">English (India - en-IN)</option>
                      <option value="hi-IN">Hindi (India - hi-IN)</option>
                      <option value="ar-AE">Arabic (UAE - ar-AE)</option>
                    </select>
                  </div>
                </div>
              )}
            </form>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {/* IndexNow Instant Search Engine Notification */}
              <button
                type="button"
                onClick={() => handlePingIndexNow(editingPost.post._id || editingPost.post.id)}
                disabled={isPingingIndexNow || isSaving}
                className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
                title="Instantly notify Bing, Yandex & partner search engines to re-crawl this URL"
              >
                {isPingingIndexNow ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{isPingingIndexNow ? 'Pinging Search Engines...' : 'Instant IndexNow Ping'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  className="btn-secondary text-xs h-9 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSeo}
                  disabled={isSaving}
                  className="btn-primary text-xs h-9 px-4 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save SEO & AEO</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
