'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  getUserPreferences,
  saveUserPreferences,
  getAIConfig,
  saveAIConfig,
  resetToDemoRoadmap,
  UserPreferences,
  AIConfig,
} from '@/lib/roadmap-storage';
import {
  Sliders,
  Sparkles,
  Key,
  Shield,
  RotateCcw,
  Check,
  Globe,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [aiConfig, setAIConfig] = useState<AIConfig>(getAIConfig());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setPreferences(getUserPreferences());
    setAIConfig(getAIConfig());
  }, []);

  const handleSaveAll = () => {
    saveUserPreferences(preferences);
    saveAIConfig(aiConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetDemoState = () => {
    resetToDemoRoadmap();
    alert('Active career roadmap successfully reset to canonical demonstration state.');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              System Configuration
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Personalization & Engine Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure default learning pacing, resource cost filters, and AI provider credentials.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
            <span>{savedNotice ? 'Preferences Saved' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Default Study Pacing & Pedagogy</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Default Weekly Study Hours: {preferences.hoursPerWeek}h/wk
              </label>
              <input
                type="range"
                min="4"
                max="40"
                step="1"
                value={preferences.hoursPerWeek}
                onChange={(e) =>
                  setPreferences({ ...preferences, hoursPerWeek: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Pedagogical Learning Style
              </label>
              <select
                value={preferences.learningStyle}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    learningStyle: e.target.value as unknown as typeof preferences.learningStyle,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium"
              >
                <option value="project-first">Project-First (Build hands-on systems)</option>
                <option value="theory-then-build">Theory First (Read fundamentals then build)</option>
                <option value="interactive-docs">Interactive Documentation</option>
                <option value="visual-video">Visual / Video Driven</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Free Resources Only Filter
                </span>
                <span className="text-[10px] text-slate-500">
                  Exclude paid certifications, bootcamps, and paywalled courses
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.freeResourcesOnly}
              onChange={(e) =>
                setPreferences({ ...preferences, freeResourcesOnly: e.target.checked })
              }
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* AI Engine & API Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Provider & Live Intelligence Configuration</span>
          </h2>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
            PATHORA features an integrated dynamic generation engine that creates fully personalized roadmaps out-of-the-box in demo mode without requiring external API credentials. You can optionally connect your own Gemini or OpenAI API key.
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Active Generation Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAIConfig({ ...aiConfig, provider: 'demo' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aiConfig.provider === 'demo'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">Transparent Demo Mode</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    High-speed dynamic synthesis without external API costs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAIConfig({ ...aiConfig, provider: 'gemini' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aiConfig.provider === 'gemini'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">Custom LLM Provider</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Bring your own Gemini or OpenAI API key
                  </span>
                </button>
              </div>
            </div>

            {aiConfig.provider === 'gemini' && (
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Custom Server API Key (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="AIzaSy... or sk-..."
                    value={aiConfig.customApiKey || ''}
                    onChange={(e) => setAIConfig({ ...aiConfig, customApiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Keys are held securely and never committed or exposed in public code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reset & Maintenance */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Demonstration State Recovery</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reset all active roadmap progress back to the canonical verified AI Engineer roadmap demonstration for Indian product companies.
          </p>
          <button
            onClick={handleResetDemoState}
            className="px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
          >
            Reset Demo Roadmap to Initial State
          </button>
        </div>
      </div>
    </AppShell>
  );
}

