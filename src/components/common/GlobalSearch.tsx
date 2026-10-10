'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  Compass,
  Code2,
  HelpCircle,
  BarChart3,
  GitCompare,
  Bookmark,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { getActiveRoadmap } from '@/lib/roadmap-storage';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMilestone?: (milestoneId: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, onSelectMilestone }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const roadmap = getActiveRoadmap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const navigationItems = [
    { title: 'Interactive Roadmap Workspace', href: '/roadmap', icon: Layers, category: 'Navigation' },
    { title: 'Career Roadmap Generator', href: '/generator', icon: Compass, category: 'Navigation' },
    { title: 'My Progress Analytics', href: '/progress', icon: BarChart3, category: 'Navigation' },
    { title: 'Career Role Comparison', href: '/comparison', icon: GitCompare, category: 'Navigation' },
    { title: 'Career Pathways & Stories', href: '/pathways', icon: Sparkles, category: 'Navigation' },
    { title: 'Project Studio', href: '/project-studio', icon: Code2, category: 'Navigation' },
    { title: 'Interview Preparation', href: '/interview-prep', icon: HelpCircle, category: 'Navigation' },
    { title: 'Saved Roadmaps & Library', href: '/saved', icon: Bookmark, category: 'Navigation' },
    { title: 'Preferences & AI Settings', href: '/settings', icon: Sliders, category: 'Navigation' },
  ];

  const filteredNav = navigationItems.filter((i) => i.title.toLowerCase().includes(q));

  const filteredMilestones = (roadmap?.nodes || []).filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.skills.some((s) => s.toLowerCase().includes(q)) ||
      n.type.toLowerCase().includes(q)
  );

  const handleSelectNav = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSelectNode = (nodeId: string) => {
    router.push(`/roadmap?node=${nodeId}`);
    if (onSelectMilestone) onSelectMilestone(nodeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search milestones, skills, tools, screens..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Milestones in current roadmap */}
          {filteredMilestones.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
                Milestones & Skills ({roadmap?.target?.role || 'Roadmap'})
              </span>
              <div className="space-y-1">
                {filteredMilestones.slice(0, 6).map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(node.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 block">
                        {node.title}
                      </span>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {node.type} • {node.estimatedHours}h • {node.difficulty}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {node.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Screens / Pages */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              Platform Features
            </span>
            <div className="space-y-1">
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectNav(item.href)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left text-slate-700 hover:text-slate-900 group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    <span className="font-medium text-xs">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400">
          <span>Navigate with mouse or Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}

