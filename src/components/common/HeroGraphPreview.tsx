'use client';

import React from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import {
  Compass,
  BookOpen,
  Code2,
  FolderGit2,
  MessagesSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const HeroNode = ({ data }: NodeProps) => {
  const d = data as { label: string; type: string; status: string; effort: string; icon: string };

  const getIcon = () => {
    switch (d.icon) {
      case 'compass':
        return <Compass className="w-3.5 h-3.5 text-indigo-600" />;
      case 'book':
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'folder':
        return <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'chat':
        return <MessagesSquare className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const isDone = d.status === 'completed';
  const isActive = d.status === 'in_progress';

  return (
    <div
      className={`px-3 py-2.5 rounded-xl border bg-white shadow-xs min-w-[190px] transition-all ${
        isDone
          ? 'border-emerald-300 bg-emerald-50/20'
          : isActive
          ? 'border-indigo-400 ring-2 ring-indigo-50'
          : 'border-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-600 !w-2 !h-2" />
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {getIcon()}
          <span>{d.type}</span>
        </div>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
            isDone
              ? 'bg-emerald-100 text-emerald-700'
              : isActive
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {d.status}
        </span>
      </div>
      <h4 className="text-xs font-bold text-slate-900 truncate">{d.label}</h4>
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
        <span>Effort: {d.effort}</span>
        <span className="text-indigo-600 font-semibold">Inspect →</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-600 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = { heroNode: HeroNode };

export default function HeroGraphPreview() {
  const nodes = [
    {
      id: 'h-1',
      type: 'heroNode',
      position: { x: 20, y: 70 },
      data: { label: 'Python for AI & PyTorch', type: 'Foundation', status: 'completed', effort: '15h', icon: 'book' },
    },
    {
      id: 'h-2',
      type: 'heroNode',
      position: { x: 250, y: 20 },
      data: { label: 'Tabular ML & Scikit-Learn', type: 'Core Skill', status: 'completed', effort: '25h', icon: 'code' },
    },
    {
      id: 'h-3',
      type: 'heroNode',
      position: { x: 250, y: 130 },
      data: { label: 'RAG & Vector DB Pipeline', type: 'Portfolio Project', status: 'in_progress', effort: '35h', icon: 'folder' },
    },
    {
      id: 'h-4',
      type: 'heroNode',
      position: { x: 480, y: 30 },
      data: { label: 'FastAPI Model Inference', type: 'Deployment', status: 'available', effort: '20h', icon: 'code' },
    },
    {
      id: 'h-5',
      type: 'heroNode',
      position: { x: 480, y: 140 },
      data: { label: 'Technical Interview Defense', type: 'Interview Prep', status: 'blocked', effort: '20h', icon: 'chat' },
    },
    {
      id: 'h-6',
      type: 'heroNode',
      position: { x: 710, y: 80 },
      data: { label: 'Target: AI Engineer in India', type: 'Destination', status: 'target', effort: '240h Total', icon: 'compass' },
    },
  ];

  const edges = [
    { id: 'he-1', source: 'h-1', target: 'h-2', animated: false, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'he-2', source: 'h-1', target: 'h-3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { id: 'he-3', source: 'h-2', target: 'h-4', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2 } },
    { id: 'he-4', source: 'h-3', target: 'h-4', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2 } },
    { id: 'he-5', source: 'h-4', target: 'h-5', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
    { id: 'he-6', source: 'h-5', target: 'h-6', animated: false, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ];

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Interactive Graph Preview</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        zoomOnScroll={false}
        panOnDrag={true}
        preventScrolling={true}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
      </ReactFlow>

      <div className="absolute bottom-3 right-3 z-10">
        <Link
          href="/roadmap"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition-colors"
        >
          <span>Explore Full Graph Canvas</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

