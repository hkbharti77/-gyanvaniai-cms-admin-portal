import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Briefcase,
  FileText,
  Video,
  UploadCloud,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  Eye,
  Copy,
  Check,
  ChevronRight,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function PortfolioMediaManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);

  const resumeInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    resumeUrl: 'https://res.cloudinary.com/vnwxervq/image/upload/v1786893340/tnp13v5ins7v33n0j4sn.pdf',
    resumeFileName: 'Himanshu_Bharti_Resume.pdf',
    resumeUpdatedAt: '',
    resumeFileSize: null,
    introVideoUrl: '/intro.mp4',
    introVideoPosterUrl: '/portfolio_crm.webp',
    introVideoTitle: 'Himanshu Bharti - AI & Full Stack Engineer Introduction',
    introVideoUpdatedAt: '',
  });

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolioSiteMedia();
      const media = res.media || res;
      setFormData({
        resumeUrl: media.resume?.url || media.resumeUrl || '',
        resumeFileName: media.resume?.fileName || media.resumeFileName || 'Himanshu_Bharti_Resume.pdf',
        resumeUpdatedAt: media.resume?.updatedAt || media.resumeUpdatedAt || '',
        resumeFileSize: media.resume?.fileSize || null,
        introVideoUrl: media.video?.url || media.introVideoUrl || '/intro.mp4',
        introVideoPosterUrl: media.video?.posterUrl || media.introVideoPosterUrl || '/portfolio_crm.webp',
        introVideoTitle: media.video?.title || media.introVideoTitle || 'Himanshu Bharti - AI & Full Stack Engineer Introduction',
        introVideoUpdatedAt: media.video?.updatedAt || media.introVideoUpdatedAt || '',
      });
    } catch (err) {
      showToast(err.message || 'Failed to load portfolio media config', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updatePortfolioSiteMedia({
        resumeUrl: formData.resumeUrl.trim(),
        resumeFileName: formData.resumeFileName.trim(),
        introVideoUrl: formData.introVideoUrl.trim(),
        introVideoPosterUrl: formData.introVideoPosterUrl.trim(),
        introVideoTitle: formData.introVideoTitle.trim(),
      });
      showToast('Portfolio Resume & Video settings saved and synced live!');
      loadMedia();
    } catch (err) {
      showToast(err.message || 'Failed to save portfolio media', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    try {
      setUploadingResume(true);
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result;
          resolve(res.includes(',') ? res.split(',')[1] : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await api.uploadPortfolioResume({
        fileName: file.name,
        mimeType: 'application/pdf',
        base64Data,
      });

      setFormData((prev) => ({
        ...prev,
        resumeUrl: res.resume.url,
        resumeFileName: res.resume.fileName,
        resumeUpdatedAt: res.resume.updatedAt,
      }));

      showToast(`Resume "${file.name}" uploaded and activated for portfolio live!`);
    } catch (err) {
      showToast(err.message || 'Resume upload failed', 'error');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      showToast('Please select a valid video file (MP4, WebM, MOV).', 'error');
      return;
    }

    try {
      setUploadingVideo(true);
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result;
          resolve(res.includes(',') ? res.split(',')[1] : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await api.uploadPortfolioVideo({
        fileName: file.name,
        mimeType: file.type || 'video/mp4',
        base64Data,
        title: formData.introVideoTitle,
        posterUrl: formData.introVideoPosterUrl,
      });

      setFormData((prev) => ({
        ...prev,
        introVideoUrl: res.video.url,
        introVideoPosterUrl: res.video.posterUrl,
        introVideoUpdatedAt: res.video.updatedAt,
      }));

      showToast(`Intro video "${file.name}" uploaded and activated for portfolio live!`);
    } catch (err) {
      showToast(err.message || 'Video upload failed', 'error');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'resume') {
        setCopiedResume(true);
        setTimeout(() => setCopiedResume(false), 2000);
      } else {
        setCopiedVideo(true);
        setTimeout(() => setCopiedVideo(false), 2000);
      }
    });
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

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-500 font-medium">Content & Publishing</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-semibold text-slate-900">Portfolio Assets (Resume & Video)</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Portfolio Assets & Media Manager
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centrally control your official resume PDF and developer introduction video served to <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">My-portfillos</a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadMedia}
              disabled={loading}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-bold shadow-2xs"
              title="Refresh asset metadata"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-xs"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Publish Live</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading portfolio asset configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Official Resume PDF */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Official Resume PDF</h2>
                    <p className="text-xs text-slate-500">Powers all "Download Resume / CV" buttons on the portfolio</p>
                  </div>
                </div>
                <span className="badge badge-purple text-[11px] font-bold">Active Resume</span>
              </div>

              {/* Upload Drop Zone */}
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleResumeFileSelect}
              />

              <div
                onClick={() => resumeInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50/70 hover:bg-purple-50/20 rounded-xl p-6 text-center transition-all group"
              >
                {uploadingResume ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="w-7 h-7 animate-spin text-purple-600 mb-2" />
                    <span className="text-xs font-bold text-purple-900">Uploading PDF & Syncing Cloudinary CDN...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Click to upload new Resume PDF</span>
                    <span className="text-[11px] text-slate-400 mt-1">Accepted: PDF documents up to 20MB</span>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Live Resume Cloudinary / CDN URL</label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.resumeUrl, 'resume')}
                      className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                      {copiedResume ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResume ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    className="input-field text-xs font-mono w-full"
                    placeholder="https://res.cloudinary.com/.../resume.pdf"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Download File Name</label>
                  <input
                    type="text"
                    value={formData.resumeFileName}
                    onChange={(e) => setFormData({ ...formData, resumeFileName: e.target.value })}
                    className="input-field text-xs w-full font-medium"
                    placeholder="Himanshu_Bharti_Resume.pdf"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    The name given to the file when downloaded by visitors or recruiters.
                  </span>
                </div>
              </div>
            </div>

            {/* Test Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <a
                  href="http://localhost:5000/api/public/media/resume/download"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs px-3 py-1.5 font-bold flex items-center gap-1.5"
                  title="Direct stream download from backend"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Test Download</span>
                </a>

                <a
                  href="http://localhost:5000/api/public/media/resume/view"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs px-3 py-1.5 font-bold flex items-center gap-1.5"
                  title="Preview inline in browser"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview PDF</span>
                </a>
              </div>

              {formData.resumeUpdatedAt && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Updated: {new Date(formData.resumeUpdatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Developer Intro Video */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Developer Intro Video</h2>
                    <p className="text-xs text-slate-500">Plays on the portfolio homepage hero / about section</p>
                  </div>
                </div>
                <span className="badge badge-indigo text-[11px] font-bold">Featured Video</span>
              </div>

              {/* Upload Drop Zone */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileSelect}
              />

              <div
                onClick={() => videoInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20 rounded-xl p-6 text-center transition-all group"
              >
                {uploadingVideo ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-indigo-900">Uploading Video & Generating Stream...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Click to upload new Intro Video</span>
                    <span className="text-[11px] text-slate-400 mt-1">Accepted: MP4, WebM, MOV up to 50MB</span>
                  </div>
                )}
              </div>

              {/* Player Preview */}
              {formData.introVideoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-2xs">
                  <video
                    key={formData.introVideoUrl}
                    src={formData.introVideoUrl}
                    poster={formData.introVideoPosterUrl}
                    controls
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Video Source URL</label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.introVideoUrl, 'video')}
                      className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                      {copiedVideo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVideo ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.introVideoUrl}
                    onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                    className="input-field text-xs font-mono w-full"
                    placeholder="/intro.mp4 or Cloudinary URL"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Poster Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={formData.introVideoPosterUrl}
                    onChange={(e) => setFormData({ ...formData, introVideoPosterUrl: e.target.value })}
                    className="input-field text-xs w-full"
                    placeholder="/portfolio_crm.webp"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Video Headline / Title</label>
                  <input
                    type="text"
                    value={formData.introVideoTitle}
                    onChange={(e) => setFormData({ ...formData, introVideoTitle: e.target.value })}
                    className="input-field text-xs w-full"
                    placeholder="Himanshu Bharti - AI & Full Stack Engineer Introduction"
                  />
                </div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <a
                href={formData.introVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs px-3 py-1.5 font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Video Directly</span>
              </a>

              {formData.introVideoUpdatedAt && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Updated: {new Date(formData.introVideoUpdatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
