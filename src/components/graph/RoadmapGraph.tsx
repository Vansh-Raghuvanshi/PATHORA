'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  NodeProps,
  ConnectionMode,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import CustomMilestoneNode from './CustomMilestoneNode';
import { CareerRoadmap, RoadmapNode } from '@/types/roadmap';
import { computeGraphLayout } from '@/lib/graph-engine';
import {
  Layers,
  Calendar,
  Search,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoadmapGraphProps {
  roadmap: CareerRoadmap;
  selectedNodeId: string | null;
  onSelectNode: (node: RoadmapNode) => void;
  viewMode: 'graph' | 'timeline';
  onToggleViewMode: (mode: 'graph' | 'timeline') => void;
}

// Readable Phase Group Header Node
const PhaseZoneNode = ({ data }: NodeProps) => {
  const d = data as unknown as { title: string; order: number; width: number };
  return (
    <div
      style={{ width: `${d.width}px` }}
      className="pointer-events-none select-none"
    >
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-indigo-200/80">
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
          Phase {d.order}
        </span>
        <span className="text-xs font-bold text-slate-700 truncate">
          {d.title}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  customMilestoneNode: CustomMilestoneNode,
  phaseZoneNode: PhaseZoneNode,
};

// Viewport controller maintaining readable node zoom without excessive downscaling
function RoadmapViewportHelper({
  roadmapId,
  selectedNodeId,
  phaseFilter,
  nodes,
  focusAction,
}: {
  roadmapId: string;
  selectedNodeId: string | null;
  phaseFilter: string;
  nodes: Node[];
  focusAction: { target: 'start' | 'active' | 'all'; time: number } | null;
}) {
  const { fitView, setCenter, getZoom } = useReactFlow();
  const prevRoadmapIdRef = React.useRef(roadmapId);
  const prevPhaseFilterRef = React.useRef(phaseFilter);
  const prevFocusTimeRef = React.useRef<number | null>(null);

  // On initial roadmap generation or roadmap switch: focus start at readable 0.9–1.0 zoom
  useEffect(() => {
    const isNewRoadmap = prevRoadmapIdRef.current !== roadmapId;
    const isNewFilter = prevPhaseFilterRef.current !== phaseFilter;
    prevRoadmapIdRef.current = roadmapId;
    prevPhaseFilterRef.current = phaseFilter;

    if (isNewRoadmap) {
      const timer = setTimeout(() => {
        const phase1Nodes = nodes.filter(
          (n) => n.type === 'customMilestoneNode' && (n.data as { phaseOrder?: number })?.phaseOrder === 1
        );
        if (phase1Nodes.length > 0) {
          fitView({
            nodes: phase1Nodes,
            padding: 0.25,
            minZoom: 0.88,
            maxZoom: 1.0,
            duration: 400,
          });
        } else {
          fitView({
            padding: 0.2,
            minZoom: 0.85,
            maxZoom: 1.0,
            duration: 400,
          });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else if (isNewFilter && phaseFilter !== 'all') {
      const timer = setTimeout(() => {
        const filteredPhaseNodes = nodes.filter(
          (n) => n.type === 'customMilestoneNode' && (n.data as { phaseId?: string })?.phaseId === phaseFilter
        );
        if (filteredPhaseNodes.length > 0) {
          fitView({
            nodes: filteredPhaseNodes,
            padding: 0.25,
            minZoom: 0.88,
            maxZoom: 1.05,
            duration: 400,
          });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [roadmapId, phaseFilter, nodes, fitView]);

  // Handle explicit focus button clicks (Focus Start, Focus Active, Overview)
  useEffect(() => {
    if (!focusAction || focusAction.time === prevFocusTimeRef.current) return;
    prevFocusTimeRef.current = focusAction.time;

    if (focusAction.target === 'start') {
      const startNodes = nodes.filter(
        (n) => n.type === 'customMilestoneNode' && (n.data as { phaseOrder?: number })?.phaseOrder === 1
      );
      if (startNodes.length > 0) {
        fitView({
          nodes: startNodes,
          padding: 0.25,
          minZoom: 0.88,
          maxZoom: 1.0,
          duration: 400,
        });
      }
    } else if (focusAction.target === 'active') {
      const activeNode =
        nodes.find(
          (n) =>
            n.type === 'customMilestoneNode' &&
            (n.data as { status?: string })?.status === 'in_progress'
        ) ||
        nodes.find(
          (n) =>
            n.type === 'customMilestoneNode' &&
            (n.data as { status?: string })?.status === 'available'
        );
      if (activeNode) {
        setCenter(activeNode.position.x + 150, activeNode.position.y + 71, {
          duration: 400,
          zoom: 0.95,
        });
      }
    } else if (focusAction.target === 'all') {
      fitView({
        padding: 0.15,
        minZoom: 0.5,
        maxZoom: 1.0,
        duration: 400,
      });
    }
  }, [focusAction, nodes, fitView, setCenter]);

  // When a node is selected, keep it clearly centered and visible in the viewport
  useEffect(() => {
    if (!selectedNodeId) return;
    const targetNode = nodes.find((n) => n.id === selectedNodeId);
    if (targetNode) {
      const currentZoom = getZoom();
      const targetZoom = Math.max(currentZoom, 0.88);
      setCenter(targetNode.position.x + 150, targetNode.position.y + 71, {
        duration: 350,
        zoom: targetZoom,
      });
    }
  }, [selectedNodeId, nodes, setCenter, getZoom]);

  return null;
}

export default function RoadmapGraph({
  roadmap,
  selectedNodeId,
  onSelectNode,
  viewMode,
  onToggleViewMode,
}: RoadmapGraphProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [focusAction, setFocusAction] = useState<{ target: 'start' | 'active' | 'all'; time: number } | null>(null);

  // Compute upstream prerequisites and downstream dependents for highlighting
  const { upstreamIds, downstreamIds } = useMemo(() => {
    if (!selectedNodeId) return { upstreamIds: new Set<string>(), downstreamIds: new Set<string>() };

    const selected = roadmap.nodes.find((n) => n.id === selectedNodeId);
    const up = new Set<string>(selected ? selected.prerequisites : []);

    const down = new Set<string>();
    roadmap.edges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        down.add(edge.target);
      }
    });

    return { upstreamIds: up, downstreamIds: down };
  }, [selectedNodeId, roadmap]);

  // Generate DAG nodes, phase labels, and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const { flowNodes, flowEdges, phaseZones } = computeGraphLayout(roadmap);

    // Filter nodes by phase, status, and search query
    const filteredMilestoneNodes = flowNodes
      .filter((n) => {
        if (phaseFilter !== 'all' && n.data.phaseId !== phaseFilter) return false;
        if (statusFilter !== 'all' && n.data.status !== statusFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            n.data.title.toLowerCase().includes(q) ||
            n.data.skills.some((s) => s.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === selectedNodeId,
          isUpstream: upstreamIds.has(n.id),
          isDownstream: downstreamIds.has(n.id),
        },
      }));

    const visibleNodeIds = new Set(filteredMilestoneNodes.map((n) => n.id));

    // Phase header nodes for distinct visual grouping
    const phaseHeaderNodes: Node[] = (phaseZones || [])
      .filter((zone) => phaseFilter === 'all' || phaseFilter === zone.id)
      .map((zone) => ({
        id: `phase-zone-${zone.id}`,
        type: 'phaseZoneNode',
        position: { x: zone.x + 10, y: 30 },
        selectable: false,
        draggable: false,
        zIndex: -1,
        data: {
          title: zone.title,
          order: zone.order,
          width: zone.width,
        },
      }));

    const allNodes: Node[] = [...phaseHeaderNodes, ...filteredMilestoneNodes];

    // Filter and style edges: thin subtle indigo by default, highlighted on selection
    const filteredEdges = flowEdges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => {
        const isConnectedToSelected = Boolean(
          selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId)
        );

        return {
          ...e,
          type: 'smoothstep',
          pathOptions: { borderRadius: 16 },
          animated: isConnectedToSelected,
          style: {
            stroke: isConnectedToSelected
              ? '#4f46e5'
              : selectedNodeId
              ? '#e2e8f0'
              : '#a5b4fc',
            strokeWidth: isConnectedToSelected ? 2.5 : 1.5,
            opacity: isConnectedToSelected ? 1 : selectedNodeId ? 0.35 : 0.75,
          },
        };
      });

    return { initialNodes: allNodes, initialEdges: filteredEdges };
  }, [roadmap, phaseFilter, statusFilter, searchQuery, selectedNodeId, upstreamIds, downstreamIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state reactively when roadmap or selection updates
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'phaseZoneNode') return;
      const found = roadmap.nodes.find((n) => n.id === node.id);
      if (found) {
        onSelectNode(found);
      }
    },
    [roadmap.nodes, onSelectNode]
  );

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col bg-[#fbfbfa] overflow-hidden select-none">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white border-b border-slate-200 z-10 shadow-xs">
        {/* Left: View Mode Toggle & Phase Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => onToggleViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'graph'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dependency Graph</span>
            </button>
            <button
              onClick={() => onToggleViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Phase Filter Dropdown */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Phases ({roadmap.phases.length})</option>
            {roadmap.phases.map((p) => (
              <option key={p.id} value={p.id}>
                Phase {p.order}: {p.title}
              </option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="available">Ready to Learn</option>
            <option value="blocked">Locked</option>
          </select>

          <div className="h-4 w-px bg-slate-200" />

          {/* Quick Focus Actions for Ergonomic Navigation */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setFocusAction({ target: 'start', time: Date.now() })}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
              title="Focus start of roadmap"
            >
              Focus Start
            </button>
            <button
              onClick={() => setFocusAction({ target: 'active', time: Date.now() })}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              title="Focus active milestone"
            >
              Focus Active
            </button>
          </div>
        </div>

        {/* Right: Search & Legend Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search milestone or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-56 pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showLegend
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Graph Legend"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas OR Timeline View */}
      {viewMode === 'graph' ? (
        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 60, y: 30, zoom: 0.95 }}
            minZoom={0.45}
            maxZoom={1.6}
            fitViewOptions={{ padding: 0.2, minZoom: 0.75, maxZoom: 1.0 }}
          >
            {/* Viewport helper maintains readable node zoom and focuses active/selected areas */}
            <RoadmapViewportHelper
              roadmapId={roadmap.roadmapId}
              selectedNodeId={selectedNodeId}
              phaseFilter={phaseFilter}
              nodes={nodes}
              focusAction={focusAction}
            />

            <Background color="#cbd5e1" gap={24} size={1} />
            <Controls
              position="bottom-left"
              className="!m-3 !bg-white !border !border-slate-200 !shadow-xs !rounded-xl overflow-hidden"
              showInteractive={false}
              fitViewOptions={{ padding: 0.2, minZoom: 0.75, maxZoom: 1.0 }}
            />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => {
                if (n.type === 'phaseZoneNode') return 'transparent';
                const status = (n.data as unknown as RoadmapNode)?.status;
                if (status === 'completed' || status === 'known') return '#10b981';
                if (status === 'in_progress') return '#6366f1';
                if (status === 'available') return '#f59e0b';
                return '#cbd5e1';
              }}
              className="!w-[130px] !h-[80px] !m-3 !bg-white/95 !border !border-slate-200 !rounded-xl !shadow-xs"
              zoomable
              pannable
            />

            {/* Quick Helper Floating Badge */}
            <Panel position="bottom-center" className="mb-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xs text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Left-to-right DAG • Click milestone to inspect details</span>
              </div>
            </Panel>
          </ReactFlow>

          {/* Collapsible Graph Legend */}
          {showLegend && (
            <div className="absolute top-4 right-4 z-20 w-64 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md p-3 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Status Legend</span>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">Completed / Mastered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-700">In Progress (Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700">Ready to Learn (Prereqs met)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-slate-700">Locked (Prerequisites pending)</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-normal">
                Thin lines indicate directed prerequisite dependencies. Selected milestones highlight their complete upstream & downstream path.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Timeline View Mode (Organized by phase, weeks, and milestones) */
        <div className="flex-1 w-full h-full overflow-y-auto p-6 bg-[#fbfbfa]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Structured Phase Timeline</h3>
                <p className="text-xs text-slate-500">
                  Sequential projection adapted to your {roadmap.personalization.hoursPerWeek} hrs/week pacing
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-indigo-600">
                  {roadmap.summary.estimatedDurationWeeks} Total Weeks
                </span>
                <p className="text-[11px] text-slate-400">Target: {roadmap.summary.projectedCompletionDate}</p>
              </div>
            </div>

            {roadmap.phases.map((phase) => {
              const phaseNodes = roadmap.nodes.filter((n) => n.phaseId === phase.id);
              const completedInPhase = phaseNodes.filter(
                (n) => n.status === 'completed' || n.status === 'known'
              ).length;
              const percent =
                phaseNodes.length > 0 ? Math.round((completedInPhase / phaseNodes.length) * 100) : 0;

              return (
                <div
                  key={phase.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Phase {phase.order}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{phase.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{phase.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800">{phase.estimatedHours}h</span>
                      <span className="text-[11px] text-slate-400 block">~{phase.estimatedWeeks} wks</span>
                    </div>
                  </div>

                  {/* Progress Bar for Phase */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Milestones Grid in Phase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {phaseNodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => onSelectNode(node)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          node.id === selectedNodeId
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                            : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {node.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium shrink-0">
                            ~{node.estimatedHours}h
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="capitalize">{node.status.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className="capitalize">{node.type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
