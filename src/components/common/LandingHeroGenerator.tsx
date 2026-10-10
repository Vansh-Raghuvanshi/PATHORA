'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { saveActiveRoadmap } from '@/lib/roadmap-storage';
import { CareerRoadmap } from '@/types/roadmap';

export default function LandingHeroGenerator() {
  const router = useRouter();
  const [role, setRole] = useState('AI Engineer at a product-based company in India');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [targetMonths, setTargetMonths] = useState(6);
  const [startingLevel, setStartingLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'AI Engineer in India',
    'Full-Stack Developer at SaaS',
    'ML Engineer in Climate Tech',
    'Data Scientist in Fintech',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: {
            role: role.trim(),
            industry: 'Technology & Software',
            companyType: 'Product-Based Company',
            location: 'India / Remote',
            seniority: startingLevel === 'beginner' ? 'Entry Level' : 'Mid Level',
          },
          personalization: {
            hoursPerWeek,
            targetMonths,
            startingLevel,
            freeResourcesOnly: true,
            preferredLearningStyle: 'project-first',
            programmingExperience: startingLevel === 'beginner' ? 'Beginner Python / CS fundamentals' : '1-2 years coding',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      saveActiveRoadmap(data.roadmap as CareerRoadmap);
      router.push('/roadmap');
    } catch (err: unknown) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 text-left">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Dream Role Input */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Dream Career Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. AI Engineer at a product startup, Frontend Developer..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRole(p)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Constraints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Weekly Hours */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Weekly Study Budget
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[10, 15, 20].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoursPerWeek(h)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    hoursPerWeek === h
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {h}h/wk
                </button>
              ))}
            </div>
          </div>

          {/* Target Timeline */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Target Timeline
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMonths(m)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    targetMonths === m
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m} Mo
                </button>
              ))}
            </div>
          </div>

          {/* Starting Level */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Current Level
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(['beginner', 'intermediate'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStartingLevel(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    startingLevel === lvl
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="submit"
            disabled={isGenerating || !role.trim()}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reverse-Engineering Career Path...</span>
              </>
            ) : (
              <>
                <span>Build my roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/roadmap"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all shrink-0"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Explore a sample roadmap</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
