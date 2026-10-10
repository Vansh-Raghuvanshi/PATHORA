'use client';

import React, { useState } from 'react';
import { CareerRoadmap } from '@/types/roadmap';
import {
  Download,
  Share2,
  Copy,
  Check,
  FileCode,
  Printer,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: CareerRoadmap;
}

export default function ExportShareModal({
  isOpen,
  onClose,
  roadmap,
}: ExportShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/roadmap?id=${roadmap.roadmapId}`
    : `https://pathora.app/roadmap?id=${roadmap.roadmapId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(roadmap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${roadmap.roadmapId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Export & Share Roadmap</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Share Link */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Shareable Public Roadmap Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Public link displays a read-only interactive view without exposing personal private information.
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block">
              Downloadable Artifacts
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadJSON}
                className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileCode className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Download JSON</span>
                <span className="text-[10px] text-slate-500">Structured data & edges</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 mb-2 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Print / PDF Report</span>
                <span className="text-[10px] text-slate-500">Print-ready curriculum</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Target Role:</span>
              <strong className="text-slate-900">{roadmap.target.role}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Curriculum Scope:</span>
              <span className="text-slate-900">{roadmap.summary.estimatedTotalHours} Hours ({roadmap.nodes.length} Milestones)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Duration Projection:</span>
              <span className="text-slate-900">~{roadmap.summary.estimatedDurationWeeks} Weeks ({roadmap.personalization.hoursPerWeek}h/wk)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

