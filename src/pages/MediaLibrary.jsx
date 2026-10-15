import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck2,
  ExternalLink,
  Plus,
  Cloud,
} from 'lucide-react';

export default function MediaLibrary() {
  const { hasPermission } = useAuth();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await api.getMedia({ limit: 40 });
      setMedia(data.media || []);
    } catch (err) {
      showToast(err.message || 'Failed to load media assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files (.webp, .png, .jpg, .svg) are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          await api.uploadMedia({
            fileData: base64Data,
            originalName: file.name,
            altText: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          });
          showToast(`File "${file.name}" uploaded successfully.`);
          loadMedia();
        } catch (uploadErr) {
          showToast(uploadErr.message || 'Upload failed', 'error');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Failed to process file', 'error');
      setUploading(false);
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    showToast('Asset URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete image "${item.originalName}"?`)) return;
    try {
      await api.deleteMedia(item.id);
      showToast(`Asset "${item.originalName}" deleted.`);
      loadMedia();
    } catch (err) {
      showToast(err.message || 'Failed to delete asset', 'error');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in border ${
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog-manager" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Media Assets</span>
              </div>
              <span className="badge badge-sky text-[11px] flex items-center gap-1 font-bold">
                <Cloud className="w-3 h-3 text-sky-600" />
                <span>Cloudinary CDN: xx9f2zvj</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media Library</h1>
            <p className="text-sm text-slate-500">
              Upload, optimize, and manage web assets for articles, featured cards, and OpenGraph tags.
            </p>
          </div>
        </div>

        {hasPermission('media.upload') && (
          <label className="btn-primary text-xs cursor-pointer inline-flex items-center gap-1.5">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Dropzone Banner */}
      {hasPermission('media.upload') && (
        <div className="card-enterprise p-8 border-dashed border-2 border-indigo-200/80 bg-indigo-50/20 text-center hover:bg-indigo-50/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Upload New Graphic Assets</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Drag & drop images here or select from your computer. Supports WebP, PNG, JPEG, SVG up to 5MB.
          </p>
          <div className="mt-4">
            <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5">
              <span>Choose Image File</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="card-enterprise p-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading media assets...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No media assets found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Upload images to use them inside blog posts and featured cards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-32 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs">
                    {item.mimeType?.replace('image/', '')}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={item.originalName}>
                      {item.originalName}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{formatSize(item.size)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                        copiedId === item.id ? 'text-emerald-600 font-bold' : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                      title="Copy URL for editor"
                    >
                      {copiedId === item.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied!' : 'Copy URL'}</span>
                    </button>

                    {hasPermission('media.delete') && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
