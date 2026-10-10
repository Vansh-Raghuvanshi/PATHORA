export type NodeType =
  | 'target'
  | 'foundation'
  | 'technical'
  | 'project'
  | 'certification'
  | 'experience'
  | 'interview'
  | 'readiness'
  | 'specialization'
  | 'checkpoint';

export type NodeStatus =
  | 'not_started'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'known'
  | 'optional';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Importance = 'essential' | 'recommended' | 'optional';
export type ResourceType = 'documentation' | 'course' | 'tutorial' | 'book' | 'interactive' | 'official_spec';
export type ResourceCost = 'free' | 'paid' | 'freemium';
export type VerificationStatus = 'verified' | 'unverified';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  cost: ResourceCost;
  verificationStatus: VerificationStatus;
  verifiedDate?: string;
  provider?: string;
  notes?: string;
}

export interface WeekendProjectSpec {
  title: string;
  description: string;
  techStack: string[];
  deliverables: string[];
  difficulty: Difficulty;
  estimatedHours: number;
}

export interface RoadmapNode {
  id: string;
  title: string;
  type: NodeType;
  phaseId: string;
  description: string;
  importance: Importance;
  difficulty: Difficulty;
  estimatedHours: number;
  estimatedWeeks: number;
  status: NodeStatus;
  prerequisites: string[]; // array of node IDs
  skills: string[];
  deliverable: string;
  completionCriteria: string[];
  whyItMatters?: string;
  learningObjectives?: string[];
  commonMistakes?: string[];
  interviewQuestions?: string[];
  weekendProject?: WeekendProjectSpec;
  resources: LearningResource[];
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  completedAt?: string;
  knownAssessed?: boolean;
}

export interface RoadmapEdge {
  id: string;
  source: string; // prerequisite node id
  target: string; // dependent node id
  relationship: 'prerequisite' | 'recommended' | 'parallel';
  animated?: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  estimatedWeeks: number;
}

export interface CareerCheckpoint {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  estimatedWeek: number;
  isUnlocked?: boolean;
}

export interface CareerInsight {
  id: string;
  title: string;
  description: string;
  type: 'recommendation' | 'market_note' | 'tradeoff' | 'warning';
}

export interface TargetDestination {
  role: string;
  industry: string;
  companyType: string;
  location: string;
  seniority: string;
  currentEducation?: string;
  currentRole?: string;
  targetApplicationDate?: string;
}

export interface UserPersonalization {
  hoursPerWeek: number;
  targetMonths: number;
  startingLevel: Difficulty;
  masteredSkills: string[];
  learningSkills: string[];
  programmingExperience: string;
  existingProjects?: string;
  portfolioUrl?: string;
  preferredLanguage: string;
  preferredLearningStyle: 'project-first' | 'theory-then-build' | 'interactive-docs' | 'visual-video';
  freeResourcesOnly: boolean;
  budgetRange?: string;
  assumptions: string[];
}

export interface RoadmapSummary {
  estimatedTotalHours: number;
  estimatedDurationWeeks: number;
  readinessMilestones: string[];
  projectedCompletionDate?: string;
  hoursInvested?: number;
  hoursRemaining?: number;
}

export interface CareerRoadmap {
  roadmapId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  target: TargetDestination;
  personalization: UserPersonalization;
  summary: RoadmapSummary;
  phases: RoadmapPhase[];
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  careerCheckpoints: CareerCheckpoint[];
  careerInsights: CareerInsight[];
  isDemo?: boolean;
  replanHistory?: ReplanEvent[];
}

export interface ReplanEvent {
  id: string;
  timestamp: string;
  reason: 'skill_known' | 'hours_changed' | 'deadline_changed' | 'role_changed' | 'milestone_completed';
  description: string;
  hoursBefore: number;
  hoursAfter: number;
  weeksBefore: number;
  weeksAfter: number;
  affectedNodeIds: string[];
  unlockedNodeIds: string[];
  tradeoffs?: string[];
}

export interface ProjectBrief {
  id: string;
  title: string;
  problemStatement: string;
  whyItMatters: string;
  targetRole: string;
  targetSkills: string[];
  difficulty: Difficulty;
  size: 'weekend' | 'one_week' | 'two_week' | 'capstone';
  estimatedHours: number;
  recommendedStack: string[];
  featureRequirements: string[];
  optionalAdvancedFeatures: string[];
  architectureOverview: string;
  implementationPhases: { phase: string; tasks: string[] }[];
  acceptanceCriteria: string[];
  testingRequirements: string[];
  readmeOutline: string;
  portfolioPresentationAdvice: string;
  interviewDiscussionPoints: string[];
  linkedMilestoneId?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: 'technical' | 'scenario' | 'behavioral' | 'project_defense';
  difficulty: Difficulty;
  targetRole: string;
  relatedSkills: string[];
  interviewerEvaluationPoints: string[];
  modelAnswerFramework: string;
  commonWeakAnswers: string[];
  followUpQuestions: string[];
  saved?: boolean;
  mastered?: boolean;
  notes?: string;
}

export interface RoleComparisonData {
  roleA: {
    title: string;
    roadmap: CareerRoadmap;
  };
  roleB: {
    title: string;
    roadmap: CareerRoadmap;
  };
  sharedSkills: string[];
  uniqueToA: string[];
  uniqueToB: string[];
  sharedProjects: string[];
  prerequisiteOverlapPercentage: number;
  effortDeltaHours: number;
  careerFlexibilityScore: number;
  interviewFocusDifferences: { role: string; focus: string[] }[];
  strategicAdvice: string;
}
