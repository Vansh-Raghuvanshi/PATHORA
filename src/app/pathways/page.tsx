'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function PathwaysPage() {
  const [activeTrack, setActiveTrack] = useState<string>('traditional');

  const pathways = [
    {
      id: 'traditional',
      title: 'CS Undergraduate to High-Growth Product Engineer',
      tagline: 'The classic structured trajectory with high emphasis on DSA and internship conversion.',
      archetype: 'College Student (B.Tech / BS in Computer Science)',
      timeline: '12 - 18 Months Total',
      stages: [
        {
          stageNumber: 1,
          role: 'Pre-Final Year CS Student',
          focus: 'DSA Foundations & Mini-Projects',
          skillsGained: ['Python / C++ DSA', 'Git/GitHub', 'DBMS & SQL', 'Web Basics'],
          proofDeliverable: 'Solved 150+ LeetCode problems + 1 interactive full-stack college project.',
          uncertainties: 'High competition in on-campus placement drives (>500 candidates per opening).',
        },
        {
          stageNumber: 2,
          role: 'Summer Software Engineering Intern',
          focus: 'Production Codebases & Team Hygiene',
          skillsGained: ['Code Reviews', 'REST APIs', 'Docker Basics', 'Testing with Pytest'],
          proofDeliverable: 'Merged 15+ production pull requests; built an internal operational tool.',
          uncertainties: 'PPO (Pre-Placement Offer) conversion depends on macroeconomic headcount.',
        },
        {
          stageNumber: 3,
          role: 'Junior / Associate Product Engineer',
          focus: 'End-to-End Ownership & Microservices',
          skillsGained: ['System Design', 'CI/CD Pipelines', 'Kafka/Redis', 'Observability'],
          proofDeliverable: 'Owned an asynchronous webhook microservice handling 10k events/min.',
          uncertainties: 'Navigating promotion cycles and senior engineering mentorship.',
        },
        {
          stageNumber: 4,
          role: 'Specialized AI / Senior Platform Engineer',
          focus: 'Architectural Strategy & Core Infrastructure',
          skillsGained: ['LLM Serving / RAG', 'Distributed Systems', 'Cost Optimization'],
          proofDeliverable: 'Multi-million token/day AI pipeline with <120ms latency and 99.9% SLA.',
          uncertainties: 'Keeping up with rapid paradigm shifts in generative AI frameworks.',
        },
      ],
    },
    {
      id: 'non-cs',
      title: 'Non-CS / Self-Taught to Full-Stack Engineer',
      tagline: 'Bypassing academic credentials by manufacturing undeniable open-source proof of skill.',
      archetype: 'Self-Taught Developer or Non-Technical Degree Graduate',
      timeline: '9 - 14 Months Total',
      stages: [
        {
          stageNumber: 1,
          role: 'Self-Taught Apprentice',
          focus: 'Modern Web & Deep Project Building',
          skillsGained: ['TypeScript', 'React 19', 'Next.js App Router', 'Tailwind CSS'],
          proofDeliverable: 'Two production-grade SaaS clones deployed on Vercel with real auth & Stripe.',
          uncertainties: 'Resume screening algorithms filtering out non-CS degree keywords.',
        },
        {
          stageNumber: 2,
          role: 'Contractor / Open-Source Contributor',
          focus: 'Demonstrable Public Impact & Networking',
          skillsGained: ['Git Rebase', 'Issue Triage', 'Component A11y', 'State Optimization'],
          proofDeliverable: '3 accepted PRs to prominent open-source UI libraries; active GitHub history.',
          uncertainties: 'Inconsistent contractor revenue before securing full-time employment.',
        },
        {
          stageNumber: 3,
          role: 'Full-Stack Software Engineer',
          focus: 'Full Lifecycle Product Delivery',
          skillsGained: ['PostgreSQL Indexing', 'Node.js Performance', 'Docker Containers'],
          proofDeliverable: 'Shipped customer-facing features at a venture-backed startup.',
          uncertainties: 'System design interviews probing low-level OS/memory questions.',
        },
      ],
    },
    {
      id: 'career-switcher',
      title: 'Data Analyst to Machine Learning / AI Engineer',
      tagline: 'Leveraging domain business context to bridge the engineering gap into production ML.',
      archetype: 'Current Business Analyst, QA, or Technical Consultant',
      timeline: '8 - 12 Months Part-Time (10h/wk)',
      stages: [
        {
          stageNumber: 1,
          role: 'Senior Data / BI Analyst',
          focus: 'Upgrading Scripting to Software Engineering',
          skillsGained: ['Advanced Python', 'NumPy & Pandas', 'OOP Design', 'Packaging'],
          proofDeliverable: 'Automated legacy SQL reporting pipelines into tested Python packages.',
          uncertainties: 'Carving out 10-12 hours per week amidst existing full-time employment.',
        },
        {
          stageNumber: 2,
          role: 'Applied ML Practitioner',
          focus: 'Classical ML, PyTorch & Vector Systems',
          skillsGained: ['Scikit-Learn', 'PyTorch', 'Vector Databases', 'RAG Pipelines'],
          proofDeliverable: 'Internal prototype semantic search tool for enterprise company docs.',
          uncertainties: 'Persuading leadership to allow internal lateral transfers.',
        },
        {
          stageNumber: 3,
          role: 'Production AI Engineer',
          focus: 'MLOps, Deployment & Low Latency',
          skillsGained: ['FastAPI', 'Docker', 'GPU Serving', 'Model Evaluation & Drift'],
          proofDeliverable: 'Containerized RAG inference service handling real internal queries.',
          uncertainties: 'Competing with specialized graduate degree holders in external interviews.',
        },
      ],
    },
  ];

  const currentPathway = pathways.find((p) => p.id === activeTrack) || pathways[0];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Synthesized Progression Trajectories
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Progression Pathways
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Illustrative technical advancement patterns synthesized from industry hiring standards. Understand how candidates transition across career stages through verifiable proof of skill.
          </p>
        </div>

        {/* Notice of Transparency */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Ethical Labeling:</strong> These pathways are synthesized illustrative patterns of career progression, not verified individual biographies or guaranteed timelines.
          </p>
        </div>

        {/* Track Switcher */}
        <div className="flex flex-wrap gap-2 justify-center">
          {pathways.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTrack(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTrack === p.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Active Pathway Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="text-lg font-bold text-slate-900">{currentPathway.title}</h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                {currentPathway.timeline}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{currentPathway.tagline}</p>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Starting Archetype: {currentPathway.archetype}
            </span>
          </div>

          {/* Connected Stages Diagram */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 sm:before:left-6 before:w-0.5 before:bg-slate-200 before:z-0">
            {currentPathway.stages.map((stg) => (
              <div key={stg.stageNumber} className="relative z-10 flex items-start gap-4 sm:gap-6">
                {/* Stage Number Circle */}
                <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs ring-4 ring-white">
                  {stg.stageNumber}
                </div>

                {/* Stage Content Card */}
                <div className="flex-1 bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{stg.role}</h3>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Focus: {stg.focus}
                    </span>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Key Competencies Gained
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {stg.skillsGained.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Proof of Skill Deliverable */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                    <span className="font-bold text-emerald-800 block text-[11px] mb-0.5">
                      Proof of Competence (Deliverable):
                    </span>
                    <span className="text-emerald-950 font-medium">{stg.proofDeliverable}</span>
                  </div>

                  {/* Real-World Uncertainties */}
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-xs">
                    <span className="font-bold text-amber-800 block text-[11px] mb-0.5">
                      Real-World Hurdles & Uncertainties:
                    </span>
                    <span className="text-amber-900">{stg.uncertainties}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

