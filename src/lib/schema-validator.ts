import { z } from 'zod';
import { CareerRoadmap, RoadmapNode, RoadmapEdge } from '../types/roadmap';

export const LearningResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  type: z.enum(['documentation', 'course', 'tutorial', 'book', 'interactive', 'official_spec']),
  cost: z.enum(['free', 'paid', 'freemium']),
  verificationStatus: z.enum(['verified', 'unverified']).default('unverified'),
  verifiedDate: z.string().optional(),
  provider: z.string().optional(),
  notes: z.string().optional(),
});

export const WeekendProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  deliverables: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number().positive(),
});

export const RoadmapNodeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum([
    'target',
    'foundation',
    'technical',
    'project',
    'certification',
    'experience',
    'interview',
    'readiness',
    'specialization',
    'checkpoint',
  ]),
  phaseId: z.string(),
  description: z.string(),
  importance: z.enum(['essential', 'recommended', 'optional']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number().nonnegative(),
  estimatedWeeks: z.number().nonnegative(),
  status: z.enum([
    'not_started',
    'available',
    'in_progress',
    'completed',
    'blocked',
    'known',
    'optional',
  ]).default('not_started'),
  prerequisites: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  deliverable: z.string().default('Completed project or self-assessment'),
  completionCriteria: z.array(z.string()).default([]),
  whyItMatters: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  interviewQuestions: z.array(z.string()).optional(),
  weekendProject: WeekendProjectSchema.optional(),
  resources: z.array(LearningResourceSchema).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
  knownAssessed: z.boolean().optional(),
});

export const RoadmapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: z.enum(['prerequisite', 'recommended', 'parallel']).default('prerequisite'),
  animated: z.boolean().optional(),
});

export const RoadmapPhaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  estimatedHours: z.number().nonnegative(),
  estimatedWeeks: z.number().nonnegative(),
});

export const CareerRoadmapSchema = z.object({
  roadmapId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  target: z.object({
    role: z.string(),
    industry: z.string(),
    companyType: z.string(),
    location: z.string(),
    seniority: z.string(),
    currentEducation: z.string().optional(),
    currentRole: z.string().optional(),
    targetApplicationDate: z.string().optional(),
  }),
  personalization: z.object({
    hoursPerWeek: z.number().positive(),
    targetMonths: z.number().positive(),
    startingLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    masteredSkills: z.array(z.string()),
    learningSkills: z.array(z.string()),
    programmingExperience: z.string(),
    existingProjects: z.string().optional(),
    portfolioUrl: z.string().optional(),
    preferredLanguage: z.string(),
    preferredLearningStyle: z.enum([
      'project-first',
      'theory-then-build',
      'interactive-docs',
      'visual-video',
    ]),
    freeResourcesOnly: z.boolean(),
    budgetRange: z.string().optional(),
    assumptions: z.array(z.string()),
  }),
  summary: z.object({
    estimatedTotalHours: z.number().nonnegative(),
    estimatedDurationWeeks: z.number().nonnegative(),
    readinessMilestones: z.array(z.string()),
    projectedCompletionDate: z.string().optional(),
    hoursInvested: z.number().nonnegative().optional(),
    hoursRemaining: z.number().nonnegative().optional(),
  }),
  phases: z.array(RoadmapPhaseSchema),
  nodes: z.array(RoadmapNodeSchema),
  edges: z.array(RoadmapEdgeSchema),
  careerCheckpoints: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      criteria: z.array(z.string()),
      estimatedWeek: z.number(),
      isUnlocked: z.boolean().optional(),
    })
  ),
  careerInsights: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.enum(['recommendation', 'market_note', 'tradeoff', 'warning']),
    })
  ),
  isDemo: z.boolean().optional(),
});

/**
 * Validates and repairs a raw roadmap:
 * 1. Checks schema conformity
 * 2. Removes edges pointing to non-existent nodes
 * 3. Detects and breaks any circular prerequisite cycles
 * 4. Ensures nodes and phases are consistent
 */
export function sanitizeAndValidateRoadmap(raw: unknown): {
  success: boolean;
  roadmap?: CareerRoadmap;
  errors?: string[];
} {
  const result = CareerRoadmapSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }

  const roadmap = result.data as CareerRoadmap;

  // 1. Ensure node IDs are unique
  const nodeMap = new Map<string, RoadmapNode>();
  for (const node of roadmap.nodes) {
    nodeMap.set(node.id, node);
  }

  // 2. Clean edges referencing non-existent nodes
  const validEdges: RoadmapEdge[] = [];
  for (const edge of roadmap.edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target) && edge.source !== edge.target) {
      validEdges.push(edge);
    }
  }

  // 3. Cycle Detection using Depth-First Search
  // Adjacency list: node -> array of dependent nodes
  const adj = new Map<string, string[]>();
  for (const edge of validEdges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycleEdges = new Set<string>();

  function dfs(u: string) {
    visited.add(u);
    recStack.add(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        dfs(v);
      } else if (recStack.has(v)) {
        // Cycle detected! Record this back edge
        cycleEdges.add(`${u}->${v}`);
      }
    }
    recStack.delete(u);
  }

  for (const nodeId of nodeMap.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  // Filter out edges that create cycles
  roadmap.edges = validEdges.filter((e) => !cycleEdges.has(`${e.source}->${e.target}`));

  // 4. Synchronize prerequisites on each node with surviving edges
  const prereqMap = new Map<string, string[]>();
  for (const edge of roadmap.edges) {
    if (!prereqMap.has(edge.target)) prereqMap.set(edge.target, []);
    prereqMap.get(edge.target)!.push(edge.source);
  }

  for (const node of roadmap.nodes) {
    node.prerequisites = prereqMap.get(node.id) || [];
  }

  return { success: true, roadmap };
}
