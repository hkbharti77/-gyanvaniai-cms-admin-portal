import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Globe,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Loader2,
  Tag as TagIcon,
  ArrowUpDown,
  X,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers,
  Star,
  Copy,
  Calendar,
  User,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  Info,
  CheckSquare,
  Square,
  ArrowRight,
  Hash,
} from 'lucide-react';

export default function BlogManager() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0, review: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals & Drawers
  const [quickViewPost, setQuickViewPost] = useState(null);
  const [revisionsModal, setRevisionsModal] = useState({ open: false, postId: null, postTitle: '', revisions: [], loading: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, post: null, loading: false });
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedSlugId, setCopiedSlugId] = useState(null);
  const [brokenImages, setBrokenImages] = useState(new Set());

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPosts = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const params = {
        page,
        limit,
        status: statusFilter,
        category: categoryFilter,
        search: search.trim(),
        sortBy,
        sortOrder,
      };

      const data = await api.getPosts(params);
      setPosts(data.posts || []);
      setCounts(data.counts || { total: 0, published: 0, draft: 0, review: 0, archived: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || data.counts?.total || 0);
    } catch (err) {
      showToast(err.message || 'Failed to load articles', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, limit, statusFilter, categoryFilter, search, sortBy, sortOrder]);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await api.getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.warn('Failed to load categories for filter:', err);
      }
    }
    loadCats();
  }, []);

  // Multi-Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkActionLoading(true);
      const targets = posts.filter((p) => selectedIds.has(p.id) && p.status !== 'published');
      for (const p of targets) {
        await api.publishPost(p.id);
      }
      showToast(`Successfully published ${targets.length} articles to live website.`);
      setSelectedIds(new Set());
      loadPosts(true);
    } catch (err) {
      showToast(err.message || 'Bulk publish failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkActionLoading(true);
      const targets = posts.filter((p) => selectedIds.has(p.id) && p.status === 'published');
      for (const p of targets) {
        await api.unpublishPost(p.id);
      }
      showToast(`Moved ${targets.length} articles to draft.`);
      setSelectedIds(new Set());
      loadPosts(true);
    } catch (err) {
      showToast(err.message || 'Bulk unpublish failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      if (post.status === 'published') {
        await api.unpublishPost(post.id);
        showToast(`Article "${post.title}" moved to draft.`);
      } else {
        await api.publishPost(post.id);
        showToast(`Article "${post.title}" published live to gyanvaniai.com.`);
      }
      loadPosts(true);
    } catch (err) {
      showToast(err.message || 'Publish status toggle failed', 'error');
    }
  };

  const handleOpenRevisions = async (post) => {
    setRevisionsModal({ open: true, postId: post.id, postTitle: post.title, revisions: [], loading: true });
    try {
      const data = await api.getRevisions(post.id);
      setRevisionsModal((prev) => ({ ...prev, revisions: data.revisions || [], loading: false }));
    } catch (err) {
      showToast(err.message || 'Failed to load revisions', 'error');
      setRevisionsModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRollback = async (version) => {
    try {
      await api.rollbackRevision(revisionsModal.postId, version);
      showToast(`Successfully restored "${revisionsModal.postTitle}" to revision v${version}.`);
      setRevisionsModal({ open: false, postId: null, postTitle: '', revisions: [], loading: false });
      loadPosts(true);
    } catch (err) {
      showToast(err.message || 'Rollback failed', 'error');
    }
  };

  const handlePreview = async (post) => {
    try {
      if (post.status === 'published') {
        window.open(`https://www.gyanvaniai.com/blog/${post.slug}`, '_blank');
      } else {
        const tokenRes = await api.getPreviewToken(post.id);
        window.open(tokenRes.previewUrl, '_blank');
      }
    } catch (err) {
      showToast(err.message || 'Failed to open preview', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!deleteModal.post) return;
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      await api.deletePost(deleteModal.post.id);
      showToast(`Article "${deleteModal.post.title}" deleted.`);
      setDeleteModal({ open: false, post: null, loading: false });
      loadPosts(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCopySlug = (post) => {
    const fullUrl = `https://www.gyanvaniai.com/blog/${post.slug}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlugId(post.id);
      setTimeout(() => setCopiedSlugId(null), 2000);
    });
  };

  const handleImageError = (postId) => {
    setBrokenImages((prev) => new Set(prev).add(postId));
  };

  const getCategoryBadgeClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('ai') || cat.includes('agent')) return 'badge-purple';
    if (cat.includes('crm') || cat.includes('whatsapp')) return 'badge-teal';
    if (cat.includes('auto') || cat.includes('sales')) return 'badge-sky';
    if (cat.includes('tech') || cat.includes('cloud')) return 'badge-indigo';
    return 'badge-slate';
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="badge badge-emerald flex items-center gap-1.5 text-xs font-bold py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Published</span>
          </span>
        );
      case 'review':
        return (
          <span className="badge badge-cyan flex items-center gap-1.5 text-xs font-bold py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>In Review</span>
          </span>
        );
      case 'archived':
        return (
          <span className="badge badge-slate flex items-center gap-1.5 text-xs font-bold py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Archived</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-amber flex items-center gap-1.5 text-xs font-bold py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Draft</span>
          </span>
        );
    }
  };

  const isFilterActive = search.trim() !== '' || statusFilter !== 'all' || categoryFilter !== 'all';

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-fade-in border ${
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

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-500 font-medium">Editorial Content</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-semibold text-slate-900">Articles & Blog Manager</span>
        </div>

        {/* Title & Primary Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Articles & Blog Manager
              </h1>
              <span className="badge badge-indigo font-bold text-xs py-0.5 px-2.5">
                {counts.total} Total Articles
              </span>
              <button
                type="button"
                onClick={() => loadPosts(true)}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                title="Refresh article data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enterprise content governance suite: Author, edit, inspect SEO/AEO readiness, and rollback with immutable snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/admin/blog/categories"
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs font-semibold"
            >
              <TagIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Categories</span>
            </Link>

            <Link
              to="/admin/media"
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Media Library</span>
            </Link>

            {hasPermission('posts.create') && (
              <Link
                to="/admin/create"
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Metric KPI Cards (Clickable to Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Content Card */}
        <div
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
          className={`bg-white border rounded-2xl p-4.5 shadow-xs cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'all'
              ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="text-slate-700">Total Content</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{counts.total}</div>
            {statusFilter === 'all' && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">All published, drafts & reviews</span>
        </div>

        {/* Live Published Card */}
        <div
          onClick={() => {
            setStatusFilter('published');
            setPage(1);
          }}
          className={`bg-white border rounded-2xl p-4.5 shadow-xs cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'published'
              ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="text-emerald-800 font-bold">Live Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-emerald-700">{counts.published}</div>
            {statusFilter === 'published' && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-600/90 mt-1.5 block font-medium">Live on gyanvaniai.com</span>
        </div>

        {/* In Editorial Review Card */}
        <div
          onClick={() => {
            setStatusFilter('review');
            setPage(1);
          }}
          className={`bg-white border rounded-2xl p-4.5 shadow-xs cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'review'
              ? 'border-cyan-500 ring-2 ring-cyan-100 bg-cyan-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="text-cyan-800 font-bold">In Review</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-cyan-700">{counts.review}</div>
            {statusFilter === 'review' && (
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>
          <span className="text-[11px] text-cyan-600/90 mt-1.5 block font-medium">Pending editorial sign-off</span>
        </div>

        {/* Drafts Card */}
        <div
          onClick={() => {
            setStatusFilter('draft');
            setPage(1);
          }}
          className={`bg-white border rounded-2xl p-4.5 shadow-xs cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'draft'
              ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="text-amber-800 font-bold">Drafts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-amber-700">{counts.draft}</div>
            {statusFilter === 'draft' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>
          <span className="text-[11px] text-amber-600/90 mt-1.5 block font-medium">Private working copies</span>
        </div>
      </div>

      {/* Multi-Filter, Search & Sorting Control Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Tier 1: Status Filter Segmented Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Articles', count: counts.total },
              { id: 'published', label: 'Published', count: counts.published },
              { id: 'review', label: 'In Review', count: counts.review },
              { id: 'draft', label: 'Drafts', count: counts.draft },
              { id: 'archived', label: 'Archived', count: counts.archived },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/90 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Reset Filters Shortcut */}
          {isFilterActive && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Tier 2: Search, Category & Sorting Bar (Structured Grid/Flex) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input (Takes 6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by article title, excerpt, slug, or tags..."
              className="input-field pl-10 pr-8 py-2 text-xs w-full font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown (Takes 3 cols) */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field py-2 text-xs font-bold text-slate-700 w-full appearance-none pr-8 cursor-pointer"
              >
                <option value="all">📂 All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* Sorting Dropdown (Takes 3 cols) */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                className="input-field py-2 text-xs font-bold text-slate-700 w-full appearance-none pr-8 cursor-pointer"
              >
                <option value="createdAt-desc">⚡ Newest Created</option>
                <option value="createdAt-asc">⏳ Oldest Created</option>
                <option value="publishedAt-desc">🌐 Recently Published</option>
                <option value="title-asc">🔤 Title (A to Z)</option>
                <option value="title-desc">🔤 Title (Z to A)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Floating Bulk Selection Action Banner */}
        {selectedIds.size > 0 && (
          <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 flex items-center justify-between flex-wrap gap-2 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-indigo-950">
                {selectedIds.size} article{selectedIds.size > 1 ? 's' : ''} selected across repository
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasPermission('posts.publish') && (
                <>
                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={handleBulkPublish}
                    className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-xs"
                  >
                    {bulkActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>Publish Selected</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={handleBulkUnpublish}
                    className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-2xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Move to Draft</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 font-bold rounded-lg hover:bg-white transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Enterprise Articles Table Card */}
      <div className="table-container">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-slate-600 font-bold">Querying article catalog...</p>
            <span className="text-xs text-slate-400 mt-1">Applying filters and sorting parameters</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No articles found matching filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              We couldn't find any articles matching your search query or filter criteria. Try resetting filters or draft a new article.
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              {isFilterActive && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="btn-secondary text-xs px-3.5 py-2 font-bold"
                >
                  Clear Filters
                </button>
              )}
              {hasPermission('posts.create') && (
                <Link
                  to="/admin/create"
                  className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Article</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === posts.length && posts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="min-w-[280px]">Article & Content Overview</th>
                  <th className="min-w-[140px]">Category & Tags</th>
                  <th className="min-w-[110px]">Status</th>
                  <th className="min-w-[120px]">Governance & AEO</th>
                  <th className="min-w-[130px]">Publish Date</th>
                  <th className="text-right min-w-[170px] pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  const isImageBroken = brokenImages.has(post.id);
                  const hasAeo = Boolean(post.aeo?.directQuestion || post.aeoDirectQuestion);

                  return (
                    <tr
                      key={post.id}
                      className={`group transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(post.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Article Title, Thumbnail & Slug */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail Frame */}
                          <div className="w-15 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                            {post.featuredImage?.url && !isImageBroken ? (
                              <img
                                src={post.featuredImage.url}
                                alt={post.featuredImage.alt || post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={() => handleImageError(post.id)}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-indigo-500 font-extrabold text-xs">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                              </div>
                            )}

                            {post.isFeatured && (
                              <div
                                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs"
                                title="Featured Blog Post"
                              >
                                <Star className="w-2 h-2 fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Title & Metadata */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/admin/edit/${post.id}`}
                                className="font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 leading-snug"
                                title={post.title}
                              >
                                {post.title}
                              </Link>
                            </div>

                            {/* Canonical URL Slug Pill with Quick Copy */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100/90 px-1.5 py-0.2 rounded border border-slate-200/60 truncate max-w-[200px]">
                                /blog/{post.slug}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopySlug(post)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded hover:bg-slate-100"
                                title="Copy public URL"
                              >
                                {copiedSlugId === post.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Excerpt Teaser */}
                            {post.excerpt && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Tags Column */}
                      <td className="align-middle">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCategoryBadgeClass(post.category)}`}>
                            {post.category || 'General'}
                          </span>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                              {post.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60"
                                >
                                  #{t}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1 rounded">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="align-middle whitespace-nowrap">
                        {statusBadge(post.status)}
                      </td>

                      {/* Governance & AEO Readiness */}
                      <td className="align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenRevisions(post)}
                              className="badge badge-slate font-mono text-[10px] font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Click to view revision history"
                            >
                              v{post.version || 1}
                            </button>
                            {hasAeo ? (
                              <span
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded"
                                title="Optimized for Generative AI search (AEO ready)"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                <span>AEO</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{post.readingTimeMinutes || 1}m read</span>
                          </div>
                        </div>
                      </td>

                      {/* Published Date & Author Column */}
                      <td className="align-middle whitespace-nowrap">
                        <div className="text-xs text-slate-800 font-bold">
                          {post.publishedAt ? (
                            new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="text-slate-400 font-normal italic">Draft</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{post.author?.name || 'GyanVani Team'}</span>
                        </span>
                      </td>

                      {/* Action Buttons Toolbar (Always Visible & High Contrast) */}
                      <td className="text-right align-middle whitespace-nowrap pr-4">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick Inspect Drawer Button */}
                          <button
                            type="button"
                            onClick={() => setQuickViewPost(post)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                            title="Quick View Article Overview"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Live Preview Button */}
                          <button
                            type="button"
                            onClick={() => handlePreview(post)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                            title="Live Preview / Authenticated Preview Token"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Revisions History Drawer */}
                          <button
                            type="button"
                            onClick={() => handleOpenRevisions(post)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                            title="View Revisions & 1-Click Rollback"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Publish / Unpublish Toggle */}
                          {hasPermission('posts.publish') && (
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(post)}
                              className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                                post.status === 'published'
                                  ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                              title={
                                post.status === 'published'
                                  ? 'Unpublish article (Move to draft)'
                                  : 'Publish live to gyanvaniai.com'
                              }
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Article */}
                          {hasPermission('posts.update') && (
                            <Link
                              to={`/admin/edit/${post.id}`}
                              className="p-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 transition-colors shadow-2xs"
                              title="Edit Article in Publishing Suite"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete Article */}
                          {hasPermission('posts.delete') && (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ open: true, post, loading: false })}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                              title="Permanently Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enterprise Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900 font-bold">{posts.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
              <strong className="text-slate-900 font-bold">{Math.min(page * limit, totalCount)}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{totalCount}</strong> articles
            </span>

            {/* Rows Per Page Dropdown */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-400 text-[11px]">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs font-bold text-slate-700 cursor-pointer outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary text-xs px-2.5 py-1 disabled:opacity-30 disabled:cursor-not-allowed font-bold shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-2 text-xs font-bold text-slate-800">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary text-xs px-2.5 py-1 disabled:opacity-30 disabled:cursor-not-allowed font-bold shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Quick View Drawer */}
      {quickViewPost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border-l border-slate-200 w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Article Overview</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {quickViewPost.id}</span>
                </div>
              </div>
              <button
                onClick={() => setQuickViewPost(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Featured Image */}
              {quickViewPost.featuredImage?.url && (
                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={quickViewPost.featuredImage.url}
                    alt={quickViewPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {statusBadge(quickViewPost.status)}
                  <span className={`badge ${getCategoryBadgeClass(quickViewPost.category)} font-bold text-xs`}>
                    {quickViewPost.category}
                  </span>
                  <span className="badge badge-slate font-mono text-xs font-bold">
                    v{quickViewPost.version || 1}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {quickViewPost.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    /blog/{quickViewPost.slug}
                  </span>
                  <button
                    onClick={() => handleCopySlug(quickViewPost)}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              {quickViewPost.excerpt && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Article Summary
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {quickViewPost.excerpt}
                  </p>
                </div>
              )}

              {/* AEO Optimization Details */}
              {quickViewPost.aeo?.directQuestion && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Engine Optimization (AEO)</span>
                  </div>
                  <div className="text-xs text-slate-800">
                    <strong className="text-emerald-900">Target Question:</strong> {quickViewPost.aeo.directQuestion}
                  </div>
                  {quickViewPost.aeo.directAnswer && (
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-emerald-900">Direct Answer:</strong> {quickViewPost.aeo.directAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Estimated Reading Time</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{quickViewPost.readingTimeMinutes || 1} minutes</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Word Count</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{quickViewPost.wordCount || '—'} words</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Published Date</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">
                    {quickViewPost.publishedAt ? new Date(quickViewPost.publishedAt).toLocaleDateString() : 'Draft'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Author</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{quickViewPost.author?.name || 'Editorial Team'}</span>
                </div>
              </div>

              {/* Tags */}
              {quickViewPost.tags && quickViewPost.tags.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Assigned Tags
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {quickViewPost.tags.map((t, i) => (
                      <span key={i} className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => handlePreview(quickViewPost)}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/edit/${quickViewPost.id}`}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open Full Editor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision History & Rollback Modal */}
      {revisionsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Revision History & Snapshots</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{revisionsModal.postTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setRevisionsModal({ open: false, postId: null, postTitle: '', revisions: [], loading: false })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {revisionsModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                  <p className="text-xs text-slate-500 font-medium">Loading revision snapshots...</p>
                </div>
              ) : revisionsModal.revisions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 italic">No previous revision records found.</p>
              ) : (
                revisionsModal.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-indigo font-mono text-xs font-bold">v{rev.version}</span>
                        <span className="text-xs font-bold text-slate-900">{rev.changeSummary || 'Revision snapshot'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>By <strong>{rev.author?.name || 'Administrator'}</strong></span>
                        <span>•</span>
                        <span>{new Date(rev.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    </div>

                    {hasPermission('posts.update') && (
                      <button
                        onClick={() => handleRollback(rev.version)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-indigo-700 hover:bg-indigo-50 border-indigo-200 font-bold shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback to v{rev.version}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setRevisionsModal({ open: false, postId: null, postTitle: '', revisions: [], loading: false })}
                className="btn-secondary text-xs px-4 py-2 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Delete Article Permanently?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900 font-bold">{deleteModal.post.title}</strong>? All revision snapshots
                and analytics telemetry associated with this post will be erased.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                disabled={deleteModal.loading}
                onClick={() => setDeleteModal({ open: false, post: null, loading: false })}
                className="btn-secondary text-xs px-4 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={deleteModal.loading}
                onClick={handleDeletePost}
                className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-xs"
              >
                {deleteModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
