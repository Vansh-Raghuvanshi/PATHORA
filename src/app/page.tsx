import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import LiveRoadmapPreview from '@/components/common/LiveRoadmapPreview';
import LandingHeroGenerator from '@/components/common/LandingHeroGenerator';

export const metadata = {
  title: 'PATHORA — Your dream job. Reverse-engineered.',
  description:
    'Advanced AI-powered career intelligence platform that reverse-engineers a student hyper-specific dream job into a personalized, visually interactive, adaptive career roadmap.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Minimal Landing Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              P
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">PATHORA</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">CAREER OS</span>
            </div>
          </Link>

          {/* Quick CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/roadmap"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
            >
              Explore a sample roadmap
            </Link>
            <Link
              href="/generator"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Build my roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Left Text + Intake Form, Right Live Roadmap Preview */}
      <section className="pt-8 sm:pt-12 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Headline, Narrative, and Intake Form */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Career Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Your dream career,
                <br />
                <span className="text-indigo-600">reverse-engineered.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                Turn your target role into an adaptive, visually interactive dependency graph
                of skills, portfolio proof, and real-world milestones tailored to your study hours.
              </p>
            </div>

            {/* Instant Generator Intake Card */}
            <div>
              <LandingHeroGenerator />
            </div>
          </div>

          {/* Right Column: Live Interactive Roadmap Preview */}
          <div className="lg:col-span-6 w-full lg:sticky lg:top-24">
            <LiveRoadmapPreview />
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How PATHORA Works
            </h2>
            <p className="text-xs text-slate-500">
              A real reverse-engineered dependency engine with verifiable acceptance criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Define the Destination & Constraints',
                desc: 'Input your target role, industry, weekly study budget, and timeline. PATHORA builds the curriculum backwards.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Interactive Prerequisite Graph',
                desc: 'Explore directed dependency connections. Downstream milestones unlock only when foundational competencies are met.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Adaptive Dynamic Replanning',
                desc: 'Mark skills you already know or adjust your weekly hours. The tree automatically recalculates remaining effort and pace.',
                icon: Sparkles,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5 relative hover:border-indigo-300 transition-all"
                >
                  <span className="text-xl font-black text-indigo-200 block font-mono">
                    {st.step}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 bg-[#fbfbfa] text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">PATHORA</span>
            <span>— Your dream job. Reverse-engineered.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-semibold">
            <Link href="/roadmap" className="hover:text-slate-900">My Roadmap</Link>
            <Link href="/generator" className="hover:text-slate-900">Create New Roadmap</Link>
            <Link href="/saved" className="hover:text-slate-900">Saved Roadmaps</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
