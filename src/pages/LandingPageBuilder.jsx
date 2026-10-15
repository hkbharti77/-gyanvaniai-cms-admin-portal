import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Save,
  Globe,
  History,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ShieldCheck,
  Zap,
  MessageSquare,
  Bot,
  Activity,
  Check,
  X,
  Search,
  Lock,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  PhoneCall,
  Mail,
  Share2,
  Copy,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';

const SECTION_KEYS = [
  { key: 'hero', label: '1. Hero & CTAs', icon: Zap },
  { key: 'trust', label: '2. Trust & Tech Stack', icon: ShieldCheck },
  { key: 'features', label: '3. Capabilities & Features', icon: Bot },
  { key: 'process', label: '4. Automation Workflow', icon: Activity },
  { key: 'industries', label: '5. Industry Solutions', icon: Layers },
  { key: 'omnichannel', label: '6. AI Orchestration', icon: MessageSquare },
  { key: 'security', label: '7. Enterprise Security', icon: Lock },
  { key: 'portfolio', label: '8. Metrics & Case Studies', icon: TrendingUp },
  { key: 'faq', label: '9. FAQs & Schema', icon: HelpCircle },
  { key: 'contact', label: '10. Contact & Final CTA', icon: PhoneCall },
  { key: 'footer', label: '11. Footer & Socials', icon: Share2 },
  { key: 'seo', label: '12. SEO & AEO Metadata', icon: Globe },
];

