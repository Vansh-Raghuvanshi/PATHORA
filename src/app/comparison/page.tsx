'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { RoleComparisonData } from '@/types/roadmap';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  Bookmark,
  Share2,
  Check,
  Compass,
} from 'lucide-react';

export default function ComparisonPage() {
  const [roleA, setRoleA] = useState('AI Engineer');
  const [roleB, setRoleB] = useState('Data Scientist');
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<RoleComparisonData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    handleRunComparison('AI Engineer', 'Data Scientist');
  }, []);

  const presets = [
    { a: 'AI Engineer', b: 'Data Scientist' },
    { a: 'Frontend Engineer', b: 'Full Stack Developer' },
    { a: 'Machine Learning Engineer', b: 'Data Engineer' },
    { a: 'Cloud Architect', b: 'DevOps / SRE' },
  ];

  const handleRunComparison = async (targetA = roleA, targetB = roleB) => {
    setIsComparing(true);
    setSaved(false);
    try {
      const res = await fetch('/api/compare-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleA: targetA,
          roleB: targetB,
          hoursPerWeek: 10,
          targetMonths: 6,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComparison(data.comparison);
      }
    } catch (e) {
      console.error('Failed to compare roles:', e);
    } finally {
      setIsComparing(false);
    }
  };

  const handleApplyPreset = (a: string, b: string) => {
    setRoleA(a);
    setRoleB(b);
    handleRunComparison(a, b);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Career Strategy & Pivot Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Path Overlap & Comparison
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Compare two technical destinations to analyze shared foundational curriculum, unique specialized milestones, effort deltas, and career pivot flexibility.
          </p>
        </div>

        {/* Input Comparison Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Primary Role (A)</label>
              <input
                type="text"
                value={roleA}
                onChange={(e) => setRoleA(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Alternative Role (B)</label>
              <input
                type="text"
                value={roleB}
                onChange={(e) => setRoleB(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Compare Presets:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p.a, p.b)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                >
                  {p.a} vs {p.b}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRunComparison()}
              disabled={isComparing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Synthesizing Overlap...' : 'Compare Roles'}</span>
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* High-level Strategy Card */}
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Strategic Career Architecture Advice
                </span>
                <button
                  onClick={() => setSaved(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-colors"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved to Library' : 'Save Comparison'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {comparison.strategicAdvice}
              </p>
            </div>

            {/* Metric Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Shared Foundation Overlap
                </span>
                <span className="text-3xl font-extrabold text-indigo-600">
                  {comparison.prerequisiteOverlapPercentage}%
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Core skills shared across both roadmaps
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Career Flexibility Score
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">
                  {comparison.careerFlexibilityScore}/100
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ease of pivoting between both career paths
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Total Effort Delta
                </span>
                <span className="text-3xl font-extrabold text-slate-900">
                  {comparison.effortDeltaHours}h
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Estimated difference in curricular work
                </p>
              </div>
            </div>

            {/* Overlap Breakdown: Side-by-Side Aligned Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Unique to Role A */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900">Unique to {roleA}</h3>
                </div>
                <p className="text-xs text-slate-500">Skills specialized purely for {roleA}:</p>
                <div className="space-y-2">
                  {comparison.uniqueToA.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100 text-xs font-semibold text-blue-900"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Foundational Core */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-xs space-y-4 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  Shared Core Foundation
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Mutual Prerequisites</h3>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Master once to satisfy requirements for both roles:
                </p>
                <div className="space-y-2">
                  {comparison.sharedSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-900 text-center"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unique to Role B */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900">Unique to {roleB}</h3>
                </div>
                <p className="text-xs text-slate-500">Skills specialized purely for {roleB}:</p>
                <div className="space-y-2">
                  {comparison.uniqueToB.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs font-semibold text-emerald-900"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interview Differences */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Interview Focus Discrepancies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.interviewFocusDifferences.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">{diff.role} Evaluates:</span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {diff.focus.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

