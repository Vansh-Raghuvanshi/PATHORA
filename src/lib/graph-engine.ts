import {
  CareerRoadmap,
  RoadmapNode,
  RoadmapEdge,
  NodeStatus,
  ReplanEvent,
  RoadmapSummary,
} from '../types/roadmap';

/**
 * Automatically computes status for all nodes based on their prerequisites and current completion.
 * - If status is 'completed' or 'known', it remains completed/known.
 * - If all prerequisites are 'completed' or 'known', node becomes 'available' (if it was 'blocked' or 'not_started').
 * - If any prerequisite is not completed/known, node is marked 'blocked'.
 */
export function recomputeNodeStatuses(nodes: RoadmapNode[]): RoadmapNode[] {
  const nodeMap = new Map<string, RoadmapNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, { ...n });
  }

  // Iterate to settle availability
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 15) {
    changed = false;
    iterations++;

    for (const [id, node] of nodeMap.entries()) {
      // Completed, known, or in_progress states are preserved
      if (node.status === 'completed' || node.status === 'known' || node.status === 'in_progress') {
        continue;
      }

      if (node.prerequisites.length === 0) {
        if (node.status === 'blocked' || node.status === 'not_started') {
          node.status = 'available';
          changed = true;
        }
      } else {
        const allPrereqsMet = node.prerequisites.every((prereqId) => {
          const prereq = nodeMap.get(prereqId);
          return prereq && (prereq.status === 'completed' || prereq.status === 'known');
        });

        if (allPrereqsMet) {
          if (node.status === 'blocked' || node.status === 'not_started') {
            node.status = 'available';
            changed = true;
          }
        } else {
          if (node.status !== 'blocked') {
            node.status = 'blocked';
            changed = true;
          }
        }
      }
    }
  }

  return Array.from(nodeMap.values());
}

/**
 * Calculates the longest prerequisite path of remaining effort (critical path)
 * across the DAG, enabling realistic duration projections that take parallel tracks into account.
 */
export function calculateCriticalPathHours(nodes: RoadmapNode[]): number {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const memo = new Map<string, number>();

  function getPath(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0;
    if (memo.has(nodeId)) return memo.get(nodeId)!;

    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const remainingEffort =
      node.status === 'completed' || node.status === 'known'
        ? 0
        : node.status === 'in_progress'
        ? Math.round(node.estimatedHours * 0.6)
        : node.estimatedHours;

    visited.add(nodeId);
    let maxPrereqPath = 0;
    for (const pid of node.prerequisites || []) {
      const p = getPath(pid, visited);
      if (p > maxPrereqPath) maxPrereqPath = p;
    }
    visited.delete(nodeId);

    const total = maxPrereqPath + remainingEffort;
    memo.set(nodeId, total);
    return total;
  }

  let criticalPath = 0;
  for (const n of nodes) {
    const path = getPath(n.id, new Set<string>());
    if (path > criticalPath) criticalPath = path;
  }
  return criticalPath;
}

/**
 * Calculates current progress statistics
 */
export function calculateProgressSummary(
  roadmap: CareerRoadmap
): {
  totalHours: number;
  hoursInvested: number;
  hoursRemaining: number;
  progressPercent: number;
  completedCount: number;
  availableCount: number;
  inProgressCount: number;
  blockedCount: number;
  totalCount: number;
  projectedWeeksRemaining: number;
  projectedCompletionDate: string;
} {
  const nodes = roadmap.nodes;
  let totalHours = 0;
  let hoursInvested = 0;
  let hoursRemaining = 0;
  let completedCount = 0;
  let availableCount = 0;
  let inProgressCount = 0;
  let blockedCount = 0;

  for (const node of nodes) {
    totalHours += node.estimatedHours;
    if (node.status === 'completed' || node.status === 'known') {
      hoursInvested += node.estimatedHours;
      completedCount++;
    } else if (node.status === 'in_progress') {
      // Half credited as invested
      hoursInvested += Math.round(node.estimatedHours * 0.4);
      hoursRemaining += Math.round(node.estimatedHours * 0.6);
      inProgressCount++;
    } else {
      hoursRemaining += node.estimatedHours;
      if (node.status === 'available') availableCount++;
      else if (node.status === 'blocked') blockedCount++;
    }
  }

  const progressPercent = totalHours > 0 ? Math.min(100, Math.round((hoursInvested / totalHours) * 100)) : 0;
  const hoursPerWeek = Math.max(1, roadmap.personalization.hoursPerWeek || 10);
  const volumeWeeks = Math.ceil(hoursRemaining / hoursPerWeek);
  const criticalPathHours = calculateCriticalPathHours(nodes);
  const criticalPathWeeks = Math.ceil(criticalPathHours / hoursPerWeek);
  // Projected duration considers total work volume and critical dependency chains while allowing parallel tracks
  const projectedWeeksRemaining = Math.max(volumeWeeks, criticalPathWeeks);

  // Projected completion date
  const now = new Date();
  const completionDate = new Date(now.getTime() + projectedWeeksRemaining * 7 * 24 * 60 * 60 * 1000);
  const projectedCompletionDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    totalHours,
    hoursInvested,
    hoursRemaining,
    progressPercent,
    completedCount,
    availableCount,
    inProgressCount,
    blockedCount,
    totalCount: nodes.length,
    projectedWeeksRemaining,
    projectedCompletionDate,
  };
}

