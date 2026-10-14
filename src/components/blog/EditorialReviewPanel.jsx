import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Send, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EditorialReviewPanel({
  reviewData = {},
  onChange,
  onStatusChange,
}) {
  const { user } = useAuth();
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reasonText, setReasonText] = useState(reviewData.notes || '');

  const status = reviewData.status || 'none';

  const getStatusBadge = () => {
    switch (status) {
      case 'in_review':
        return (
          <span className="badge badge-cyan flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>In Review</span>
          </span>
        );
      case 'changes_requested':
        return (
          <span className="badge badge-rose flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Changes Requested</span>
          </span>
        );
      case 'approved':
        return (
          <span className="badge badge-emerald flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-slate flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Not Reviewed</span>
          </span>
        );
    }
  };

  const handleUpdate = (newStatus, notes = '') => {
    const updated = {
      ...reviewData,
      status: newStatus,
      notes: notes !== undefined ? notes : reviewData.notes,
      reviewedBy: user ? { id: user.id, name: user.name, email: user.email } : null,
      reviewedAt: new Date().toISOString(),
    };
    onChange(updated);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleConfirmChanges = () => {
    if (!reasonText.trim()) return;
    handleUpdate('changes_requested', reasonText.trim());
    setShowReasonInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Current Status Row */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Review Status
          </span>
          <div className="mt-1">{getStatusBadge()}</div>
        </div>

        {reviewData.reviewedAt && (
          <div className="text-right text-[11px] text-slate-400">
            <div>by <strong className="text-slate-700">{reviewData.reviewedBy?.name || 'Reviewer'}</strong></div>
            <div>{new Date(reviewData.reviewedAt).toLocaleDateString()}</div>
          </div>
        )}
      </div>

      {/* Review Notes / Changes Requested Box */}
      {reviewData.notes && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1 font-bold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Editorial Feedback</span>
          </div>
          <p className="leading-relaxed">{reviewData.notes}</p>
        </div>
      )}

      {/* Prompt for Changes Requested */}
      {showReasonInput && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 animate-fade-in">
          <label className="text-xs font-bold text-rose-900 block">
            Explain Changes Requested
          </label>
          <textarea
            rows={2}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="e.g. Please update citations for WhatsApp API pricing..."
            className="input-field text-xs w-full resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReasonInput(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmChanges}
              className="btn-danger text-xs py-1 px-3"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {status !== 'in_review' && status !== 'approved' && (
          <button
            type="button"
            onClick={() => handleUpdate('in_review')}
            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-cyan-600" />
            <span>Submit for Review</span>
          </button>
        )}

        {status !== 'approved' && (
          <button
            type="button"
            onClick={() => handleUpdate('approved')}
            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approve Article</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowReasonInput(!showReasonInput)}
          className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-rose-700 border-rose-200 hover:bg-rose-50"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Request Changes</span>
        </button>

        {status !== 'none' && (
          <button
            type="button"
            onClick={() => handleUpdate('none', '')}
            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-slate-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Status</span>
          </button>
        )}
      </div>
    </div>
  );
}
