'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { InterviewQuestionItem, CareerRoadmap } from '@/types/roadmap';
import {
  getActiveRoadmap,
  getSavedQuestions,
  saveInterviewQuestion,
  toggleQuestionMastered,
} from '@/lib/roadmap-storage';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Award,
  AlertTriangle,
  Flame,
  Filter,
} from 'lucide-react';

export default function InterviewPrepPage() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technical' | 'scenario' | 'behavioral' | 'project_defense'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const r = getActiveRoadmap();
    setRoadmap(r);

    // Initial realistic questions based on active roadmap
    const defaultQuestions: InterviewQuestionItem[] = [
      {
        id: 'q-1',
        question: `How does Python memory management (GIL, reference counting, garbage collection) impact multi-threaded ML data preprocessing pipelines?`,
        category: 'technical',
        difficulty: 'intermediate',
        targetRole: r?.target.role || 'AI Engineer',
        relatedSkills: ['Python', 'Multithreading', 'Memory Management'],
        interviewerEvaluationPoints: [
          'Understands difference between CPU-bound and I/O-bound operations',
          'Knows that multiprocessing or C-extension (NumPy) bypasses the GIL',
          'Can prevent memory leaks in long-running training loops',
        ],
        modelAnswerFramework: `State clearly that CPython utilizes reference counting supplemented by cyclic GC. Emphasize that CPU-bound tasks cannot achieve true multi-core concurrency in pure Python threads due to the GIL; the correct production mitigation is utilizing multiprocessing, asyncio for I/O, or native libraries (NumPy, PyTorch) that release the GIL during execution.`,
        commonWeakAnswers: [
          'Saying "Python has no garbage collector, it handles everything automatically"',
          'Confusing multithreading with multiprocessing in CPU-heavy contexts',
        ],
        followUpQuestions: [
          'How does PyTorch DataLoader manage multi-process worker memory without duplicating data in RAM?',
        ],
      },
      {
        id: 'q-2',
        question: `Design an end-to-end RAG architecture with sub-200ms p95 latency for 50,000 corporate policy documents with citations.`,
        category: 'scenario',
        difficulty: 'advanced',
        targetRole: r?.target.role || 'AI Engineer',
        relatedSkills: ['System Design', 'RAG', 'Vector DB', 'FastAPI'],
        interviewerEvaluationPoints: [
          'Mentions hybrid retrieval (sparse BM25 + dense vector embeddings)',
          'Addresses chunking strategies and caching layer (Redis)',
          'Implements cross-encoder reranking without latency degradation',
        ],
        modelAnswerFramework: `Outline the 4 stages: Ingestion (semantic chunking with metadata), Indexing (Qdrant with HNSW index), Retrieval (hybrid search with reciprocal rank fusion), and Generation (streaming response with guardrail citation check). Highlight that caching top query embeddings in Redis saves 70% of vector search overhead.`,
        commonWeakAnswers: [
          'Recommending stuffing all 50k documents into a giant context window',
          'Ignoring chunking boundaries and retrieval recall metrics',
        ],
        followUpQuestions: [
          'How do you handle document updates without re-indexing the entire corpus?',
        ],
      },
      {
        id: 'q-3',
        question: `Tell me about a time when a model or system you engineered collapsed in validation or production. How did you diagnose the root cause?`,
        category: 'behavioral',
        difficulty: 'intermediate',
        targetRole: r?.target.role || 'AI Engineer',
        relatedSkills: ['Debugging', 'STAR Method', 'Incident Response'],
        interviewerEvaluationPoints: [
          'Demonstrates intellectual honesty and ownership rather than blaming tools',
          'Methodical telemetry debugging (monitoring data distributions, drift)',
          'Permanent systemic fix (automated regression testing)',
        ],
        modelAnswerFramework: `Use STAR format: Situation (model accuracy dropped from 94% to 61% in staging), Task (identify why without rolling back blindly), Action (ran Kolmogorov-Smirnov drift test on incoming feature distribution and found null values imputed incorrectly by an upstream API change), Result (added schema assertion layer, restored 93% accuracy, added drift alerts).`,
        commonWeakAnswers: [
          'Claiming you never had a model failure',
          'Blaming teammate or client data without explaining personal debugging efforts',
        ],
        followUpQuestions: [
          'What automated alert did you set up so this never happens silently again?',
        ],
      },
      {
        id: 'q-4',
        question: `Walk me through your Capstone repository. Why did you choose FastAPI over Flask or Django for serving predictions?`,
        category: 'project_defense',
        difficulty: 'beginner',
        targetRole: r?.target.role || 'AI Engineer',
        relatedSkills: ['FastAPI', 'Pydantic', 'Architecture Defense'],
        interviewerEvaluationPoints: [
          'Understands async event loop and native Pydantic v2 validation',
          'Automatic OpenAPI / Swagger documentation generation',
          'Benchmarked latency performance comparison',
        ],
        modelAnswerFramework: `FastAPI provides native asynchronous route handlers, Pydantic type validation with automatic HTTP 422 error parsing, and dependency injection for model lifespan managers, achieving up to 3x higher throughput compared to Flask under concurrent I/O load.`,
        commonWeakAnswers: [
          'Saying "Because FastAPI is newer and everybody uses it now"',
        ],
        followUpQuestions: [
          'How did you avoid blocking the FastAPI event loop during heavy CPU matrix operations?',
        ],
      },
    ];

    setQuestions(defaultQuestions);
  }, []);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/milestone-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interview_questions',
          milestoneTitle: roadmap?.nodes[0]?.title || 'Core Foundations',
          targetRole: roadmap?.target.role || 'AI Engineer',
          skills: roadmap?.nodes.flatMap((n) => n.skills).slice(0, 5) || [],
          difficulty: difficultyFilter === 'all' ? 'intermediate' : difficultyFilter,
        }),
      });
      const data = await res.json();
      if (data.success && data.data.questions) {
        const newItems: InterviewQuestionItem[] = data.data.questions.map((q: unknown, idx: number) => {
          const item = q as { question: string; framework: string; redFlags: string };
          return {
            id: `gen-q-${Date.now()}-${idx}`,
            question: item.question,
            category: 'technical' as const,
            difficulty: 'intermediate' as const,
            targetRole: roadmap?.target.role || 'AI Engineer',
            relatedSkills: ['Architecture', 'Technical Defense'],
            interviewerEvaluationPoints: ['Problem formulation', 'Communication clarity'],
            modelAnswerFramework: item.framework,
            commonWeakAnswers: [item.redFlags],
            followUpQuestions: ['Can you provide a concrete numerical example of this trade-off?'],
          };
        });
        setQuestions([...newItems, ...questions]);
      }
    } catch (e) {
      console.error('Failed to generate interview questions:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const toggleMastered = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, mastered: !q.mastered } : q))
    );
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Technical Defense Arena
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {roadmap?.target.role || 'Technical'} Interview Preparation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Curated question frameworks, interviewer evaluation criteria, and model answer playbooks tailored for hiring bars at {roadmap?.target.companyType || 'top product firms'}.
            </p>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating Prompts...' : 'Generate AI Interview Set'}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'technical', label: 'Technical Core' },
              { id: 'scenario', label: 'System Design / Scenario' },
              { id: 'behavioral', label: 'STAR Behavioral' },
              { id: 'project_defense', label: 'Project Defense' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as unknown as typeof categoryFilter)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as unknown as typeof difficultyFilter)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-4">
          {filteredQuestions.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all hover:border-slate-300"
              >
                {/* Header Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 capitalize">
                        {item.difficulty}
                      </span>
                      {item.mastered && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" /> Mastered
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(item.id);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        item.mastered
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={item.mastered ? 'Unmark mastered' : 'Mark mastered'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40 text-xs animate-in fade-in duration-150">
                    {/* What Interviewers Evaluate */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                      <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                        What Interviewers Look For
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {item.interviewerEvaluationPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Model Answer Framework */}
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                      <span className="font-bold text-indigo-900 block text-xs uppercase tracking-wider">
                        Model Answer Architecture
                      </span>
                      <p className="text-indigo-950 leading-relaxed font-medium">
                        {item.modelAnswerFramework}
                      </p>
                    </div>

                    {/* Common Weak Answers / Red Flags */}
                    <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200/60 space-y-1.5">
                      <span className="font-bold text-rose-900 block text-xs uppercase tracking-wider">
                        Common Weak Answers & Red Flags
                      </span>
                      <ul className="space-y-1 text-rose-950">
                        {item.commonWeakAnswers.map((weak, wIdx) => (
                          <li key={wIdx} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Follow-up Questions */}
                    {item.followUpQuestions && item.followUpQuestions.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                          Likely Follow-Up Probes
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {item.followUpQuestions.map((f, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <span className="font-bold text-indigo-600">→</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

