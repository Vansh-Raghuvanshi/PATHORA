'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  BookOpen,
  Code2,
  FolderGit2,
  MessagesSquare,
  CheckCircle2,
  Lock,
  Clock,
  Compass,
} from 'lucide-react';
import { RoadmapNode } from '@/types/roadmap';

interface MilestoneNodeData extends RoadmapNode {
  phaseTitle: string;
  phaseOrder: number;
  isSelected?: boolean;
  isUpstream?: boolean;
  isDownstream?: boolean;
}

const CustomMilestoneNode = ({ data, selected }: NodeProps) => {
  const node = data as unknown as MilestoneNodeData;

  // Distinguish milestone type with icon, color accent, and label
  const getTypeConfig = () => {
    switch (node.type) {
      case 'project':
        return {
          icon: <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />,
          accentBorder: 'border-l-[5px] border-l-emerald-500',
          badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Project',
        };
      case 'interview':
        return {
          icon: <MessagesSquare className="w-3.5 h-3.5 text-purple-600" />,
          accentBorder: 'border-l-[5px] border-l-purple-500',
          badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Interview Defense',
        };
      case 'foundation':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" />,
          accentBorder: 'border-l-[5px] border-l-blue-500',
          badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Foundation',
        };
      case 'target':
        return {
          icon: <Compass className="w-3.5 h-3.5 text-indigo-600" />,
          accentBorder: 'border-l-[5px] border-l-indigo-600',
          badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Target Goal',
        };
      case 'technical':
      default:
        return {
          icon: <Code2 className="w-3.5 h-3.5 text-indigo-600" />,
          accentBorder: 'border-l-[5px] border-l-indigo-500',
          badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Technical Skill',
        };
    }
  };

  const getStatusBadge = () => {
    switch (node.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
          </span>
        );
      case 'known':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Known
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-600" /> Active
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Ready
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Lock className="w-3 h-3 text-slate-400" /> Locked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
            Upcoming
          </span>
        );
    }
  };

  const typeConfig = getTypeConfig();
  const isHighlighted = selected || node.isSelected;
  const isUpstream = node.isUpstream;
  const isDownstream = node.isDownstream;

  let stateClasses = 'border-slate-200 hover:border-slate-300 bg-white shadow-xs hover:shadow-md';

  if (isHighlighted) {
    stateClasses = 'border-indigo-600 ring-2 ring-indigo-500/30 bg-white shadow-lg scale-[1.02] z-30';
  } else if (isUpstream) {
    stateClasses = 'border-blue-400 ring-1 ring-blue-300 bg-blue-50/20 z-20';
  } else if (isDownstream) {
    stateClasses = 'border-indigo-400 ring-1 ring-indigo-300 bg-indigo-50/20 z-20';
  } else if (node.status === 'blocked') {
    stateClasses = 'border-slate-200/80 bg-slate-50/70 opacity-80';
  }

  return (
    <div
      className={`relative w-[300px] h-[142px] rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${typeConfig.accentBorder} ${stateClasses}`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white hover:!scale-125 !transition-transform"
      />

      {/* Top Section */}
      <div>
        {/* Top Row: Type Tag & Status Badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-slate-100/90">{typeConfig.icon}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border truncate max-w-[135px] ${typeConfig.badgeCls}`}
            >
              {typeConfig.label}
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Title (14-16px, readable) */}
        <h4 className="text-[14.5px] font-bold text-slate-900 leading-snug line-clamp-1 truncate hover:text-indigo-600 transition-colors">
          {node.title}
        </h4>

        {/* Description Snippet (12-13px, 2 lines) */}
        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
          {node.description}
        </p>
      </div>

      {/* Footer Row: Estimated Hours & Inspect Trigger */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">~{node.estimatedHours} hrs</span>
          <span className="text-slate-300">•</span>
          <span className="capitalize text-slate-500">{node.difficulty}</span>
        </div>
        <span className="text-indigo-600 font-semibold text-xs hover:underline flex items-center gap-0.5">
          Inspect →
        </span>
      </div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white hover:!scale-125 !transition-transform"
      />
    </div>
  );
};

export default memo(CustomMilestoneNode);
