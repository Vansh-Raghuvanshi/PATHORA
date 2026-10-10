'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  RoadmapNode,
  CareerRoadmap,
  NodeStatus,
} from '@/types/roadmap';
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  Code2,
  FolderGit2,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  Lock,
  MessagesSquare,
  Sliders,
} from 'lucide-react';
import { getBlockingPrerequisites } from '@/lib/graph-engine';

interface MilestonePanelProps {
  node: RoadmapNode | null;
  roadmap: CareerRoadmap;
  onClose: () => void;
  onUpdateStatus: (nodeId: string, newStatus: NodeStatus) => void;
  onMarkKnown: (nodeId: string) => void;
  onNavigateToNode: (nodeId: string) => void;
  onTriggerReplan?: () => void;
  onOpenStudioWithNode?: (node: RoadmapNode) => void;
  onOpenInterviewWithNode?: (node: RoadmapNode) => void;
}

export default function MilestonePanel({
  node,
  roadmap,
  onClose,
  onUpdateStatus,
  onMarkKnown,
  onNavigateToNode,
  onTriggerReplan,
}: MilestonePanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'resources'>('overview');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    title: string;
    overview: string;
    schedule: { day: string; focus: string; tasks: string[] }[];
  } | null>(null);

  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<{
    title: string;
    problemStatement: string;
    recommendedStack: string[];
    featureRequirements: string[];
    acceptanceCriteria: string[];
  } | null>(null);

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    question: string;
    framework: string;
    redFlags: string;
  }[] | null>(null);

  if (!node) return null;

  const blockers = getBlockingPrerequisites(node, roadmap.nodes);
  const isBlocked = blockers.length > 0 && node.status !== 'completed' && node.status !== 'known';

  const handleMarkCompleted = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
    onUpdateStatus(node.id, 'completed');
  };

  const handleGenerateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/milestone-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'study_plan',
          milestoneTitle: node.title,
          milestoneDescription: node.description,
          targetRole: roadmap.target.role,
          skills: node.skills,
          difficulty: node.difficulty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPlan(data.data);
      }
    } catch (e) {
      console.error('Failed to generate study plan:', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateProject = async () => {
    setIsGeneratingProject(true);
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roadmap.target.role,
          milestoneTitle: node.title,
          difficulty: node.difficulty,
          size: 'weekend',
        }),
      });
      const data = await res.json();
      if (data.project) {
        setGeneratedProject(data.project);
      }
    } catch (e) {
      console.error('Failed to generate project:', e);
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await fetch('/api/milestone-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interview_questions',
          milestoneTitle: node.title,
          targetRole: roadmap.target.role,
          skills: node.skills,
          difficulty: node.difficulty,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.questions) {
        setGeneratedQuestions(data.data.questions);
      }
    } catch (e) {
      console.error('Failed to generate interview questions:', e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {node.type}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {roadmap.phases.find((p) => p.id === node.phaseId)?.title || 'Phase Milestone'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Quick Stats */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-white">
        <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">{node.title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>~{node.estimatedHours} Hours (approx.)</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
            {node.difficulty}
          </span>
          <span className="text-slate-300">•</span>
          <span
            className={`capitalize px-2 py-0.5 rounded text-[11px] font-medium ${
              node.importance === 'essential'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {node.importance}
          </span>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
        {node.status === 'blocked' ? (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-amber-900 block leading-tight">Blocked by Prerequisites</span>
                <span className="text-[10px] text-amber-700">Master upstream milestones to unlock this stage</span>
              </div>
            </div>
            {blockers[0] && (
              <button
                onClick={() => onNavigateToNode(blockers[0].id)}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors shrink-0 shadow-xs"
              >
                Go to Prereq →
              </button>
            )}
          </div>
        ) : node.status === 'in_progress' ? (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
              <div>
                <span className="text-[11px] font-bold text-indigo-900 block leading-tight">Active In-Progress Sprint</span>
                <span className="text-[10px] text-indigo-700">When your deliverable is ready, mark complete</span>
              </div>
            </div>
            <button
              onClick={handleMarkCompleted}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs shrink-0 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          </div>
        ) : node.status === 'completed' || node.status === 'known' ? (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-900 block leading-tight">Milestone Mastered</span>
                <span className="text-[10px] text-emerald-700">Downstream milestones are unlocked and ready</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateStatus(node.id, 'available')}
              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 transition-colors shrink-0"
            >
              Reopen
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-amber-900 block leading-tight">Ready to Start</span>
                <span className="text-[10px] text-amber-700">All prerequisites satisfied — begin this milestone</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateStatus(node.id, 'in_progress')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors shadow-xs shrink-0 flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Sprint</span>
            </button>
          </div>
        )}

        {/* Quick Action Triggers */}
        <div className="flex items-center gap-2 pt-2 text-[11px] font-semibold">
          <button
            onClick={() => {
              setActiveTab('actions');
              if (!generatedProject && !isGeneratingProject) handleGenerateProject();
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
          >
            <FolderGit2 className="w-3 h-3 text-emerald-600" />
            <span>Generate Project</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('actions');
              if (!generatedQuestions && !isGeneratingQuestions) handleGenerateQuestions();
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-800 hover:bg-orange-50 transition-colors shadow-2xs"
          >
            <MessagesSquare className="w-3 h-3 text-orange-600" />
            <span>Interview Qs</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 px-5 gap-4 bg-white text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Overview & Proof
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`py-2.5 border-b-2 transition-colors ${
            activeTab === 'actions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          AI Practice & Plan
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`py-2.5 border-b-2 transition-colors ${
            activeTab === 'resources'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Resources ({node.resources?.length || 0})
        </button>
      </div>

      {/* Tab Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-800">
        {/* Blocker Warning if Prerequisites not met */}
        {isBlocked && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Prerequisites Required Before Starting</span>
            </div>
            <p className="text-amber-700 mb-2 leading-relaxed text-[11px]">
              This milestone builds directly on skills taught in upstream milestones. Complete or assess the following first:
            </p>
            <div className="space-y-1.5">
              {blockers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onNavigateToNode(b.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/90 border border-amber-200/80 text-left hover:bg-white transition-colors"
                >
                  <span className="font-medium text-amber-900 text-xs">{b.title}</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Inspect →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Why it Matters */}
            {node.whyItMatters && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Why It Matters for {roadmap.target.role}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {node.whyItMatters}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Milestone Scope
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{node.description}</p>
            </div>

            {/* Prerequisites Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Prerequisites ({node.prerequisites?.length || 0})
              </h4>
              {node.prerequisites && node.prerequisites.length > 0 ? (
                <div className="space-y-1.5">
                  {node.prerequisites.map((prereqId) => {
                    const prereqNode = roadmap.nodes.find((n) => n.id === prereqId);
                    if (!prereqNode) return null;
                    const isDone = prereqNode.status === 'completed' || prereqNode.status === 'known';
                    return (
                      <button
                        key={prereqId}
                        onClick={() => onNavigateToNode(prereqId)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${
                          isDone
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:bg-emerald-50'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold">{prereqNode.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {prereqNode.status.replace('_', ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  None — Foundational milestone. You can begin this immediately.
                </p>
              )}
            </div>

            {/* Learning Objectives */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Learning Objectives
              </h4>
              <ul className="space-y-1.5">
                {node.learningObjectives && node.learningObjectives.length > 0 ? (
                  node.learningObjectives.map((obj, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Master core principles of {node.skills?.join(', ') || node.title}</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Build verifiable deliverable: {node.deliverable}</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Satisfy production acceptance criteria to unlock downstream milestones</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Practical Deliverable / Proof of Skill */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                <span>Tangible Deliverable (Proof of Skill)</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {node.deliverable}
              </p>
            </div>

            {/* Completion Criteria Checklist */}
            {node.completionCriteria && node.completionCriteria.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Completion Criteria
                </h4>
                <ul className="space-y-1.5">
                  {node.completionCriteria.map((criterion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Skills */}
            {node.skills && node.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Skills Developed
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {node.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {node.commonMistakes && node.commonMistakes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Common Pitfalls to Avoid
                </h4>
                <ul className="space-y-1">
                  {node.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            {/* Inline Actionable Project Generator */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-600" />
                  <h5 className="text-xs font-bold text-slate-900">Actionable Portfolio Project</h5>
                </div>
                <button
                  onClick={handleGenerateProject}
                  disabled={isGeneratingProject}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isGeneratingProject ? 'Synthesizing...' : generatedProject ? 'Regenerate' : 'Generate Project Idea'}
                </button>
              </div>

              {generatedProject ? (
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">{generatedProject.title}</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{generatedProject.problemStatement}</p>
                  </div>
                  {generatedProject.recommendedStack && generatedProject.recommendedStack.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Recommended Tech Stack:</span>
                      <div className="flex flex-wrap gap-1">
                        {generatedProject.recommendedStack.map((tech, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {generatedProject.featureRequirements && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Core Deliverables:</span>
                      <ul className="space-y-1">
                        {generatedProject.featureRequirements.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Generate a concrete portfolio project spec with architecture and acceptance criteria specifically for {node.title}.
                </p>
              )}
            </div>

            {/* Inline Technical Interview Prompts Generator */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessagesSquare className="w-4 h-4 text-orange-600" />
                  <h5 className="text-xs font-bold text-slate-900">Technical Interview Defense</h5>
                </div>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={isGeneratingQuestions}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isGeneratingQuestions ? 'Generating...' : generatedQuestions ? 'Regenerate' : 'Generate Interview Questions'}
                </button>
              </div>

              {generatedQuestions ? (
                <div className="space-y-2.5 pt-1 text-xs">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-orange-50/40 border border-orange-100/80 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[11px]">Q{idx + 1}: {q.question}</div>
                      <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-orange-100">
                        <span className="font-semibold text-slate-700">Model Framework: </span>
                        {q.framework}
                      </div>
                      {q.redFlags && (
                        <div className="text-[10px] text-rose-600">
                          <span className="font-semibold">Red Flag: </span>{q.redFlags}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Generate realistic senior interview questions, STAR answer frameworks, and red flags for this milestone.
                </p>
              )}
            </div>

            {/* 7-Day Targeted Study Plan Generator */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h5 className="text-xs font-bold text-slate-900">7-Day Targeted Study Plan</h5>
                </div>
                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={isGeneratingPlan}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isGeneratingPlan ? 'Generating...' : generatedPlan ? 'Regenerate' : 'Generate Plan'}
                </button>
              </div>

              {generatedPlan ? (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-600 text-[11px]">{generatedPlan.overview}</p>
                  <div className="space-y-2 pt-1">
                    {generatedPlan.schedule.map((day, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100/80">
                        <div className="flex items-center justify-between font-bold text-slate-900 text-[11px] mb-1">
                          <span>{day.day}</span>
                          <span className="text-indigo-600 font-medium">{day.focus}</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                          {day.tasks.map((task, tIdx) => (
                            <li key={tIdx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Break down this {node.estimatedHours}h milestone into daily targeted tasks with reading, coding, and review.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Official specs and authoritative resources for this milestone. Resources verified by PATHORA display a verified badge.
            </div>

            {node.resources && node.resources.length > 0 ? (
              node.resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">{res.title}</h5>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mb-1.5">
                    <span className="capitalize">{res.type}</span>
                    <span>•</span>
                    <span className="capitalize">{res.cost}</span>
                    {res.provider && (
                      <>
                        <span>•</span>
                        <span>{res.provider}</span>
                      </>
                    )}
                  </div>

                  {res.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" /> Verified Official Resource
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Community Suggested
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                No external links attached. Use official language docs.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {node.status !== 'completed' && node.status !== 'known' ? (
            <button
              onClick={handleMarkCompleted}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(node.id, 'available')}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reopen Milestone</span>
            </button>
          )}

          {node.status !== 'in_progress' ? (
            <button
              onClick={() => onUpdateStatus(node.id, 'in_progress')}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Play className="w-4 h-4" />
              <span>Set In Progress</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(node.id, 'available')}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
            >
              Pause Milestone
            </button>
          )}
        </div>

        {/* Adaptive Flow A: Already Known Button */}
        {node.status !== 'known' && node.status !== 'completed' && (
          <button
            onClick={() => onMarkKnown(node.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>I Already Know This (Adapt & Replan Roadmap)</span>
          </button>
        )}

        {/* Replan Pace or Timeline */}
        {onTriggerReplan && (
          <button
            onClick={onTriggerReplan}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600 text-[11px] font-semibold hover:bg-slate-100 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Replan Pace or Timeline</span>
          </button>
        )}
      </div>
    </div>
  );
}