export default function LandingPageBuilder() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('landing_page.update');
  const canPublish = hasPermission('landing_page.publish');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState('editor'); // 'editor' | 'split' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Data state
  const [liveVersion, setLiveVersion] = useState(1);
  const [draftVersion, setDraftVersion] = useState(1);
  const [publishedAt, setPublishedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [seo, setSeo] = useState({});
  const [sections, setSections] = useState({});
  const [sectionsOrder, setSectionsOrder] = useState([]);

  // Modals & Notices
  const [toast, setToast] = useState(null);
  const [concurrencyError, setConcurrencyError] = useState(null);
  const [conflictServerVersion, setConflictServerVersion] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // Slide Image Direct Upload & Media Picker State
  const [uploadingSlideKey, setUploadingSlideKey] = useState(null); // e.g. '0-imageDark'
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // { slideIdx, field }
  const [mediaLibraryItems, setMediaLibraryItems] = useState([]);
  const [loadingMediaLibrary, setLoadingMediaLibrary] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');

  // Open media library picker
  const openMediaPicker = async (slideIdx, field) => {
    setMediaPickerTarget({ slideIdx, field });
    setShowMediaPickerModal(true);
    setLoadingMediaLibrary(true);
    try {
      const data = await api.getMedia({ limit: 40 });
      setMediaLibraryItems(data.media || []);
    } catch (err) {
      showToast(err.message || 'Failed to load media assets', 'error');
    } finally {
      setLoadingMediaLibrary(false);
    }
  };

  // Apply selected image from media library modal
  const handleSelectMediaItem = (url) => {
    if (mediaPickerTarget) {
      const { slideIdx, field } = mediaPickerTarget;
      const updated = [...(sections.hero?.slides || [])];
      if (updated[slideIdx]) {
        updated[slideIdx] = { ...updated[slideIdx], [field]: url };
        updateSectionField('hero', 'slides', updated);
        showToast('Image applied from Media Library!', 'success');
      }
    }
    setShowMediaPickerModal(false);
    setMediaPickerTarget(null);
  };

  // Direct file upload from user's computer
  const handleDirectFileUpload = async (slideIdx, field, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit.', 'error');
      return;
    }

    const key = `${slideIdx}-${field}`;
    setUploadingSlideKey(key);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileData = await base64Promise;

      const res = await api.uploadMedia({
        fileData,
        originalName: file.name,
        altText: sections.hero?.slides?.[slideIdx]?.altText || file.name,
      });

      if (res.media && res.media.url) {
        const updated = [...(sections.hero?.slides || [])];
        if (updated[slideIdx]) {
          updated[slideIdx] = { ...updated[slideIdx], [field]: res.media.url };
          updateSectionField('hero', 'slides', updated);
        }
        showToast('Image uploaded and applied to slide!', 'success');
      } else {
        throw new Error('Upload succeeded but no URL returned.');
      }
    } catch (err) {
      console.error('Slide Image Upload Error:', err);
      showToast(err.message || 'Failed to upload image.', 'error');
    } finally {
      setUploadingSlideKey(null);
    }
  };

  // Load Draft on Mount
  useEffect(() => {
    loadDraft();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function loadDraft() {
    setLoading(true);
    setConcurrencyError(null);
    try {
      const data = await api.getLandingPageDraft();
      setLiveVersion(data.version || 1);
      setDraftVersion(data.draftVersion || 1);
      setPublishedAt(data.publishedAt);
      setUpdatedAt(data.updatedAt);
      setHasUnpublishedChanges(Boolean(data.hasUnpublishedChanges));
      setSeo(data.seo || {});
      setSections(data.sections || {});
      setSectionsOrder(data.sectionsOrder || []);
    } catch (err) {
      console.error('Failed to load landing page draft:', err);
      showToast('Failed to load landing page configuration.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Handle Draft Save
  async function handleSaveDraft(forceVersion = null) {
    if (!canUpdate) return;
    setSaving(true);
    setConcurrencyError(null);
    try {
      const payload = {
        seo,
        sections,
        sectionsOrder,
        expectedDraftVersion: typeof forceVersion === 'number' ? forceVersion : draftVersion,
      };
      const res = await api.updateLandingPageDraft(payload);
      setDraftVersion(res.draftVersion);
      setUpdatedAt(res.updatedAt);
      setHasUnpublishedChanges(true);
      setConcurrencyError(null);
      setConflictServerVersion(null);
      showToast('Draft changes saved successfully.');
    } catch (err) {
      if (err.status === 409) {
        const latestVer = err.data?.currentDraftVersion;
        setConflictServerVersion(latestVer || null);
        setConcurrencyError(err.data?.error || err.message || 'Concurrency conflict detected: the server has a newer version of the draft.');
      } else {
        showToast(err.message || 'Failed to save draft.', 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  // Pre-publish validation check
  const validateBeforePublish = () => {
    const errs = [];
    if (!seo.title || seo.title.trim().length < 5) {
      errs.push('SEO Meta Title must be at least 5 characters.');
    }
    if (!seo.description || seo.description.trim().length < 10) {
      errs.push('SEO Meta Description must be at least 10 characters.');
    }

    const checkUrl = (url, label) => {
      if (url && typeof url === 'string') {
        const trimmed = url.trim();
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
          errs.push(`Unsafe script URL detected in ${label}: "${url}"`);
        }
      }
    };

    if (sections.hero?.enabled) {
      if (!sections.hero.slides || sections.hero.slides.length === 0) {
        errs.push('Hero section must have at least one slide.');
      } else {
        sections.hero.slides.forEach((slide, idx) => {
          if (!slide.titlePrefix && !slide.titleGradient) {
            errs.push(`Hero Slide #${idx + 1} requires a headline title.`);
          }
        });
      }
      checkUrl(sections.hero.primaryCta?.destination, 'Hero Primary CTA');
      checkUrl(sections.hero.whatsappCta?.destination, 'Hero WhatsApp CTA');
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleOpenPublishModal = () => {
    if (!canPublish) return;
    validateBeforePublish();
    setShowPublishModal(true);
  };

  // Execute Live Publish
  async function handleConfirmPublish() {
    if (!canPublish) return;
    setPublishing(true);
    setConcurrencyError(null);
    try {
      // 1. Auto-save current edits directly to draft
      const draftRes = await api.updateLandingPageDraft({
        seo,
        sections,
        sectionsOrder,
      });

      if (draftRes?.draftVersion) {
        setDraftVersion(draftRes.draftVersion);
      }

      // 2. Publish live snapshot to production
      const res = await api.publishLandingPage({
        changeSummary: publishSummary || `Published version update`,
      });

      setLiveVersion(res.version);
      setDraftVersion(res.version);
      setPublishedAt(res.publishedAt);
      setHasUnpublishedChanges(false);
      setShowPublishModal(false);
      setPublishSummary('');
      setConcurrencyError(null);
      setConflictServerVersion(null);
      showToast(`🎉 Version ${res.version} is now LIVE on www.gyanvaniai.com!`, 'success');

      // 3. Immediately broadcast to any open storefront tabs to refresh live UI
      try {
        if (typeof window !== 'undefined' && window.BroadcastChannel) {
          const bc = new BroadcastChannel('gyanvani_cms_channel');
          bc.postMessage({ type: 'LANDING_PAGE_PUBLISHED', version: res.version });
          bc.close();
        }
      } catch (_) {}
    } catch (err) {
      if (err.status === 409) {
        const latestVer = err.data?.currentDraftVersion || err.data?.currentVersion;
        setConflictServerVersion(latestVer || null);
        setConcurrencyError(err.data?.error || err.message || 'Concurrency conflict detected.');
        showToast('Concurrency conflict: Please resolve changes before publishing.', 'error');
      } else if (err.data?.details) {
        setValidationErrors(err.data.details);
      } else {
        showToast(err.message || 'Failed to publish landing page.', 'error');
      }
    } finally {
      setPublishing(false);
    }
  }

  // Load Revision History
  async function handleOpenHistory() {
    setShowHistoryModal(true);
    setLoadingRevisions(true);
    try {
      const data = await api.getLandingPageRevisions();
      setRevisions(data.revisions || []);
    } catch (err) {
      console.error('Failed to load revisions:', err);
      showToast('Failed to load version history.', 'error');
    } finally {
      setLoadingRevisions(false);
    }
  }

  // Rollback to specific version
  async function handleRollback(targetVersion) {
    if (!window.confirm(`Are you sure you want to rollback to Version ${targetVersion}? This will immediately publish that version to the live public website.`)) {
      return;
    }
    setLoadingRevisions(true);
    try {
      const res = await api.rollbackLandingPageRevision(targetVersion);
      showToast(res.message || `Restored to version ${targetVersion}`);
      setShowHistoryModal(false);
      await loadDraft();
    } catch (err) {
      showToast(err.message || 'Rollback failed.', 'error');
    } finally {
      setLoadingRevisions(false);
    }
  }

  // Section toggle helper
  const updateSectionField = (sectionKey, field, value) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [field]: value,
      },
    }));
    setHasUnpublishedChanges(true);
  };

  // Reorder sections
  const moveSectionOrder = (index, direction) => {
    const newOrder = [...sectionsOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionsOrder(newOrder);
    setHasUnpublishedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading Landing Page CMS Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Concurrency Error Banner */}
      {concurrencyError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Concurrency Conflict (HTTP 409)</p>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">{concurrencyError}</p>
              <p className="text-[11px] text-amber-700 mt-1">
                Your browser version: <strong>v{draftVersion}</strong> {conflictServerVersion ? <>| Server version: <strong>v{conflictServerVersion}</strong></> : null}. Choose whether to overwrite with your current modifications or reload server content.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleSaveDraft(conflictServerVersion || draftVersion + 1)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Save current in-memory edits to the database and sync version"
            >
              <Save className="w-3.5 h-3.5" />
              Keep My Changes & Save
            </button>
            <button
              onClick={loadDraft}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Discard local edits and reload the server version"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Discard & Reload Server
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Publication Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Landing Page CMS Builder</h1>
              <p className="text-xs text-slate-500">
                Enterprise dynamic content management for GyanVaniAi landing page sections
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: v{liveVersion}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Draft: v{draftVersion}
            </span>
            {hasUnpublishedChanges ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Unpublished Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                <Check className="w-3 h-3 text-emerald-600" />
                In Sync with Live
              </span>
            )}
            {publishedAt && (
              <span className="text-xs text-slate-400">
                Last published: {new Date(publishedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenHistory}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Inspect previous published snapshots and rollback"
          >
            <History className="w-4 h-4 text-slate-500" />
            Revisions
          </button>

          {/* Preview Viewport Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setPreviewMode('editor')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                previewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                previewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                previewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Save Draft Button */}
          {canUpdate && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-slate-600" />}
              Save Draft
            </button>
          )}

          {/* Publish Button */}
          {canPublish && (
            <button
              onClick={handleOpenPublishModal}
              disabled={publishing}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish Live
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`grid gap-6 ${previewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Column */}
        {previewMode !== 'preview' && (
          <div className="space-y-6">
            {/* Section Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {SECTION_KEYS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  const isEnabled = tab.key === 'seo' ? true : sections[tab.key]?.enabled !== false;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {!isEnabled && tab.key !== 'seo' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Section Hidden" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Section Form Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              {renderActiveSectionEditor()}
            </div>
          </div>
        )}

        {/* Live Preview Column */}
        {previewMode !== 'editor' && (
          <div className="space-y-4">
            {/* Device Switcher */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Responsive Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                    previewDevice === 'desktop' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Desktop View (Full Screen)"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                    previewDevice === 'mobile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Frame Container */}
            <div className="bg-slate-950 rounded-2xl p-4 overflow-hidden shadow-inner flex justify-center min-h-[700px]">
              <div
                className={`bg-slate-900 rounded-xl overflow-y-auto max-h-[750px] transition-all border border-slate-800 ${
                  previewDevice === 'mobile' ? 'w-[375px] shadow-2xl rounded-[32px] border-4 border-slate-700' : 'w-full'
                }`}
              >
                {renderLivePreview()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Library Picker Modal */}
      {showMediaPickerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Image from Media Library</h3>
              </div>
              <button
                onClick={() => {
                  setShowMediaPickerModal(false);
                  setMediaPickerTarget(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-shrink-0">
              <input
                type="text"
                value={mediaSearchQuery}
                onChange={(e) => setMediaSearchQuery(e.target.value)}
                placeholder="Search media by filename..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Media Grid */}
            <div className="overflow-y-auto flex-1 pr-1 min-h-[240px]">
              {loadingMediaLibrary ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                  <span>Loading Media Assets...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaLibraryItems
                    .filter((item) =>
                      !mediaSearchQuery ||
                      (item.originalName || '').toLowerCase().includes(mediaSearchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.id || item.url}
                        onClick={() => handleSelectMediaItem(item.url)}
                        className="group relative cursor-pointer rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all bg-slate-50"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.altText || item.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 text-left bg-white">
                          <p className="text-[11px] font-semibold text-slate-800 truncate" title={item.originalName}>
                            {item.originalName}
                          </p>
                          <span className="text-[10px] text-indigo-600 font-medium">Click to Choose</span>
                        </div>
                      </div>
                    ))}
                  {mediaLibraryItems.length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-slate-400">
                      No media files found. Use the Upload button to upload an image from your computer.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowMediaPickerModal(false);
                  setMediaPickerTarget(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation & Validation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Validate & Publish to Live Website</h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pre-Publication Audit</h4>
              {validationErrors.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All pre-publish safety checks passed! Content and URLs are valid.</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Please resolve the following before publishing:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Change Summary Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Change Summary / Version Note (Optional)
              </label>
              <input
                type="text"
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="e.g. Updated Hero headline & WhatsApp CTA"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                This note will be recorded permanently in the immutable audit log and revision history.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={publishing || validationErrors.length > 0}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {publishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                Publish Live (v{liveVersion + 1})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision History & Rollback Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Publication History & Version Rollback</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 flex-shrink-0">
              Every published version is recorded with an immutable snapshot. You can roll back to any historical version at any time.
            </p>

            {/* Revisions List */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {loadingRevisions ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading version history...</div>
              ) : revisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No revisions recorded yet.</div>
              ) : (
                revisions.map((rev) => {
                  const isCurrent = rev.version === liveVersion;
                  return (
                    <div
                      key={rev.id || rev.version}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            v{rev.version}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{rev.changeSummary}</span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Active Live
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          By {rev.author?.name || 'Administrator'} • {new Date(rev.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {!isCurrent && canPublish && (
                        <button
                          onClick={() => handleRollback(rev.version)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-colors flex-shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                          Rollback
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────────
     SECTION EDITORS IMPLEMENTATION
  ───────────────────────────────────────────────────────────────────────────── */
  function renderActiveSectionEditor() {
    switch (activeTab) {
      case 'seo':
        return renderSeoEditor();
      case 'hero':
        return renderHeroEditor();
      case 'trust':
        return renderTrustEditor();
      case 'features':
        return renderFeaturesEditor();
      case 'process':
        return renderProcessEditor();
      case 'industries':
        return renderIndustriesEditor();
      case 'omnichannel':
        return renderOmnichannelEditor();
      case 'security':
        return renderSecurityEditor();
      case 'portfolio':
        return renderPortfolioEditor();
      case 'faq':
        return renderFaqEditor();
      case 'contact':
        return renderContactEditor();
      case 'footer':
        return renderFooterEditor();
      default:
        return <div>Select a section from the navigation tabs above.</div>;
    }
  }

  // 12. SEO & AEO Command Center
  function renderSeoEditor() {
    const titleLen = (seo.title || '').length;
    const descLen = (seo.description || '').length;

    const SEO_IMAGE_PRESETS = [
      { label: 'Dashboard Hub', url: 'https://www.gyanvaniai.com/hero_dashboard.webp' },
      { label: 'Humanoid AI Dark', url: 'https://www.gyanvaniai.com/hero_robot_dark.webp' },
      { label: 'CRM System Preview', url: 'https://www.gyanvaniai.com/gyan_vaniai_crm_hero.webp' },
    ];

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
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                titleLen >= 50 && titleLen <= 60 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : titleLen > 60 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
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
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                descLen >= 140 && descLen <= 165 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : descLen > 165 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
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

  // Section Header Component
  function SectionControlHeader({ sectionKey, title, subtitle, extraAction = null }) {
    const sec = sections[sectionKey] || {};
    const enabled = sec.enabled !== false;
    return (
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {extraAction}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Show Section:</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateSectionField(sectionKey, 'enabled', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    );
  }

  // 1. Hero Editor (Fully Dynamic Image & Carousel Management)
  function renderHeroEditor() {
    const hero = sections.hero || {};
    const slides = hero.slides || [];

    const HERO_IMAGE_PRESETS = [
      { label: 'Humanoid Robot', dark: '/hero_robot_dark.webp', light: '/hero_robot_light.webp' },
      { label: 'WhatsApp Agent', dark: '/hero_slide_2_dark.webp', light: '/hero_slide_2_light.webp' },
      { label: 'Predictive Intelligence', dark: '/hero_slide_3_dark.webp', light: '/hero_slide_3_light.webp' },
      { label: 'Agentic Orchestration', dark: '/hero_slide_4_dark.webp', light: '/hero_slide_4_light.webp' },
      { label: 'Dashboard Hub', dark: '/hero_dashboard.webp', light: '/hero_dashboard.webp' },
      { label: 'Enterprise Platform', dark: '/gyan_vaniai_crm_hero.webp', light: '/gyan_vaniai_crm_hero.webp' },
    ];

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
      if (window.confirm(`Are you sure you want to delete Slide #${index + 1}? This will remove it from the live carousel after publishing.`)) {
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
      const telemetry = [...(slide.telemetry && slide.telemetry.length > 0 ? slide.telemetry : [
        { dot: 'dot-emerald', icon: 'Zap', text: '', value: '' },
        { dot: 'dot-cyan', icon: 'TrendingUp', text: '', value: '' },
        { dot: 'dot-green', icon: 'ShieldCheck', text: '', value: '' },
      ])];
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
                    {(slide.titlePrefix || slide.titleGradient) ? (
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
                    title={slides.length <= 1 ? "At least one slide required" : "Delete slide"}
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
                  {(slide.telemetry && slide.telemetry.length > 0 ? slide.telemetry : [
                    { dot: 'dot-emerald', icon: 'Zap', text: '', value: '' },
                    { dot: 'dot-cyan', icon: 'TrendingUp', text: '', value: '' },
                    { dot: 'dot-green', icon: 'ShieldCheck', text: '', value: '' },
                  ]).map((tItem, tIdx) => (
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

  // 2. Trust Bar Editor
  function renderTrustEditor() {
    const trust = sections.trust || {};
    const integrations = trust.integrations || [];
    const badges = trust.badges || [];

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="trust"
          title="Trust Indicators & Tech Integrations Bar"
          subtitle="Manage verified integration partners and platform SLA trust badges"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Section Heading</label>
          <input
            type="text"
            value={trust.heading || ''}
            onChange={(e) => updateSectionField('trust', 'heading', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>

        {/* Integrations List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Integrations Grid ({integrations.length})</h3>
            <button
              onClick={() => {
                const updated = [...integrations, { name: 'New Integration', type: 'API & Webhooks' }];
                updateSectionField('trust', 'integrations', updated);
              }}
              className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Partner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrations.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...integrations];
                      updated[idx].name = e.target.value;
                      updateSectionField('trust', 'integrations', updated);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={item.type}
                    onChange={(e) => {
                      const updated = [...integrations];
                      updated[idx].type = e.target.value;
                      updateSectionField('trust', 'integrations', updated);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = integrations.filter((_, i) => i !== idx);
                    updateSectionField('trust', 'integrations', updated);
                  }}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Badges List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trust SLA Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {badges.map((b, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                <label className="text-[11px] font-semibold text-slate-500">Badge #{idx + 1}</label>
                <input
                  type="text"
                  value={b.label}
                  onChange={(e) => {
                    const updated = [...badges];
                    updated[idx].label = e.target.value;
                    updateSectionField('trust', 'badges', updated);
                  }}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Features Editor
  function renderFeaturesEditor() {
    const features = sections.features || {};
    const capabilities = features.capabilities || [];

    const updateCapability = (idx, field, value) => {
      const updated = [...capabilities];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('features', 'capabilities', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="features"
          title="Capabilities & Features Matrix"
          subtitle="Showcase autonomous AI capabilities, intent scoring, routing, and playbooks"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={features.heading || ''}
              onChange={(e) => updateSectionField('features', 'heading', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={features.subtitle || ''}
              onChange={(e) => updateSectionField('features', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Feature Cards ({capabilities.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">Card #{idx + 1}</span>
                  <input
                    type="text"
                    value={cap.tag || ''}
                    placeholder="Tag (e.g. Intelligence)"
                    onChange={(e) => updateCapability(idx, 'tag', e.target.value)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-slate-200 bg-slate-50 w-28"
                  />
                </div>
                <input
                  type="text"
                  value={cap.title}
                  placeholder="Card Title"
                  onChange={(e) => updateCapability(idx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                />
                <textarea
                  rows={2}
                  value={cap.description}
                  placeholder="Card Description"
                  onChange={(e) => updateCapability(idx, 'description', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  value={cap.to}
                  placeholder="Target Link (e.g. /services/crm-development)"
                  onChange={(e) => updateCapability(idx, 'to', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Process (Workflow) Editor
  function renderProcessEditor() {
    const process = sections.process || {};
    const steps = process.steps || [];

    const updateStep = (idx, field, value) => {
      const updated = [...steps];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('process', 'steps', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="process"
          title="Automation Workflow & Steps"
          subtitle="Manage the 8-step intelligent revenue pipeline from inbound capture to closed-won"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={process.title || ''}
              onChange={(e) => updateSectionField('process', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={process.subtitle || ''}
              onChange={(e) => updateSectionField('process', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Workflow Steps ({steps.length})</h3>
          <div className="space-y-3">
            {steps.map((st, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-1 text-center font-bold text-xs text-indigo-600 bg-indigo-50 py-1 rounded-lg">
                  {st.stepNum || `0${idx + 1}`}
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={st.title}
                    placeholder="Step Title"
                    onChange={(e) => updateStep(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    value={st.category || ''}
                    placeholder="Category"
                    onChange={(e) => updateStep(idx, 'category', e.target.value)}
                    className="w-full px-2.5 py-0.5 text-[11px] text-slate-500 rounded border border-transparent hover:border-slate-200 mt-1"
                  />
                </div>
                <div className="md:col-span-8">
                  <textarea
                    rows={2}
                    value={st.desc}
                    placeholder="Step Description"
                    onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Industries Editor
  function renderIndustriesEditor() {
    const industries = sections.industries || {};
    const list = industries.list || [];

    const updateIndustry = (idx, field, value) => {
      const updated = [...list];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('industries', 'list', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="industries"
          title="Industry Solutions Matrix"
          subtitle="Configure vertical solutions (SaaS, Healthcare, Real Estate, FinTech, etc.)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={industries.title || ''}
              onChange={(e) => updateSectionField('industries', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={industries.subtitle || ''}
              onChange={(e) => updateSectionField('industries', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Industries List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Industry Cards ({list.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <input
                  type="text"
                  value={item.name}
                  placeholder="Industry Name"
                  onChange={(e) => updateIndustry(idx, 'name', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                />
                <textarea
                  rows={2}
                  value={item.desc}
                  placeholder="Industry description"
                  onChange={(e) => updateIndustry(idx, 'desc', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  value={item.to}
                  placeholder="Link URL (e.g. /industries/enterprise)"
                  onChange={(e) => updateIndustry(idx, 'to', e.target.value)}
                  className="w-full px-2.5 py-0.5 text-[11px] text-slate-500 rounded border border-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Omnichannel & AI Orchestration Editor
  function renderOmnichannelEditor() {
    const omni = sections.omnichannel || {};
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
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Supported Channels ({channels.length})</h3>
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

  // 7. Security Editor
  function renderSecurityEditor() {
    const sec = sections.security || {};
    const cards = sec.cards || [];

    const updateCard = (idx, field, value) => {
      const updated = [...cards];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('security', 'cards', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="security"
          title="Enterprise Security & Compliance Features"
          subtitle="Manage verified SOC2, tenant isolation, and cryptographic encryption claims"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={sec.title || ''}
              onChange={(e) => updateSectionField('security', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={sec.subtitle || ''}
              onChange={(e) => updateSectionField('security', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Security Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Security Pillars ({cards.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cards.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <input
                  type="text"
                  value={c.title}
                  placeholder="Pillar Title"
                  onChange={(e) => updateCard(idx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                />
                <textarea
                  rows={2}
                  value={c.desc}
                  placeholder="Security claim and guardrail description"
                  onChange={(e) => updateCard(idx, 'desc', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. Performance Metrics & Case Studies Editor
  function renderPortfolioEditor() {
    const port = sections.portfolio || {};
    const metrics = port.metrics || [];
    const caseStudies = port.caseStudies || [];

    const updateMetric = (idx, field, value) => {
      const updated = [...metrics];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('portfolio', 'metrics', updated);
    };

    const updateCaseStudy = (idx, field, value) => {
      const updated = [...caseStudies];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('portfolio', 'caseStudies', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="portfolio"
          title="Performance Metrics & Verified Case Studies"
          subtitle="Display production telemetry results and actual deployed client solutions"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={port.title || ''}
              onChange={(e) => updateSectionField('portfolio', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={port.subtitle || ''}
              onChange={(e) => updateSectionField('portfolio', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* 4 Metrics Stats */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Telemetry Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <input
                  type="text"
                  value={m.value}
                  placeholder="Metric Value (e.g. 40%)"
                  onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                  className="w-full px-2.5 py-1 text-sm font-extrabold rounded-lg border border-slate-300 text-indigo-700"
                />
                <input
                  type="text"
                  value={m.label}
                  placeholder="Label"
                  onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                  className="w-full px-2 py-0.5 text-xs font-semibold rounded border border-slate-200"
                />
                <textarea
                  rows={2}
                  value={m.desc}
                  placeholder="Description"
                  onChange={(e) => updateMetric(idx, 'desc', e.target.value)}
                  className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-200 text-slate-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Production Case Studies ({caseStudies.length})</h3>
          <div className="space-y-3">
            {caseStudies.map((cs, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500">Case Study Title</label>
                    <input
                      type="text"
                      value={cs.title}
                      onChange={(e) => updateCaseStudy(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Industry</label>
                    <input
                      type="text"
                      value={cs.industry}
                      onChange={(e) => updateCaseStudy(idx, 'industry', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Challenge</label>
                    <textarea
                      rows={2}
                      value={cs.challenge}
                      onChange={(e) => updateCaseStudy(idx, 'challenge', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Solution</label>
                    <textarea
                      rows={2}
                      value={cs.solution}
                      onChange={(e) => updateCaseStudy(idx, 'solution', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Outcome</label>
                    <textarea
                      rows={2}
                      value={cs.outcome}
                      onChange={(e) => updateCaseStudy(idx, 'outcome', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-emerald-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 9. FAQs Editor
  function renderFaqEditor() {
    const faq = sections.faq || {};
    const items = faq.items || [];

    const updateFaqItem = (idx, field, value) => {
      const updated = [...items];
      updated[idx] = { ...updated[idx], [field]: value };
      updateSectionField('faq', 'items', updated);
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="faq"
          title="Frequently Asked Questions & Schema"
          subtitle="Manage buyer FAQs and automated FAQPage structured JSON-LD schema generation"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={faq.title || ''}
              onChange={(e) => updateSectionField('faq', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={faq.subtitle || ''}
              onChange={(e) => updateSectionField('faq', 'subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Questions & Answers ({items.length})</h3>
            <button
              onClick={() => {
                const updated = [...items, { question: 'New Question?', answer: 'Detailed verified answer.' }];
                updateSectionField('faq', 'items', updated);
              }}
              className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">Q#{idx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = items.filter((_, i) => i !== idx);
                      updateSectionField('faq', 'items', updated);
                    }}
                    className="text-slate-400 hover:text-rose-600 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={it.question}
                  placeholder="Enter Question"
                  onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                />
                <textarea
                  rows={3}
                  value={it.answer}
                  placeholder="Enter Answer"
                  onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 10. Contact & Final CTA Editor
  function renderContactEditor() {
    const contact = sections.contact || {};
    const checklist = contact.checklist || [];

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="contact"
          title="Final CTA & Contact Lead Form"
          subtitle="Configure consultation headlines, SLA checklist highlights, and contact information"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Eyebrow</label>
            <input
              type="text"
              value={contact.eyebrow || ''}
              onChange={(e) => updateSectionField('contact', 'eyebrow', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={contact.title || ''}
              onChange={(e) => updateSectionField('contact', 'title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
          <textarea
            rows={2}
            value={contact.subtitle || ''}
            onChange={(e) => updateSectionField('contact', 'subtitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>

        {/* Checklist Highlights */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Guaranteed Service Checklist</h3>
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...checklist];
                  updated[idx] = e.target.value;
                  updateSectionField('contact', 'checklist', updated);
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Business Inquiries</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="text"
                value={contact.contactInfo?.email || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'contactInfo', {
                    ...(contact.contactInfo || {}),
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={contact.contactInfo?.phone || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'contactInfo', {
                    ...(contact.contactInfo || {}),
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={contact.contactInfo?.location || ''}
                onChange={(e) =>
                  updateSectionField('contact', 'contactInfo', {
                    ...(contact.contactInfo || {}),
                    location: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 11. Footer & Socials Editor
  function renderFooterEditor() {
    const footer = sections.footer || {};
    const sl = footer.socialLinks || {};

    const updateSocial = (key, value) => {
      updateSectionField('footer', 'socialLinks', { ...sl, [key]: value });
    };

    return (
      <div className="space-y-6">
        <SectionControlHeader
          sectionKey="footer"
          title="Global Footer & Social Channels"
          subtitle="Configure brand description, social communication handles, and copyright notice"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline / Description</label>
          <textarea
            rows={2}
            value={footer.tagline || ''}
            onChange={(e) => updateSectionField('footer', 'tagline', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Social Channels & Destinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">WhatsApp Chat URL</label>
              <input
                type="text"
                value={sl.whatsapp || ''}
                onChange={(e) => updateSocial('whatsapp', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Link</label>
              <input
                type="text"
                value={sl.email || ''}
                onChange={(e) => updateSocial('email', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Google Maps Location</label>
              <input
                type="text"
                value={sl.maps || ''}
                onChange={(e) => updateSocial('maps', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={sl.linkedin || ''}
                onChange={(e) => updateSocial('linkedin', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facebook Page</label>
              <input
                type="text"
                value={sl.facebook || ''}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub Repo / Org</label>
              <input
                type="text"
                value={sl.github || ''}
                onChange={(e) => updateSocial('github', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Notice</label>
          <input
            type="text"
            value={footer.copyright || ''}
            onChange={(e) => updateSectionField('footer', 'copyright', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     LIVE PREVIEW ENGINE (Renders true-to-life mockup of the landing page)
  ───────────────────────────────────────────────────────────────────────────── */
  function renderLivePreview() {
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
}
