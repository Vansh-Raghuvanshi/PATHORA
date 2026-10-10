'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code2,
  Brain,
  Server,
  FolderGit2,
  Cpu,
  Rocket,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface PreviewNode {
  id: string;
  title: string;
  category: string;
  hours: number;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  description: string;
  deliverable: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}

interface PreviewEdge {
  id: string;
  source: string;
  target: string;
  d: string;
  delay: number;
}

const PREVIEW_NODES: PreviewNode[] = [
  {
    id: 'node-1',
    title: 'Python Foundations',
    category: 'Foundations',
    hours: 20,
    status: 'completed',
    description: 'Modern Python 3.12, strict type hints, AsyncIO concurrency, and professional Git workflows.',
    deliverable: 'Modular async utility with automated Pytest suite.',
    x: 210,
    y: 20,
    icon: Code2,
    delay: 0.1,
  },
  {
    id: 'node-2',
    title: 'AI Fundamentals',
    category: 'Core AI',
    hours: 25,
    status: 'completed',
    description: 'Tokenization, embeddings, vector latent spaces, temperature, and top-p sampling intuition.',
    deliverable: 'Empirical logprob distribution plots & cosine similarity engine.',
    x: 105,
    y: 118,
    icon: Brain,
    delay: 0.3,
  },
  {
    id: 'node-3',
    title: 'Backend APIs',
    category: 'Systems Track',
    hours: 25,
    status: 'in_progress',
    description: 'High-concurrency FastAPI microservices with Server-Sent Events (SSE) token streaming.',
    deliverable: 'Async token streaming backend with client backpressure handling.',
    x: 315,
    y: 118,
    icon: Server,
    delay: 0.45,
  },
  {
    id: 'node-4',
    title: 'Build an AI Project',
    category: 'Portfolio Project',
    hours: 35,
    status: 'available',
    description: 'Production Hybrid RAG pipeline combining dense vector embeddings and BM25 with Qdrant.',
    deliverable: 'Multi-document knowledge search engine with source passage citations.',
    x: 105,
    y: 226,
    icon: FolderGit2,
    delay: 0.6,
  },
  {
    id: 'node-5',
    title: 'AI Integration',
    category: 'Systems Track',
    hours: 20,
    status: 'available',
    description: 'Frontier LLM tool calling, strict schema enforcement, and self-healing Pydantic retries.',
    deliverable: 'Robust structured JSON extraction service with automated retries.',
    x: 315,
    y: 226,
    icon: Cpu,
    delay: 0.75,
  },
  {
    id: 'node-6',
    title: 'Deploy an AI Application',
    category: 'Deployment',
    hours: 30,
    status: 'locked',
    description: 'Docker multi-stage containerization, Redis semantic caching, Langfuse telemetry, and cloud deploy.',
    deliverable: 'Publicly accessible AI Copilot web service with CI/CD and monitoring.',
    x: 210,
    y: 334,
    icon: Rocket,
    delay: 0.9,
  },
];

const PREVIEW_EDGES: PreviewEdge[] = [
  // Python -> AI Fundamentals (left branch)
  {
    id: 'e-1-2',
    source: 'node-1',
    target: 'node-2',
    d: 'M 210 72 C 210 95, 105 95, 105 118',
    delay: 0.25,
  },
  // Python -> Backend APIs (right branch)
  {
    id: 'e-1-3',
    source: 'node-1',
    target: 'node-3',
    d: 'M 210 72 C 210 95, 315 95, 315 118',
    delay: 0.35,
  },
  // AI Fundamentals -> Build an AI Project
  {
    id: 'e-2-4',
    source: 'node-2',
    target: 'node-4',
    d: 'M 105 170 L 105 226',
    delay: 0.5,
  },
  // Backend APIs -> AI Integration
  {
    id: 'e-3-5',
    source: 'node-3',
    target: 'node-5',
    d: 'M 315 170 L 315 226',
    delay: 0.65,
  },
  // Build an AI Project -> Deploy an AI Application (left converge)
  {
    id: 'e-4-6',
    source: 'node-4',
    target: 'node-6',
    d: 'M 105 278 C 105 306, 210 306, 210 334',
    delay: 0.8,
  },
  // AI Integration -> Deploy an AI Application (right converge)
  {
    id: 'e-5-6',
    source: 'node-5',
    target: 'node-6',
    d: 'M 315 278 C 315 306, 210 306, 210 334',
    delay: 0.85,
  },
];