/**
 * Finds which prerequisites block a given node
 */
export function getBlockingPrerequisites(
  node: RoadmapNode,
  allNodes: RoadmapNode[]
): RoadmapNode[] {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const blockers: RoadmapNode[] = [];

  for (const prereqId of node.prerequisites) {
    const prereq = nodeMap.get(prereqId);
    if (prereq && prereq.status !== 'completed' && prereq.status !== 'known') {
      blockers.push(prereq);
    }
  }

  return blockers;
}

/**
 * FLOW A: Mark a skill as already known
 * Skips effort, updates status to 'known', unlocks downstream milestones,
 * recalculates remaining effort & timeline, records a replan event.
 */
export function applyMarkSkillAsKnown(
  roadmap: CareerRoadmap,
  nodeId: string,
  assessOnly: boolean = false
): { updatedRoadmap: CareerRoadmap; replanEvent: ReplanEvent } {
  const hoursBefore = roadmap.summary.hoursRemaining ?? roadmap.summary.estimatedTotalHours;
  const weeksBefore = roadmap.summary.estimatedDurationWeeks;

  const targetNode = roadmap.nodes.find((n) => n.id === nodeId);
  if (!targetNode) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const updatedNodes = roadmap.nodes.map((n) => {
    if (n.id === nodeId) {
      return {
        ...n,
        status: 'known' as NodeStatus,
        knownAssessed: !assessOnly,
        notes: assessOnly ? 'Marked as known (needs self-assessment)' : 'Marked as mastered previously',
      };
    }
    return n;
  });

  const recomputedNodes = recomputeNodeStatuses(updatedNodes);

  // Identify unlocked nodes
  const unlockedNodeIds = recomputedNodes
    .filter((n) => n.status === 'available' && targetNode.prerequisites.includes(n.id) === false)
    .map((n) => n.id);

  // Recalculate summary
  const tempRoadmap = { ...roadmap, nodes: recomputedNodes };
  const stats = calculateProgressSummary(tempRoadmap);

  const updatedSummary: RoadmapSummary = {
    ...roadmap.summary,
    hoursInvested: stats.hoursInvested,
    hoursRemaining: stats.hoursRemaining,
    estimatedDurationWeeks: stats.projectedWeeksRemaining,
    projectedCompletionDate: stats.projectedCompletionDate,
  };

  const replanEvent: ReplanEvent = {
    id: `replan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    reason: 'skill_known',
    description: `Marked "${targetNode.title}" as known. Deducted ${targetNode.estimatedHours}h of study time. Projected timeline shortened by ${Math.max(0, weeksBefore - stats.projectedWeeksRemaining)} week(s).`,
    hoursBefore,
    hoursAfter: stats.hoursRemaining,
    weeksBefore,
    weeksAfter: stats.projectedWeeksRemaining,
    affectedNodeIds: [nodeId],
    unlockedNodeIds,
    tradeoffs: [
      `Saved ${targetNode.estimatedHours} hours of beginner study time.`,
      `Downstream dependent milestones unlocked for direct learning.`,
    ],
  };

  const history = roadmap.replanHistory || [];

  return {
    updatedRoadmap: {
      ...roadmap,
      nodes: recomputedNodes,
      summary: updatedSummary,
      updatedAt: new Date().toISOString(),
      replanHistory: [replanEvent, ...history],
    },
    replanEvent,
  };
}

/**
 * FLOW B: Weekly study hours change (e.g. from 10 hrs/week to 15 hrs/week)
 * Preserves estimated work effort, recalculates projected timeline in weeks.
 */
export function applyWeeklyHoursChange(
  roadmap: CareerRoadmap,
  newHoursPerWeek: number
): { updatedRoadmap: CareerRoadmap; replanEvent: ReplanEvent } {
  const weeksBefore = roadmap.summary.estimatedDurationWeeks;
  const hoursRemaining = roadmap.summary.hoursRemaining ?? roadmap.summary.estimatedTotalHours;
  const newWeeks = Math.ceil(hoursRemaining / Math.max(1, newHoursPerWeek));

  const now = new Date();
  const completionDate = new Date(now.getTime() + newWeeks * 7 * 24 * 60 * 60 * 1000);
  const projectedCompletionDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedSummary: RoadmapSummary = {
    ...roadmap.summary,
    estimatedDurationWeeks: newWeeks,
    projectedCompletionDate,
  };

  const delta = weeksBefore - newWeeks;
  const directionText = delta >= 0 ? `shortened by ${delta}` : `extended by ${Math.abs(delta)}`;

  const replanEvent: ReplanEvent = {
    id: `replan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    reason: 'hours_changed',
    description: `Pacing adjusted to ${newHoursPerWeek} hrs/week. Target timeline ${directionText} week(s). Total work scope remains preserved at ${hoursRemaining}h.`,
    hoursBefore: hoursRemaining,
    hoursAfter: hoursRemaining,
    weeksBefore,
    weeksAfter: newWeeks,
    affectedNodeIds: [],
    unlockedNodeIds: [],
    tradeoffs:
      delta >= 0
        ? [
            `Faster completion allows earlier interview application readiness.`,
            `Requires disciplined weekly commitment of ${newHoursPerWeek} hours.`,
          ]
        : [
            `More sustainable weekly pace prevents burnout.`,
            `Completion date shifts back by ${Math.abs(delta)} week(s).`,
          ],
  };

  return {
    updatedRoadmap: {
      ...roadmap,
      personalization: {
        ...roadmap.personalization,
        hoursPerWeek: newHoursPerWeek,
      },
      summary: updatedSummary,
      updatedAt: new Date().toISOString(),
      replanHistory: [replanEvent, ...(roadmap.replanHistory || [])],
    },
    replanEvent,
  };
}

