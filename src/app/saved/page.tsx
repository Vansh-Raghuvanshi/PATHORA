'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { CareerRoadmap } from '@/types/roadmap';
import {
  getSavedRoadmaps,
  saveActiveRoadmap,
  deleteRoadmapFromLibrary,
  saveRoadmapToLibrary,
} from '@/lib/roadmap-storage';
import {
  Bookmark,
  Layers,
  Clock,
  ArrowRight,
  Trash2,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export default function SavedRoadmapsPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setRoadmaps(getSavedRoadmaps());
  }, []);

  const handleSelectRoadmap = (r: CareerRoadmap) => {
    saveActiveRoadmap(r);
    router.push('/roadmap');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRoadmapFromLibrary(id);
    setRoadmaps(getSavedRoadmaps());
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.roadmapId || !parsed.target || !parsed.nodes) {
          throw new Error('Invalid PATHORA roadmap JSON structure');
        }
        saveRoadmapToLibrary(parsed);
        saveActiveRoadmap(parsed);
        setRoadmaps(getSavedRoadmaps());
        router.push('/roadmap');
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Personalized Library
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Saved Career Roadmaps
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Switch between target careers, import external roadmaps, or create a new path.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <Link
              href="/generator"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Career Path</span>
            </Link>
          </div>
        </div>

        {importError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {importError}
          </div>
        )}

        {/* Roadmap Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.map((r) => (
            <div
              key={r.roadmapId}
              onClick={() => handleSelectRoadmap(r)}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {r.target.role}
                    </span>
                    {r.isDemo && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Demo
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 block truncate">
                    {r.target.companyType} • {r.target.location}
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(r.roadmapId, e)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Scope</span>
                  <span className="font-bold text-slate-900">{r.summary.estimatedTotalHours}h</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Timeline</span>
                  <span className="font-bold text-slate-900">~{r.summary.estimatedDurationWeeks}w</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Pacing</span>
                  <span className="font-bold text-indigo-600">{r.personalization.hoursPerWeek}h/wk</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>{r.nodes.length} Milestones in {r.phases.length} Phases</span>
                <span className="flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