export default function LiveRoadmapPreview() {
  const [mounted, setMounted] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedNode = PREVIEW_NODES.find((n) => n.id === selectedNodeId);

  // Check if an edge connects to the hovered node
  const isEdgeHighlighted = (edge: PreviewEdge) => {
    if (!hoveredNodeId && !selectedNodeId) return false;
    const targetId = hoveredNodeId || selectedNodeId;
    return edge.source === targetId || edge.target === targetId;
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden text-left select-none">
      {/* Top Meta Bar */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
          <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
            Interactive preview
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          Illustrative dependency graph • Click milestone to inspect
        </span>
      </div>

      {/* Graph Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[420px] bg-[#fafaf9] overflow-hidden p-2">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* SVG Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 420 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="preview-arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="preview-arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4f46e5" />
            </marker>
          </defs>

          {PREVIEW_EDGES.map((edge) => {
            const isHigh = isEdgeHighlighted(edge);
            return (
              <g key={edge.id}>
                {/* Background path for hit testing / glow */}
                <path
                  d={edge.d}
                  fill="none"
                  stroke={isHigh ? '#e0e7ff' : 'transparent'}
                  strokeWidth={isHigh ? 6 : 1}
                  className="transition-all duration-300"
                />
                {/* Visible animated line */}
                <path
                  d={edge.d}
                  fill="none"
                  stroke={isHigh ? '#4f46e5' : '#cbd5e1'}
                  strokeWidth={isHigh ? 2 : 1.5}
                  strokeDasharray={isHigh ? 'none' : '4 3'}
                  markerEnd={isHigh ? 'url(#preview-arrow-active)' : 'url(#preview-arrow-default)'}
                  className={`transition-all duration-300 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${edge.delay * 0.5}s`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML Milestone Nodes */}
        <div className="absolute inset-0 w-full h-full">
          {PREVIEW_NODES.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;

            // Status Badge Formatting
            const getStatusBadge = () => {
              switch (node.status) {
                case 'completed':
                  return {
                    label: 'Mastered',
                    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    dot: 'bg-emerald-500',
                  };
                case 'in_progress':
                  return {
                    label: 'In Progress',
                    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    dot: 'bg-indigo-500',
                  };
                case 'available':
                  return {
                    label: 'Unlocked',
                    cls: 'bg-amber-50 text-amber-700 border-amber-200',
                    dot: 'bg-amber-500',
                  };
                case 'locked':
                  return {
                    label: 'Prereq Locked',
                    cls: 'bg-slate-100 text-slate-500 border-slate-200',
                    dot: 'bg-slate-400',
                  };
              }
            };

            const badge = getStatusBadge();

            // Node width 170px, centered on node.x
            const leftPct = (node.x / 420) * 100;
            const topPct = (node.y / 400) * 100;

            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-0"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                }}
              >
                {/* Node Box */}
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`group relative text-left w-[155px] sm:w-[170px] p-2 sm:p-2.5 rounded-xl border bg-white transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md scale-[1.03] z-30'
                      : isHovered
                      ? 'border-indigo-400 shadow-md scale-[1.02] z-20'
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300 z-10'
                  } ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{
                    transitionProperty: 'transform, border-color, box-shadow, opacity',
                    transitionDuration: '300ms',
                    transitionDelay: mounted ? '0ms' : `${node.delay}s`,
                  }}
                >
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[85px]">
                      {node.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${badge.cls}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isSelected || isHovered
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {node.title}
                    </h4>
                  </div>

                  {/* Effort */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-100 font-medium">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      <span>~{node.hours}h</span>
                    </span>
                    <span className="text-indigo-600 font-semibold text-[9.5px] group-hover:underline">
                      Inspect
                    </span>
                  </div>

                  {/* Hover Floating Tooltip */}
                  {isHovered && !selectedNodeId && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-40 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-medium shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <span>
                        {node.title} • ~{node.hours} Hours
                      </span>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Brief Inspector Drawer */}
      {selectedNode ? (
        <div className="p-3.5 bg-white border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-200 text-xs">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                {React.createElement(selectedNode.icon, { className: 'w-3.5 h-3.5' })}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  {selectedNode.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {selectedNode.category} • ~{selectedNode.hours} Hours (approx.)
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500 font-medium truncate">
              <strong className="text-slate-700">Proof:</strong> {selectedNode.deliverable}
            </span>
            <Link
              href="/roadmap"
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 shrink-0 ml-1"
            >
              <span>Full graph</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        /* Default Footer Bar */
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Branching tracks converge into production deployment</span>
          </span>
          <Link
            href="/roadmap"
            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline"
          >
            <span>Explore canvas</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
