'use client';

import React, { useState } from 'react';
import { CareerRoadmap, ReplanEvent } from '@/types/roadmap';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
} from 'lucide-react';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeTitle?: string;
  replanEvent?: ReplanEvent | null;
  onConfirmReplan: () => void;
  mode?: 'known' | 'hours' | 'deadline';
  currentHours?: number;
  currentMonths?: number;
  onApplyHoursChange?: (newHours: number) => void;
  onApplyDeadlineChange?: (newMonths: number) => void;
}

export default function ReplanModal({
  isOpen,
  onClose,
  nodeTitle,
  replanEvent,
  onConfirmReplan,
  mode = 'known',
  currentHours = 10,
  currentMonths = 6,
  onApplyHoursChange,
  onApplyDeadlineChange,
}: ReplanModalProps) {
  const [selectedHours, setSelectedHours] = useState(currentHours);
  const [selectedMonths, setSelectedMonths] = useState(currentMonths);
  const [assessOnly, setAssessOnly] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'known'
                ? 'Adaptive Replan: Skill Already Mastered'
                : mode === 'hours'
                ? 'Adaptive Replan: Pacing Adjustment'
                : 'Adaptive Replan: Timeline Adjustment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {mode === 'known' && (
            <>
              <div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  You are marking <strong className="text-slate-900 font-bold">"{nodeTitle}"</strong> as already known.
                  PATHORA will remove redundant study hours, unblock downstream dependent milestones, and accelerate your target completion date.
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={assessOnly}
                      onChange={(e) => setAssessOnly(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">
                      <strong>Self-assessment only:</strong> Keep the deliverable criteria for quick verification before applying to jobs.
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {mode === 'hours' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Adjust your weekly study commitment. The total curriculum work scope remains honest and preserved—your projected duration adapts automatically.
              </p>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-700">Available Hours / Week</span>
                  <span className="font-bold text-indigo-600 text-sm">{selectedHours} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="40"
                  step="1"
                  value={selectedHours}
                  onChange={(e) => setSelectedHours(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5h (Part-time student)</span>
                  <span>15h (Moderate)</span>
                  <span>30h+ (Full-time bootcamber)</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'deadline' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Target months to job-hunt readiness. PATHORA will balance essential requirements and flag elective specializations for post-placement deferral if compressed.
              </p>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-700">Target Timeline</span>
                  <span className="font-bold text-indigo-600 text-sm">{selectedMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="18"
                  step="1"
                  value={selectedMonths}
                  onChange={(e) => setSelectedMonths(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>3 Months (Fast-track)</span>
                  <span>6 Months (Recommended)</span>
                  <span>12 Months (Comprehensive)</span>
                </div>
              </div>
            </div>
          )}

          {/* Before & After Simulation Box */}
          {replanEvent && (
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-3">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Projected Impact on Career Plan
              </span>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-medium block">Hours Remaining</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-slate-400 line-through text-xs font-semibold">
                      {replanEvent.hoursBefore}h
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-emerald-600">
                      {replanEvent.hoursAfter}h
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-medium block">Projected Timeline</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-slate-400 line-through text-xs font-semibold">
                      ~{replanEvent.weeksBefore}w
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-indigo-600">
                      ~{replanEvent.weeksAfter}w
                    </span>
                  </div>
                </div>
              </div>

              {replanEvent.tradeoffs && replanEvent.tradeoffs.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                    System Trade-Off Analysis:
                  </span>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    {replanEvent.tradeoffs.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>

          {mode === 'known' && (
            <button
              onClick={() => {
                onConfirmReplan();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Confirm & Replan Roadmap
            </button>
          )}

          {mode === 'hours' && (
            <button
              onClick={() => {
                if (onApplyHoursChange) onApplyHoursChange(selectedHours);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Update Hours Pacing
            </button>
          )}

          {mode === 'deadline' && (
            <button
              onClick={() => {
                if (onApplyDeadlineChange) onApplyDeadlineChange(selectedMonths);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Adapt Curriculum Timeline
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

