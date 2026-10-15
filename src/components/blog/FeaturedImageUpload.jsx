import React, { useState, useRef } from 'react';
import { UploadCloud, Cloud, X, RefreshCw, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { api } from '../../services/api';

export default function FeaturedImageUpload({ value, altText = '', onChange, onAltChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // High-performance canvas WebP compression (1200x675 max @ 82% quality)
  const compressImage = (file) => {
    return new Promise((resolve) => {
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
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 675;

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

          const compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(compressedDataUrl);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file) => {
    setUploadError('');

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image format (PNG, JPG, WebP, or GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15MB limit.');
      return;
    }

    setIsUploading(true);

    try {
      // Compress in-browser using HTML5 Canvas WebP encoder
      let imageBase64 = await compressImage(file);

      if (!imageBase64) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      // Upload payload to backend
      const res = await api.uploadMedia({
        fileData: imageBase64,
        originalName: file.name.replace(/\.[^/.]+$/, '') + '.webp',
        altText: altText || file.name,
      });

      if (res.media && res.media.url) {
        onChange(res.media.url);
        setUploadError('');
      } else {
        throw new Error('Upload succeeded but no image URL returned.');
      }
    } catch (err) {
      console.error('Featured image upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setShowUrlInput(false);
    setManualUrl('');
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Alert */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Container */}
      {value ? (
        /* Image Preview State */
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <div className="aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={value}
              alt={altText || 'Featured preview'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                e.target.src = '/portfolio_crm.webp';
              }}
            />
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
            <div className="truncate max-w-[220px]">
              <span className="text-xs font-mono text-slate-600 truncate block">{value}</span>
              {value.includes('cloudinary') ? (
                <span className="text-[10px] text-sky-700 font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-600" /> Cloudinary CDN (xx9f2zvj)
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Canvas WebP Optimized (1200x675)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
                title="Replace Image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {isUploading ? (
            <div className="py-5 flex flex-col items-center justify-center space-y-2.5">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-bold text-slate-800">Compressing & Uploading Canvas WebP Asset...</p>
              <p className="text-[11px] text-slate-400">Encoding in-browser at 1200x675 @ 82% quality</p>
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center justify-center space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  Drop cover image here or <span className="text-indigo-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  JPEG, PNG, WebP up to 15MB • Auto-compressed to 1200x675 WebP
                </p>
              </div>
              <span className="btn-secondary text-[11px] py-1 px-3 shadow-xs font-semibold text-slate-700">
                Choose Local File
              </span>
            </div>
          )}
        </div>
      )}

      {/* URL or Direct Path Input Toggle */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide manual URL input' : 'Or specify image URL / existing path'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="e.g. /portfolio_crm.webp or https://..."
            className="input-field text-xs py-1.5 flex-1 font-mono"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Apply
          </button>
        </div>
      )}

      {/* Alt Text Input */}
      <div>
        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
          Image Alt Text (Accessibility & Image SEO)
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => onAltChange && onAltChange(e.target.value)}
          placeholder="Descriptive image caption explaining visual contents..."
          className="input-field text-xs py-1.5 w-full"
        />
      </div>
    </div>
  );
}