/**
 * FLOW C: Deadline / Target months change
 * Identifies achievable milestones vs optional work that can be deferred.
 */
export function applyDeadlineChange(
  roadmap: CareerRoadmap,
  targetMonths: number
): { updatedRoadmap: CareerRoadmap; replanEvent: ReplanEvent } {
  const weeksTarget = targetMonths * 4.3;
  const currentHoursPerWeek = roadmap.personalization.hoursPerWeek;
  const totalCapacityHours = Math.round(weeksTarget * currentHoursPerWeek);

  const hoursBefore = roadmap.summary.hoursRemaining ?? roadmap.summary.estimatedTotalHours;
  const weeksBefore = roadmap.summary.estimatedDurationWeeks;

  // If capacity is tighter than current remaining hours, mark non-essential nodes as optional
  let adjustedHours = 0;
  const affectedNodeIds: string[] = [];

  const updatedNodes = roadmap.nodes.map((node) => {
    if (node.importance === 'optional' || (node.importance === 'recommended' && node.difficulty === 'advanced')) {
      if (adjustedHours + node.estimatedHours > totalCapacityHours) {
        affectedNodeIds.push(node.id);
        return {
          ...node,
          importance: 'optional' as const,
          notes: 'Deferred to post-job placement to meet accelerated deadline.',
        };
      }
    }
    adjustedHours += node.estimatedHours;
    return node;
  });

  const recomputedNodes = recomputeNodeStatuses(updatedNodes);
  const stats = calculateProgressSummary({ ...roadmap, nodes: recomputedNodes });

  const replanEvent: ReplanEvent = {
    id: `replan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    reason: 'deadline_changed',
    description: `Deadline adapted to ${targetMonths} month(s) (~${Math.round(weeksTarget)} weeks). ${affectedNodeIds.length} secondary milestones flagged as optional deferrals to preserve core readiness.`,
    hoursBefore,
    hoursAfter: stats.hoursRemaining,
    weeksBefore,
    weeksAfter: Math.round(weeksTarget),
    affectedNodeIds,
    unlockedNodeIds: [],
    tradeoffs: [
      `Essential foundations and core portfolio projects retained at 100%.`,
      `Electives and advanced specializations marked deferrable.`,
    ],
  };

  return {
    updatedRoadmap: {
      ...roadmap,
      personalization: {
        ...roadmap.personalization,
        targetMonths,
      },
      nodes: recomputedNodes,
      summary: {
        ...roadmap.summary,
        estimatedDurationWeeks: Math.round(weeksTarget),
        hoursRemaining: stats.hoursRemaining,
      },
      updatedAt: new Date().toISOString(),
      replanHistory: [replanEvent, ...(roadmap.replanHistory || [])],
    },
    replanEvent,
  };
}

/**
 * FLOW E: Milestone Completion
 * Marks node completed, updates graph, unlocks dependents, calculates stats.
 */
export function applyMilestoneCompletion(
  roadmap: CareerRoadmap,
  nodeId: string
): { updatedRoadmap: CareerRoadmap; unlockedCount: number } {
  const updatedNodes = roadmap.nodes.map((n) => {
    if (n.id === nodeId) {
      return {
        ...n,
        status: 'completed' as NodeStatus,
        completedAt: new Date().toISOString(),
      };
    }
    return n;
  });

  const recomputedNodes = recomputeNodeStatuses(updatedNodes);

  // Count how many newly became available
  const previouslyAvailable = new Set(
    roadmap.nodes.filter((n) => n.status === 'available').map((n) => n.id)
  );
  const nowAvailable = recomputedNodes.filter((n) => n.status === 'available');
  const unlockedCount = nowAvailable.filter((n) => !previouslyAvailable.has(n.id)).length;

  const stats = calculateProgressSummary({ ...roadmap, nodes: recomputedNodes });

  const updatedSummary: RoadmapSummary = {
    ...roadmap.summary,
    hoursInvested: stats.hoursInvested,
    hoursRemaining: stats.hoursRemaining,
    estimatedDurationWeeks: stats.projectedWeeksRemaining,
    projectedCompletionDate: stats.projectedCompletionDate,
  };

  return {
    updatedRoadmap: {
      ...roadmap,
      nodes: recomputedNodes,
      summary: updatedSummary,
      updatedAt: new Date().toISOString(),
    },
    unlockedCount,
  };
}

/**
 * Computes an automatic DAG layout with a strictly left-to-right learning flow.
 * - Positions prerequisite nodes strictly to the left of dependent nodes.
 * - Aligns phases into distinct, orderly horizontal zones.
 * - Allows independent parallel milestones to share ranks vertically with zero overlap.
 * - Minimizes edge crossings via barycentric heuristic.
 * - Uses consistent node dimensions (260px x 98px) with generous breathing room.
 */
export function computeGraphLayout(roadmap: CareerRoadmap): {
  flowNodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: RoadmapNode & {
      phaseTitle: string;
      phaseOrder: number;
      isHighlighted?: boolean;
      isUpstream?: boolean;
      isDownstream?: boolean;
    };
  }>;
  flowEdges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    animated: boolean;
    style?: Record<string, string | number>;
    pathOptions?: { borderRadius: number };
  }>;
  phaseZones: Array<{
    id: string;
    title: string;
    order: number;
    x: number;
    width: number;
  }>;
} {
  const nodes = roadmap.nodes;
  const edges = roadmap.edges;
  const phases = [...roadmap.phases].sort((a, b) => a.order - b.order);
  const phaseMap = new Map(phases.map((p) => [p.id, p]));

  // Build prerequisite mapping (combining explicit node.prerequisites and directed edges)
  const prereqMap = new Map<string, Set<string>>();
  for (const node of nodes) {
    prereqMap.set(node.id, new Set(node.prerequisites || []));
  }
  for (const edge of edges) {
    if (!prereqMap.has(edge.target)) prereqMap.set(edge.target, new Set());
    prereqMap.get(edge.target)!.add(edge.source);
  }

  // 1. Calculate topological rank (longest dependency path from any root)
  const rankMap = new Map<string, number>();
  function getRank(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0;
    if (rankMap.has(nodeId)) return rankMap.get(nodeId)!;

    const prereqs = Array.from(prereqMap.get(nodeId) || []);
    if (prereqs.length === 0) {
      rankMap.set(nodeId, 0);
      return 0;
    }

    visited.add(nodeId);
    let maxPrereq = 0;
    for (const p of prereqs) {
      const r = getRank(p, visited);
      if (r >= maxPrereq) maxPrereq = r + 1;
    }
    visited.delete(nodeId);

    rankMap.set(nodeId, maxPrereq);
    return maxPrereq;
  }

  for (const node of nodes) {
    getRank(node.id, new Set<string>());
  }

  // 2. Assign horizontal column index ensuring:
  //    - Nodes in later phases are to the right of earlier phases.
  //    - Prerequisite nodes are strictly to the left of their dependents.
  const nodeColumnMap = new Map<string, number>();
  let currentBaseCol = 0;
  const phaseZones: Array<{ id: string; title: string; order: number; x: number; width: number }> = [];

  const NODE_WIDTH = 300;
  const NODE_HEIGHT = 142;
  const X_GAP = 120;
  const Y_GAP = 75;
  const COL_STEP = NODE_WIDTH + X_GAP; // 420px
  const BASE_X = 60;
  const BASELINE_Y = 360;

  for (const phase of phases) {
    const phaseNodes = nodes.filter((n) => n.phaseId === phase.id);
    if (phaseNodes.length === 0) continue;

    // Find distinct ranks within this phase
    const phaseRanks = Array.from(new Set(phaseNodes.map((n) => rankMap.get(n.id) || 0))).sort((a, b) => a - b);

    // Relative column within phase
    const rankToColOffset = new Map<number, number>();
    phaseRanks.forEach((r, idx) => {
      rankToColOffset.set(r, idx);
    });

    const phaseStartCol = currentBaseCol;

    for (const node of phaseNodes) {
      const r = rankMap.get(node.id) || 0;
      const offset = rankToColOffset.get(r) || 0;
      nodeColumnMap.set(node.id, phaseStartCol + offset);
    }

    const phaseNumCols = Math.max(1, phaseRanks.length);
    const phaseX = BASE_X + phaseStartCol * COL_STEP - 20;
    const phaseWidth = phaseNumCols * COL_STEP - X_GAP + 40;

    phaseZones.push({
      id: phase.id,
      title: phase.title,
      order: phase.order,
      x: phaseX,
      width: phaseWidth,
    });

    currentBaseCol += phaseNumCols;
  }

  // Fallback for any nodes without phase
  for (const node of nodes) {
    if (!nodeColumnMap.has(node.id)) {
      nodeColumnMap.set(node.id, rankMap.get(node.id) || 0);
    }
  }

  // 3. Group nodes by assigned column
  const cols = new Map<number, RoadmapNode[]>();
  for (const node of nodes) {
    const col = nodeColumnMap.get(node.id) || 0;
    if (!cols.has(col)) cols.set(col, []);
    cols.get(col)!.push(node);
  }

  // 4. Sort nodes in each column vertically using barycenter heuristic
  const sortedColIndices = Array.from(cols.keys()).sort((a, b) => a - b);
  const nodePositionMap = new Map<string, { x: number; y: number }>();

  for (const colIdx of sortedColIndices) {
    const colNodes = cols.get(colIdx) || [];

    // Calculate barycenter (average Y of upstream prerequisites)
    const barycenters = new Map<string, number>();
    for (const node of colNodes) {
      const prereqs = Array.from(prereqMap.get(node.id) || []);
      const knownY = prereqs
        .map((pid) => nodePositionMap.get(pid)?.y)
        .filter((y): y is number => y !== undefined);

      if (knownY.length > 0) {
        const avgY = knownY.reduce((a, b) => a + b, 0) / knownY.length;
        barycenters.set(node.id, avgY);
      } else {
        barycenters.set(node.id, BASELINE_Y);
      }
    }

    colNodes.sort((a, b) => (barycenters.get(a.id) || 0) - (barycenters.get(b.id) || 0));

    // Place nodes evenly centered around BASELINE_Y
    const M = colNodes.length;
    const totalHeight = M * NODE_HEIGHT + (M - 1) * Y_GAP;
    const startY = BASELINE_Y - totalHeight / 2;
    const colX = BASE_X + colIdx * COL_STEP;

    colNodes.forEach((node, rowIdx) => {
      const nodeY = startY + rowIdx * (NODE_HEIGHT + Y_GAP);
      nodePositionMap.set(node.id, { x: colX, y: nodeY });
    });
  }

  // Build flowNodes
  const flowNodes = nodes.map((node) => {
    const pos = nodePositionMap.get(node.id) || { x: BASE_X, y: BASELINE_Y };
    const phase = phaseMap.get(node.phaseId);
    return {
      id: node.id,
      type: 'customMilestoneNode',
      position: pos,
      data: {
        ...node,
        phaseTitle: phase?.title || 'Phase Milestone',
        phaseOrder: phase?.order || 1,
      },
    };
  });

  // Build flowEdges with thin subtle indigo lines and rounded-edge smoothstep
  const flowEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    pathOptions: { borderRadius: 14 },
    animated: edge.relationship === 'prerequisite',
    style: {
      stroke: edge.relationship === 'recommended' ? '#c7d2fe' : '#818cf8',
      strokeWidth: 1.5,
      opacity: 0.8,
    },
  }));

  return { flowNodes, flowEdges, phaseZones };
}

