'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { getActiveRoadmap } from '@/lib/roadmap-storage';
import { CareerRoadmap, RoadmapNode } from '@/types/roadmap';
import { calculateProgressSummary } from '@/lib/graph-engine';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  AlertTriangle,
  Flame,
  TrendingUp,
} from 'lucide-react';

export default function ProgressPage() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  useEffect(() => {
    setRoadmap(getActiveRoadmap());
    const handleUpdate = (e: CustomEvent<CareerRoadmap>) => {
      setRoadmap(e.detail || getActiveRoadmap());
    };
    window.addEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    return () => {
      window.removeEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    };
  }, []);

  if (!roadmap) {
    return (
      <AppShell>
        <div className="p-8 text-center text-xs text-slate-400">Loading progress...</div>
      </AppShell>
    );
  }

  const stats = calculateProgressSummary(roadmap);

  const completedNodes = roadmap.nodes.filter((n) => n.status === 'completed' || n.status === 'known');
  const inProgressNodes = roadmap.nodes.filter((n) => n.status === 'in_progress');
  const availableNodes = roadmap.nodes.filter((n) => n.status === 'available');
  const blockedNodes = roadmap.nodes.filter((n) => n.status === 'blocked');

  // Collect all unique mastered skills
  const masteredSkills = Array.from(new Set(completedNodes.flatMap((n) => n.skills)));

  // Identify current active phase
  const activePhase = roadmap.phases.find((p) => {
    const nodes = roadmap.nodes.filter((n) => n.phaseId === p.id);
    return nodes.some((n) => n.status === 'in_progress' || n.status === 'available');
  }) || roadmap.phases[0];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                Performance Intelligence
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{roadmap.target.companyType}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {roadmap.target.role} Progress Architecture
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Derived from live completion timestamps, node dependencies, and weekly study pacing.
            </p>
          </div>

          <Link
            href="/roadmap"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Open Graph Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Primary KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Curriculum Progress</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-2">
              {stats.progressPercent}%
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              {stats.completedCount} of {stats.totalCount} milestones completed
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Hours Invested</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1">
              {stats.hoursInvested}h
            </div>
            <span className="text-xs text-slate-500 block">
              Remaining: <strong className="text-slate-800">{stats.hoursRemaining}h</strong> of {stats.totalHours}h
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Based on {roadmap.personalization.hoursPerWeek} hrs/week pacing
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Projected Timeline</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1">
              ~{stats.projectedWeeksRemaining} Wks
            </div>
            <span className="text-xs text-slate-500 block">
              Completion: <strong className="text-indigo-600">{stats.projectedCompletionDate}</strong>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Adaptive to weekly hours changes
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Active Milestone State</span>
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-xl font-bold text-indigo-600 block">{stats.inProgressCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-xl font-bold text-amber-600 block">{stats.availableCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Ready</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-xl font-bold text-slate-400 block">{stats.blockedCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Breakdown & Next Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phase Completion Progress Bars (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Phase Completion Breakdown</h3>
                <p className="text-xs text-slate-500">Progress across curricular layers</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                Active: <strong className="text-indigo-600">{activePhase?.title}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {roadmap.phases.map((phase) => {
                const phaseNodes = roadmap.nodes.filter((n) => n.phaseId === phase.id);
                const completedInPhase = phaseNodes.filter(
                  (n) => n.status === 'completed' || n.status === 'known'
                ).length;
                const percent =
                  phaseNodes.length > 0 ? Math.round((completedInPhase / phaseNodes.length) * 100) : 0;

                return (
                  <div key={phase.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Phase {phase.order}: {phase.title}</span>
                      </div>
                      <span className="font-bold text-slate-700">{percent}% ({completedInPhase}/{phaseNodes.length})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent === 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Next Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Next High-Impact Step</span>
              </div>

              {availableNodes.length > 0 ? (
                <>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {availableNodes[0].title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {availableNodes[0].description}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Effort:</span>
                      <strong className="text-slate-900">{availableNodes[0].estimatedHours}h</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Difficulty:</span>
                      <span className="capitalize text-slate-900">{availableNodes[0].difficulty}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Deliverable:</span>
                      <span className="text-emerald-700 font-medium truncate max-w-[150px]">
                        {availableNodes[0].deliverable}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  All foundational milestones currently satisfied. Proceed to advanced capstone!
                </p>
              )}
            </div>

            {availableNodes.length > 0 && (
              <Link
                href={`/roadmap?node=${availableNodes[0].id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Inspect in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mastered Skills Showcase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Technical Skill Portfolio</h3>
              <p className="text-xs text-slate-500">Skills unlocked through completed deliverables and assessed milestones</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {masteredSkills.length} Skills Mastered
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {masteredSkills.length > 0 ? (
              masteredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                Complete milestones in the roadmap graph to accumulate verified skills here.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

