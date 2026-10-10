'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ProjectBrief, CareerRoadmap } from '@/types/roadmap';
import {
  getActiveRoadmap,
  getSavedProjects,
  saveProjectBrief,
  toggleProjectComplete,
  saveActiveRoadmap,
} from '@/lib/roadmap-storage';
import {
  Code2,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Copy,
  Clock,
  ExternalLink,
  PlusCircle,
  Check,
  FolderGit2,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function ProjectStudioPage() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [size, setSize] = useState<'weekend' | 'one_week' | 'two_week' | 'capstone'>('weekend');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [preferredStack, setPreferredStack] = useState('Python, FastAPI, Qdrant, Docker');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectBrief | null>(null);
  const [savedProjects, setSavedProjects] = useState<ProjectBrief[]>([]);
  const [copied, setCopied] = useState(false);
  const [addedToRoadmap, setAddedToRoadmap] = useState(false);

  useEffect(() => {
    const r = getActiveRoadmap();
    setRoadmap(r);
    setSavedProjects(getSavedProjects());

    const handleProjUpdate = () => {
      setSavedProjects(getSavedProjects());
    };
    window.addEventListener('pathora-projects-updated', handleProjUpdate);
    return () => window.removeEventListener('pathora-projects-updated', handleProjUpdate);
  }, []);

  const handleGenerateProject = async () => {
    setIsGenerating(true);
    setAddedToRoadmap(false);
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roadmap?.target.role || 'AI Engineer',
          size,
          difficulty,
          preferredStack,
        }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
      }
    } catch (e) {
      console.error('Failed to generate project:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = () => {
    if (!activeProject) return;
    saveProjectBrief(activeProject);
    setSavedProjects(getSavedProjects());
  };

  const handleCopyBrief = () => {
    if (!activeProject) return;
    const briefText = `PROJECT: ${activeProject.title}\nPROBLEM: ${activeProject.problemStatement}\nSTACK: ${activeProject.recommendedStack.join(', ')}\nFEATURES:\n${activeProject.featureRequirements.map((f) => `- ${f}`).join('\n')}\n\nACCEPTANCE CRITERIA:\n${activeProject.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}`;
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToRoadmap = () => {
    if (!activeProject || !roadmap) return;
    const newNodeId = `custom-proj-${Date.now()}`;
    const newRoadmapNode = {
      id: newNodeId,
      title: activeProject.title,
      type: 'project' as const,
      phaseId: roadmap.phases[roadmap.phases.length - 1]?.id || 'phase-1',
      description: activeProject.problemStatement,
      importance: 'essential' as const,
      difficulty: activeProject.difficulty,
      estimatedHours: activeProject.estimatedHours,
      estimatedWeeks: Math.ceil(activeProject.estimatedHours / (roadmap.personalization.hoursPerWeek || 10)),
      status: 'available' as const,
      prerequisites: [],
      skills: activeProject.targetSkills,
      deliverable: 'Completed GitHub repository with architecture diagram and live URL',
      completionCriteria: activeProject.acceptanceCriteria,
      whyItMatters: activeProject.whyItMatters,
      resources: [],
      confidence: 'high' as const,
    };

    const updatedRoadmap: CareerRoadmap = {
      ...roadmap,
      nodes: [...roadmap.nodes, newRoadmapNode],
      summary: {
        ...roadmap.summary,
        estimatedTotalHours: roadmap.summary.estimatedTotalHours + activeProject.estimatedHours,
        hoursRemaining: (roadmap.summary.hoursRemaining || roadmap.summary.estimatedTotalHours) + activeProject.estimatedHours,
      },
    };

    saveActiveRoadmap(updatedRoadmap);
    setRoadmap(updatedRoadmap);
    setAddedToRoadmap(true);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Proof-of-Competence Studio
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Portfolio Project Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Generate demonstrable portfolio specifications tailored for {roadmap?.target.role || 'your target role'} that hiring teams evaluate during technical interviews.
            </p>
          </div>

          <button
            onClick={handleGenerateProject}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing Spec...' : 'Generate Project Idea'}</span>
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-900 block mb-1.5">Project Scope / Size</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'weekend', label: 'Weekend (8h)' },
                { id: 'one_week', label: '1 Week (20h)' },
                { id: 'two_week', label: '2 Weeks (40h)' },
                { id: 'capstone', label: 'Capstone (80h)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id as unknown as typeof size)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    size === s.id
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1.5">Target Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as unknown as typeof difficulty)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-medium"
            >
              <option value="beginner">Beginner (Foundational)</option>
              <option value="intermediate">Intermediate (Production-like)</option>
              <option value="advanced">Advanced (High Scale / Deep Tech)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1.5">Preferred Technologies</label>
            <input
              type="text"
              value={preferredStack}
              onChange={(e) => setPreferredStack(e.target.value)}
              placeholder="e.g. Next.js, FastAPI, PyTorch..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Project View (If Active) */}
        {activeProject ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Project Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {activeProject.size.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-semibold">{activeProject.estimatedHours} Estimated Hours</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeProject.title}</h2>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBrief}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
                </button>

                <button
                  onClick={handleSaveProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Project</span>
                </button>

                <button
                  onClick={handleAddToRoadmap}
                  disabled={addedToRoadmap}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{addedToRoadmap ? 'Added to Graph' : 'Add to Roadmap'}</span>
                </button>
              </div>
            </div>

            {/* Problem & Why it Matters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                  Problem Statement
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{activeProject.problemStatement}</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Why Hiring Managers Care
                </span>
                <p className="text-xs text-indigo-950 leading-relaxed">{activeProject.whyItMatters}</p>
              </div>
            </div>

            {/* Recommended Stack */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">Recommended Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {activeProject.recommendedStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Features & Acceptance Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Core Feature Requirements</span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeProject.featureRequirements.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Acceptance & Verification Criteria</span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeProject.acceptanceCriteria.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Defense Points */}
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">
                Technical Interview Discussion Defense Points
              </span>
              <ul className="text-xs text-amber-950 space-y-1">
                {activeProject.interviewDiscussionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <Code2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Project Active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Generate Project Idea&quot; above to synthesize a tailored project brief based on your selected size and stack.
            </p>
          </div>
        )}

        {/* Saved Projects Library */}
        {savedProjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Saved Project Library ({savedProjects.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedProjects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                    <button
                      onClick={() => toggleProjectComplete(p.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.isCompleted ? '✓ Built' : 'Pending'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{p.problemStatement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

