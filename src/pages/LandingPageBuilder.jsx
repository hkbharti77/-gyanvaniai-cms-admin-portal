import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Monitor,
  ShieldCheck,
  Zap,
  MessageSquare,
  Bot,
  Activity,
  Check,
  X,
  Lock,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  PhoneCall,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  SeoTab,
  HeroTab,
  TrustTab,
  FeaturesTab,
  ProcessTab,
  IndustriesTab,
  OmnichannelTab,
  SecurityTab,
  PortfolioTab,
  FaqTab,
  ContactTab,
  FooterTab,
  LandingLivePreview,
} from '../components/landing-builder';

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

  // Client-side image optimizer for hero slides (Canvas WebP, max 1920x1080)
  const compressSlideImage = (file) => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Modern WebP compression at 85% quality
          const compressed = canvas.toDataURL('image/webp', 0.85);
          resolve(compressed);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Direct file upload from user's computer
  const handleDirectFileUpload = async (slideIdx, field, file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB limit.', 'error');
      return;
    }

    const key = `${slideIdx}-${field}`;
    setUploadingSlideKey(key);

    try {
      let fileData = await compressSlideImage(file);
      if (!fileData) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const safeName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
      const res = await api.uploadMedia({
        fileData,
        originalName: safeName,
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
      showToast('Draft changes saved successfully.', 'success');
    } catch (err) {
      if (err.status === 409) {
        const latestVer = err.data?.currentDraftVersion;
        setConflictServerVersion(latestVer || null);
        setConcurrencyError(err.data?.error || err.message || 'Concurrency conflict: the server has a newer version.');
      } else if (!err.status) {
        // Network / connection error
        showToast('Connection error: Backend server may be starting up. Please wait a moment and try again.', 'error');
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
    if (
      !window.confirm(
        `Are you sure you want to rollback to Version ${targetVersion}? This will immediately publish that version to the live public website.`
      )
    ) {
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

  // Section toggle and field update helper
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

  // Section editor router switch
  function renderActiveSectionEditor() {
    switch (activeTab) {
      case 'seo':
        return (
          <SeoTab
            seo={seo}
            setSeo={setSeo}
            setHasUnpublishedChanges={setHasUnpublishedChanges}
          />
        );
      case 'hero':
        return (
          <HeroTab
            hero={sections.hero || {}}
            updateSectionField={updateSectionField}
            uploadingSlideKey={uploadingSlideKey}
            handleDirectFileUpload={handleDirectFileUpload}
            openMediaPicker={openMediaPicker}
          />
        );
      case 'trust':
        return (
          <TrustTab
            trust={sections.trust || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'features':
        return (
          <FeaturesTab
            features={sections.features || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'process':
        return (
          <ProcessTab
            process={sections.process || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'industries':
        return (
          <IndustriesTab
            industries={sections.industries || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'omnichannel':
        return (
          <OmnichannelTab
            omnichannel={sections.omnichannel || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'security':
        return (
          <SecurityTab
            security={sections.security || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'portfolio':
        return (
          <PortfolioTab
            portfolio={sections.portfolio || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'faq':
        return (
          <FaqTab
            faq={sections.faq || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'contact':
        return (
          <ContactTab
            contact={sections.contact || {}}
            updateSectionField={updateSectionField}
          />
        );
      case 'footer':
        return (
          <FooterTab
            footer={sections.footer || {}}
            updateSectionField={updateSectionField}
          />
        );
      default:
        return <div>Select a section from the navigation tabs above.</div>;
    }
  }

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
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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
                Your browser version: <strong>v{draftVersion}</strong>{' '}
                {conflictServerVersion ? (
                  <>
                    | Server version: <strong>v{conflictServerVersion}</strong>
                  </>
                ) : null}
                . Choose whether to overwrite with your current modifications or reload server content.
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
                <LandingLivePreview
                  sections={sections}
                  previewSlideIdx={previewSlideIdx}
                  setPreviewSlideIdx={setPreviewSlideIdx}
                />
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
                    .filter(
                      (item) =>
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
}
