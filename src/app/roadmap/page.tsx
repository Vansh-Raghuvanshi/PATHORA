'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import RoadmapGraph from '@/components/graph/RoadmapGraph';
import MilestonePanel from '@/components/workspace/MilestonePanel';
import ReplanModal from '@/components/workspace/ReplanModal';
import {
  CareerRoadmap,
  RoadmapNode,
  NodeStatus,
  ReplanEvent,
} from '@/types/roadmap';
import {
  getActiveRoadmap,
  saveActiveRoadmap,
} from '@/lib/roadmap-storage';
import {
  applyMarkSkillAsKnown,
  applyWeeklyHoursChange,
  applyDeadlineChange,
  applyMilestoneCompletion,
  calculateProgressSummary,
} from '@/lib/graph-engine';
import {
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sliders,
  Share2,
} from 'lucide-react';

function RoadmapWorkspaceInner() {
  const searchParams = useSearchParams();
  const initialNodeId = searchParams.get('node');

  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');

  // Replan Modal state
  const [isReplanOpen, setIsReplanOpen] = useState(false);
  const [replanMode, setReplanMode] = useState<'known' | 'hours' | 'deadline'>('known');
  const [activeReplanNode, setActiveReplanNode] = useState<RoadmapNode | null>(null);
  const [pendingReplanEvent, setPendingReplanEvent] = useState<ReplanEvent | null>(null);

  const [adaptiveNotification, setAdaptiveNotification] = useState<string | null>(null);

  useEffect(() => {
    const r = getActiveRoadmap();
    setRoadmap(r);

    if (initialNodeId && r) {
      const target = r.nodes.find((n) => n.id === initialNodeId);
      if (target) setSelectedNode(target);
    }

    const handleUpdate = (e: CustomEvent<CareerRoadmap>) => {
      setRoadmap(e.detail || getActiveRoadmap());
    };
    window.addEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    return () => {
      window.removeEventListener('pathora-roadmap-updated' as unknown as keyof WindowEventMap, handleUpdate as EventListener);
    };
  }, [initialNodeId]);

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          <span>Loading Career Intelligence Graph...</span>
        </div>
      </div>
    );
  }

  const stats = calculateProgressSummary(roadmap);

  // Status update handler
  const handleUpdateStatus = (nodeId: string, newStatus: NodeStatus) => {
    if (newStatus === 'completed') {
      const hoursBefore = roadmap.summary.hoursRemaining;
      const weeksBefore = roadmap.summary.estimatedDurationWeeks;
      const { updatedRoadmap } = applyMilestoneCompletion(roadmap, nodeId);
      setRoadmap(updatedRoadmap);
      saveActiveRoadmap(updatedRoadmap);
      const updatedNode = updatedRoadmap.nodes.find((n) => n.id === nodeId);
      if (updatedNode) setSelectedNode(updatedNode);

      const newlyUnlocked = updatedRoadmap.nodes.filter(
        (n) => n.status === 'available' && roadmap.nodes.find((old) => old.id === n.id)?.status === 'blocked'
      ).length;

      setAdaptiveNotification(
        `🎉 Milestone completed! Unlocked ${newlyUnlocked} downstream milestone${newlyUnlocked === 1 ? '' : 's'} and invested ${updatedNode?.estimatedHours || 20} hours toward your target.`
      );
      setTimeout(() => setAdaptiveNotification(null), 5000);
    } else {
      const updatedNodes = roadmap.nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, status: newStatus };
        }
        return n;
      });
      const updatedRoadmap = { ...roadmap, nodes: updatedNodes };
      setRoadmap(updatedRoadmap);
      saveActiveRoadmap(updatedRoadmap);
      const updatedNode = updatedNodes.find((n) => n.id === nodeId);
      if (updatedNode) setSelectedNode(updatedNode);
    }
  };

  // Flow A: Trigger Mark as Known Modal
  const handleTriggerMarkKnown = (nodeId: string) => {
    const target = roadmap.nodes.find((n) => n.id === nodeId);
    if (!target) return;
    setActiveReplanNode(target);
    setReplanMode('known');

    // Simulate before & after for modal
    const { replanEvent } = applyMarkSkillAsKnown(roadmap, nodeId, false);
    setPendingReplanEvent(replanEvent);
    setIsReplanOpen(true);
  };

  // Flow A: Confirm Mark as Known
  const handleConfirmMarkKnown = () => {
    if (!activeReplanNode) return;
    const weeksBefore = roadmap.summary.estimatedDurationWeeks;
    const { updatedRoadmap, replanEvent } = applyMarkSkillAsKnown(roadmap, activeReplanNode.id, false);
    setRoadmap(updatedRoadmap);
    saveActiveRoadmap(updatedRoadmap);
    const updated = updatedRoadmap.nodes.find((n) => n.id === activeReplanNode.id);
    if (updated) setSelectedNode(updated);

    const hoursSaved = replanEvent.hoursSaved;
    const weeksSaved = Math.max(0, weeksBefore - replanEvent.weeksAfter);
    setAdaptiveNotification(
      `✨ Roadmap Adapted: Saved ${hoursSaved} hours! Schedule accelerated by ~${weeksSaved} week${weeksSaved === 1 ? '' : 's'}. Downstream prerequisites recalculated.`
    );
    setTimeout(() => setAdaptiveNotification(null), 6000);
  };

  // Flow B: Apply Weekly Hours Change
  const handleApplyHoursChange = (newHours: number) => {
    const { updatedRoadmap } = applyWeeklyHoursChange(roadmap, newHours);
    setRoadmap(updatedRoadmap);
    saveActiveRoadmap(updatedRoadmap);
  };

  // Flow C: Apply Deadline Change
  const handleApplyDeadlineChange = (newMonths: number) => {
    const { updatedRoadmap } = applyDeadlineChange(roadmap, newMonths);
    setRoadmap(updatedRoadmap);
    saveActiveRoadmap(updatedRoadmap);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Top Interactive Workspace Bar */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Role Title & Pacing Info */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {roadmap.target.role}
              </h2>
              {roadmap.isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Interactive Demo
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{roadmap.target.companyType}</span>
              <span>•</span>
              <span>{roadmap.target.location}</span>
            </div>
          </div>
        </div>

        {/* Center: Real Application State Progress Metrics */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Progress:</span>
            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <span className="font-bold text-slate-900">{stats.progressPercent}%</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>~{stats.hoursRemaining}h remaining (approx.)</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1 text-slate-500">
              <span>~{stats.projectedWeeksRemaining} weeks</span>
            </div>
          </div>
        </div>

        {/* Right: Adaptive Replan Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReplanMode('hours');
              setIsReplanOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Adjust study hours/week and replan timeline"
          >
            <Sliders className="w-3 h-3 text-slate-400" />
            <span>{roadmap.personalization.hoursPerWeek}h/wk</span>
          </button>

          <button
            onClick={() => {
              setReplanMode('deadline');
              setIsReplanOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Adjust target months and replan scope"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{roadmap.personalization.targetMonths} Mo Target</span>
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* Adaptive Notification Toast */}
        {adaptiveNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-lg px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{adaptiveNotification}</span>
            <button
              onClick={() => setAdaptiveNotification(null)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        <RoadmapGraph
          roadmap={roadmap}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          onSelectNode={(node) => setSelectedNode(node)}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {/* Milestone Detail Inspector Drawer */}
        {selectedNode && (
          <MilestonePanel
            node={selectedNode}
            roadmap={roadmap}
            onClose={() => setSelectedNode(null)}
            onUpdateStatus={handleUpdateStatus}
            onMarkKnown={handleTriggerMarkKnown}
            onTriggerReplan={() => {
              setReplanMode('hours');
              setIsReplanOpen(true);
            }}
            onNavigateToNode={(nodeId) => {
              const target = roadmap.nodes.find((n) => n.id === nodeId);
              if (target) setSelectedNode(target);
            }}
          />
        )}
      </div>

      {/* Adaptive Replanning Modal */}
      <ReplanModal
        isOpen={isReplanOpen}
        onClose={() => setIsReplanOpen(false)}
        mode={replanMode}
        nodeTitle={activeReplanNode?.title}
        replanEvent={pendingReplanEvent}
        currentHours={roadmap.personalization.hoursPerWeek}
        currentMonths={roadmap.personalization.targetMonths}
        onConfirmReplan={handleConfirmMarkKnown}
        onApplyHoursChange={handleApplyHoursChange}
        onApplyDeadlineChange={handleApplyDeadlineChange}
      />
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Workspace...</div>}>
        <RoadmapWorkspaceInner />
      </Suspense>
    </AppShell>
  );
}

