import {
  CareerRoadmap,
  TargetDestination,
  UserPersonalization,
  RoadmapPhase,
  RoadmapNode,
  RoadmapEdge,
  CareerCheckpoint,
  CareerInsight,
} from '../types/roadmap';
import { sanitizeAndValidateRoadmap } from './schema-validator';
import { recomputeNodeStatuses, calculateProgressSummary } from './graph-engine';

export type RoleArchetype =
  | 'ai_app'
  | 'ml_engineer'
  | 'data_scientist'
  | 'mlops'
  | 'data_engineer'
  | 'frontend'
  | 'backend'
  | 'fullstack';

/**
 * Accurately classifies user role input into distinct technical archetypes.
 */
export function detectRoleArchetype(roleStr: string): RoleArchetype {
  const r = (roleStr || '').toLowerCase();

  if (
    r.includes('mlops') ||
    r.includes('ml ops') ||
    r.includes('ml platform') ||
    r.includes('model deploy') ||
    r.includes('ai ops') ||
    r.includes('machine learning operations')
  ) {
    return 'mlops';
  }

  if (
    r.includes('data sci') ||
    r.includes('statistician') ||
    r.includes('quantitative') ||
    r.includes('applied data scientist') ||
    r.includes('analytics engineer')
  ) {
    return 'data_scientist';
  }

  if (
    r.includes('data eng') ||
    r.includes('etl') ||
    r.includes('lakehouse') ||
    r.includes('spark') ||
    r.includes('pipeline engineer')
  ) {
    return 'data_engineer';
  }

  if (
    r.includes('machine learning') ||
    r.includes('ml engineer') ||
    r.includes('deep learning') ||
    r.includes('computer vision') ||
    r.includes('nlp engineer') ||
    r.includes('pytorch') ||
    r.includes('applied ml')
  ) {
    return 'ml_engineer';
  }

  if (
    r.includes('frontend') ||
    r.includes('front-end') ||
    r.includes('react') ||
    r.includes('ui developer') ||
    r.includes('web client')
  ) {
    return 'frontend';
  }

  if (
    r.includes('backend') ||
    r.includes('back-end') ||
    r.includes('golang') ||
    r.includes('api engineer') ||
    r.includes('distributed system')
  ) {
    return 'backend';
  }

  if (
    r.includes('fullstack') ||
    r.includes('full stack') ||
    r.includes('software engineer') ||
    r.includes('web developer')
  ) {
    return 'fullstack';
  }

  // Default AI Application Engineer for 'AI Engineer', 'GenAI', 'LLM Engineer', etc.
  return 'ai_app';
}

/**
 * Synthesizes a role-specific, technically accurate career roadmap
 * featuring realistic dependency graphs, parallel execution tracks,
 * verified deliverables, and accurate effort calculations.
 */
export function synthesizeDynamicRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization
): CareerRoadmap {
  const archetype = detectRoleArchetype(target.role);
  const hoursPerWeek = Math.max(4, personalization.hoursPerWeek || 10);
  const targetMonths = Math.max(2, personalization.targetMonths || 6);

  // Exact 26 weeks for 6 months (matches test constraints and standard semester pacing)
  const totalWeeks = Math.round(targetMonths * 4.3333333333);
  const totalBudgetHours = Math.round(totalWeeks * hoursPerWeek);

  const roadmapId = `pathora-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let phases: RoadmapPhase[] = [];
  let nodes: RoadmapNode[] = [];
  let edges: RoadmapEdge[] = [];
  let checkpoints: CareerCheckpoint[] = [];
  let insights: CareerInsight[] = [];

  switch (archetype) {
    case 'ai_app':
      ({ phases, nodes, edges, checkpoints, insights } = buildAIAppEngineerRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    case 'ml_engineer':
      ({ phases, nodes, edges, checkpoints, insights } = buildMLEngineerRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    case 'data_scientist':
      ({ phases, nodes, edges, checkpoints, insights } = buildDataScientistRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    case 'mlops':
      ({ phases, nodes, edges, checkpoints, insights } = buildMLOpsRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    case 'data_engineer':
      ({ phases, nodes, edges, checkpoints, insights } = buildDataEngineerRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    case 'frontend':
      ({ phases, nodes, edges, checkpoints, insights } = buildFrontendRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
    default:
      // Fallback for general software / backend
      ({ phases, nodes, edges, checkpoints, insights } = buildBackendRoadmap(
        target,
        personalization,
        totalWeeks,
        totalBudgetHours
      ));
      break;
  }

  // Account for user's already mastered skills from onboarding
  if (personalization.masteredSkills && personalization.masteredSkills.length > 0) {
    const masteredLower = personalization.masteredSkills.map((s) => s.toLowerCase());
    nodes = nodes.map((node) => {
      const matchesMastered = masteredLower.some(
        (m) =>
          node.title.toLowerCase().includes(m) ||
          node.skills.some((sk) => sk.toLowerCase().includes(m))
      );
      if (matchesMastered) {
        return {
          ...node,
          status: 'completed' as const,
          notes: 'Marked as mastered during onboarding questionnaire.',
        };
      }
      return node;
    });
  }

  // Intermediate starting level accelerates foundational modules
  if (personalization.startingLevel === 'intermediate') {
    nodes = nodes.map((node, idx) => {
      if (idx === 0) {
        return {
          ...node,
          status: 'completed' as const,
          notes: 'Passed foundational assessment based on intermediate experience.',
        };
      }
      return node;
    });
  }

  // Ensure total sum of node hours matches totalBudgetHours accurately
  const totalCurrentEstimated = nodes.reduce((acc, n) => acc + n.estimatedHours, 0);
  if (totalCurrentEstimated !== totalBudgetHours && nodes.length > 0) {
    let diff = totalBudgetHours - totalCurrentEstimated;
    const step = diff > 0 ? 1 : -1;
    let idx = 0;
    while (diff !== 0) {
      const node = nodes[idx % nodes.length];
      if (node.type === 'technical' || node.type === 'project') {
        node.estimatedHours += step;
        diff -= step;
      }
      idx++;
      if (idx > 500) break;
    }
  }

  const sanitizedNodes = recomputeNodeStatuses(nodes);

  const initialRoadmap: CareerRoadmap = {
    roadmapId,
    title: `${target.role} Career Architecture`,
    createdAt: now,
    updatedAt: now,
    target,
    personalization,
    summary: {
      estimatedTotalHours: totalBudgetHours,
      estimatedDurationWeeks: totalWeeks,
      readinessMilestones: [
        `Production RAG pipeline with hybrid search and vector database deployed on cloud`,
        `High-throughput async backend service with streaming LLM generation`,
        `Automated evaluation harness verifying answer faithfulness and guardrails`,
        `Clean GitHub portfolio repository with architecture diagrams and live demo URLs`,
      ],
      hoursInvested: 0,
      hoursRemaining: totalBudgetHours,
      projectedCompletionDate: new Date(Date.now() + totalWeeks * 7 * 24 * 3600 * 1000).toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      ),
    },
    phases,
    nodes: sanitizedNodes,
    edges,
    careerCheckpoints: checkpoints,
    careerInsights: insights,
    isDemo: false,
  };

  // Re-verify graph acyclicity and schema consistency
  const validated = sanitizeAndValidateRoadmap(initialRoadmap);
  const cleanRoadmap = validated.roadmap || initialRoadmap;

  // Calculate live progress and summary metrics
  const stats = calculateProgressSummary(cleanRoadmap);
  cleanRoadmap.summary.hoursInvested = stats.hoursInvested;
  cleanRoadmap.summary.hoursRemaining = stats.hoursRemaining;
  cleanRoadmap.summary.estimatedDurationWeeks = stats.projectedWeeksRemaining;

  return cleanRoadmap;
}

// ============================================================================
// ARCHETYPE 1: AI APPLICATION ENGINEER (AI Engineering, LLMs, RAG, Agents)
// ============================================================================
function buildAIAppEngineerRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    {
      id: 'ph-ai-1',
      title: 'Phase 1: Foundations & Data Plumbing',
      description: 'Modern Python 3.12, Git hygiene, relational databases, and core statistical intuition.',
      order: 1,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ai-2',
      title: 'Phase 2: Backend APIs & LLM Foundations',
      description: 'Async FastAPI services, streaming responses, structured JSON outputs, and tool calling.',
      order: 2,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ai-3',
      title: 'Phase 3: Retrieval-Augmented Generation & Rigorous Evaluation',
      description: 'Dense embeddings, vector databases, hybrid search, rerankers, and automated eval harnesses.',
      order: 3,
      estimatedHours: calcHours(0.24),
      estimatedWeeks: calcWeeks(0.24),
    },
    {
      id: 'ph-ai-4',
      title: 'Phase 4: Containerized Deployment & Telemetry',
      description: 'Docker multi-stage builds, semantic caching with Redis, observability, and capstone engineering.',
      order: 4,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ai-5',
      title: 'Phase 5: Portfolio Defense & Technical Interviews',
      description: 'AI system design case studies, token budget calculations, and technical coding rounds.',
      order: 5,
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
    },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'ai-node-1',
      title: 'Foundations of Modern Python',
      type: 'foundation',
      phaseId: 'ph-ai-1',
      description:
        'Master Python 3.12 typing, Pydantic V2 data contracts, AsyncIO concurrency primitives, clean modular architecture, and professional Git workflows.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.08),
      estimatedWeeks: calcWeeks(0.08),
      status: 'available',
      prerequisites: [],
      skills: ['Python 3.12', 'Pydantic V2', 'AsyncIO', 'Git Workflow', 'Pytest'],
      deliverable: 'A clean GitHub utility package with strict mypy type checking and automated Pytest test suite.',
      completionCriteria: [
        '100% typecheck passing in strict mypy',
        'Pass 15+ automated unit tests covering async edge cases',
      ],
      whyItMatters:
        'AI engineering requires rigorous type safety and asynchronous event loops to orchestrate high-latency LLM API streams reliably.',
      learningObjectives: [
        'Master async/await patterns and generator streaming',
        'Define immutable data validation contracts using Pydantic',
        'Establish clean Git trunk-based development workflows',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-py-official',
          title: 'Official Python Documentation & AsyncIO Guide',
          url: 'https://docs.python.org/3/library/asyncio.html',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-2',
      title: 'Relational SQL & Structured Data Handling',
      type: 'foundation',
      phaseId: 'ph-ai-1',
      description:
        'PostgreSQL schema modeling, complex joins, CTEs, JSONB column manipulations, indexing, and connection pooling for conversational chat storage.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.07),
      estimatedWeeks: calcWeeks(0.07),
      status: 'blocked',
      prerequisites: ['ai-node-1'],
      skills: ['PostgreSQL', 'SQL Joins & CTEs', 'JSONB Querying', 'AsyncPG', 'Schema Migration'],
      deliverable: 'A production PostgreSQL schema and async migration script for a multi-tenant AI chat and document storage engine.',
      completionCriteria: [
        'Complex query benchmark executing in under 15ms',
        'Zero unindexed full-table scans verified via EXPLAIN ANALYZE',
      ],
      whyItMatters:
        'Production AI applications store chat sessions, user metadata, audit logs, and document references in relational databases.',
      learningObjectives: [
        'Model multi-tenant conversation histories with JSONB metadata',
        'Optimize relational queries using composite indexes',
        'Execute asynchronous queries using connection pooling',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-pg-tutorial',
          title: 'PostgreSQL Tutorial & JSONB Architecture',
          url: 'https://www.postgresqltutorial.com/',
          type: 'tutorial',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-3',
      title: 'Core Statistics & Machine Learning Concepts for AI',
      type: 'foundation',
      phaseId: 'ph-ai-1',
      description:
        'Build empirical intuition for tokenization, temperature, top-p sampling, vector latent space, cosine distance, cross-entropy loss, and precision vs recall.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.06),
      estimatedWeeks: calcWeeks(0.06),
      status: 'blocked',
      prerequisites: ['ai-node-1'],
      skills: ['Tokenization', 'Temperature & Top-P', 'Cosine Similarity', 'Precision & Recall', 'Loss Functions'],
      deliverable: 'An exploratory Jupyter notebook analyzing token logprob distributions, temperature curves, and vector cosine similarities.',
      completionCriteria: [
        'Demonstrate empirical difference between greedy and stochastic sampling',
        'Compute pairwise vector similarity metrics on 50 sample texts',
      ],
      whyItMatters:
        'Understanding probabilistic token sampling and vector mathematics is essential to diagnose hallucinations and model output variance.',
      learningObjectives: [
        'Inspect tokenization mechanics and BPE vocabulary mappings',
        'Calibrate temperature and top-p sampling for deterministic extraction vs creative generation',
        'Calculate and visualize vector embeddings in multi-dimensional space',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-transformers-intro',
          title: "Jay Alammar's The Illustrated Transformer & Word2Vec",
          url: 'https://jalammar.github.io/illustrated-transformer/',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-4',
      title: 'Asynchronous Backend APIs with FastAPI',
      type: 'technical',
      phaseId: 'ph-ai-2',
      description:
        'Build high-concurrency REST endpoints with FastAPI, Server-Sent Events (SSE) for token streaming, dependency injection, middleware rate limiting, and CORS.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ai-node-1', 'ai-node-2'],
      skills: ['FastAPI', 'Server-Sent Events (SSE)', 'Streaming Responses', 'Dependency Injection', 'Rate Limiting'],
      deliverable: 'An asynchronous FastAPI service that streams token chunks via SSE with backpressure management and graceful client cancellation.',
      completionCriteria: [
        'Time-To-First-Token (TTFT) streaming begins under 200ms',
        'Handles disconnected clients cleanly without orphaned background tasks',
      ],
      whyItMatters:
        'LLM generation takes seconds; streaming token chunks in real-time is the standard UX requirement for all modern AI applications.',
      learningObjectives: [
        'Implement Server-Sent Events streaming in FastAPI with AsyncGenerators',
        'Manage request timeouts and token cancellation signals',
        'Secure API endpoints with API key authentication and rate limiting',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-fastapi-docs',
          title: 'FastAPI Official Documentation on Streaming & Concurrency',
          url: 'https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-5',
      title: 'LLM APIs, Tool Calling & Structured Outputs',
      type: 'technical',
      phaseId: 'ph-ai-2',
      description:
        'Master frontier LLM APIs (OpenAI / Gemini / Anthropic), function calling, tool execution loops, strict JSON schema enforcement with Instructor/Pydantic, and few-shot calibration.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.11),
      estimatedWeeks: calcWeeks(0.11),
      status: 'blocked',
      prerequisites: ['ai-node-3', 'ai-node-4'],
      skills: ['LLM APIs', 'Tool Calling', 'Structured Outputs', 'Instructor / Outlines', 'Prompt Engineering'],
      deliverable: 'A structured extraction service that parses messy raw document text into guaranteed valid Pydantic models with automated self-healing retries.',
      completionCriteria: [
        'Zero schema validation errors across 50 varied messy input payloads',
        'Dynamic tool execution loop successfully querying external APIs',
      ],
      whyItMatters:
        'Free-form natural language generation breaks production software. AI engineers must force models to emit guaranteed structured data.',
      learningObjectives: [
        'Implement native tool calling with automated schema reflection',
        'Enforce strict JSON schema validation and self-correcting validation loops',
        'Optimize token budgets and prompt templates for reproducible outputs',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-openai-structured',
          title: 'OpenAI Structured Outputs & Function Calling Guide',
          url: 'https://platform.openai.com/docs/guides/structured-outputs',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-6',
      title: 'Embeddings, Vector Databases & Hybrid RAG',
      type: 'technical',
      phaseId: 'ph-ai-3',
      description:
        'Semantic chunking strategies, dense vector embeddings (BGE / OpenAI), vector indexing with Qdrant, hybrid retrieval (BM25 keyword + dense vector), Reciprocal Rank Fusion, and Cohere cross-encoder reranking.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
      status: 'blocked',
      prerequisites: ['ai-node-2', 'ai-node-5'],
      skills: ['Vector Databases (Qdrant)', 'Dense Embeddings', 'Hybrid Search', 'Reranking (Cohere)', 'Chunking Strategies'],
      deliverable: 'A production Hybrid RAG micro-service that indexes multi-format PDFs and returns cited context with reciprocal rank fusion and cross-encoder reranking.',
      completionCriteria: [
        'Mean Reciprocal Rank (MRR@10) >= 0.85 on test benchmark queries',
        'Exact source citation metadata and passage offsets returned with all answers',
      ],
      whyItMatters:
        'RAG provides private enterprise context without costly retraining. Hybrid search and rerankers eliminate catastrophic retrieval misses.',
      learningObjectives: [
        'Implement recursive and semantic chunking with overlap buffers',
        'Combine sparse BM25 and dense vector queries with Reciprocal Rank Fusion',
        'Apply cross-encoder rerankers to filter low-confidence context',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-qdrant-docs',
          title: 'Qdrant Vector Database Official Architectural Guide',
          url: 'https://qdrant.tech/documentation/overview/',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-7',
      title: 'AI Evaluation, Guardrails & Testing Harnesses',
      type: 'technical',
      phaseId: 'ph-ai-3',
      description:
        'Quantitative evaluation frameworks (Ragas / TruLens / Promptfoo), faithfulness metrics, context recall, prompt injection mitigation, and automated CI regression test suites.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.08),
      estimatedWeeks: calcWeeks(0.08),
      status: 'blocked',
      prerequisites: ['ai-node-6'],
      skills: ['Ragas Framework', 'Faithfulness Evaluation', 'Promptfoo', 'Guardrails AI', 'Prompt Injection Defense'],
      deliverable: 'An automated CI/CD evaluation harness benchmarking RAG faithfulness and answer relevancy against 100 ground-truth Q&A pairs.',
      completionCriteria: [
        'Ragas faithfulness score >= 0.90 across evaluation test set',
        '100% detection and interception of prompt injection attempts in security suite',
      ],
      whyItMatters:
        'You cannot improve what you cannot measure. Automated evaluation is the only way to deploy AI without fear of regressions or safety breaches.',
      learningObjectives: [
        'Construct gold-standard synthetic and human evaluation datasets',
        'Automate RAG triplet metrics (faithfulness, answer relevance, context recall)',
        'Implement input/output guardrails intercepting jailbreak attempts',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-ragas-docs',
          title: 'Ragas: Evaluation Framework for LLM Applications',
          url: 'https://docs.ragas.io/en/stable/',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-8',
      title: 'Docker Deployment, Semantic Caching & Telemetry',
      type: 'technical',
      phaseId: 'ph-ai-4',
      description:
        'Docker multi-stage containerization, semantic query caching with Redis, token cost telemetry with Langfuse / OpenTelemetry, and cloud hosting deployment.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ai-node-4'],
      skills: ['Docker', 'Semantic Caching (Redis)', 'Langfuse Observability', 'Token Cost Tracking', 'Cloud Deployment'],
      deliverable: 'A containerized Docker Compose stack with semantic caching that reduces API costs by 40% on recurring queries and exports token telemetry.',
      completionCriteria: [
        'Cache hit latency < 30ms for semantically equivalent prompts',
        'End-to-end token cost and latency trace logged in telemetry dashboard',
      ],
      whyItMatters:
        'AI services can incur massive cloud bills. Semantic caching and token telemetry are mandatory for operational sustainability.',
      learningObjectives: [
        'Build minimal, secure Docker images for Python AI services',
        'Implement vector semantic caching using Redis',
        'Export distributed traces tracking latency per LLM call and token consumption',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-langfuse-docs',
          title: 'Langfuse: Open Source LLM Observability & Tracing',
          url: 'https://langfuse.com/docs',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-9',
      title: 'Capstone: Production AI Application with Hybrid RAG & Tool Execution',
      type: 'project',
      phaseId: 'ph-ai-4',
      description:
        'Build and deploy a complete production AI Copilot application combining async FastAPI backend, Qdrant hybrid RAG, multi-step tool execution, automated eval suite, and Docker cloud hosting.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['ai-node-6', 'ai-node-7', 'ai-node-8'],
      skills: [
        'Full-Stack AI Architecture',
        'Qdrant Vector DB',
        'Multi-Step Tool Calling',
        'Automated Eval CI/CD',
        'Docker Cloud Deployment',
      ],
      deliverable:
        'A live, publicly deployed AI Copilot with streaming web interface, comprehensive GitHub documentation, Mermaid architecture diagram, and benchmark score card.',
      completionCriteria: [
        'Live production URL accessible with sub-second streaming responses',
        'CI/CD test and evaluation report demonstrating >88% benchmark accuracy',
      ],
      whyItMatters:
        'The single most compelling proof of competence for hiring managers—demonstrating you can take an AI product from raw prompts to a reliable, deployed system.',
      learningObjectives: [
        'Architect an end-to-end multi-service AI application',
        'Integrate hybrid retrieval, structured output tools, and evaluation in one codebase',
        'Deploy with production grade observability, rate limiting, and automated CI/CD',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-capstone-patterns',
          title: 'Patterns for Building LLM-based Systems & Applications (Eugene Yan)',
          url: 'https://eugeneyan.com/writing/llm-patterns/',
          type: 'documentation',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
    {
      id: 'ai-node-10',
      title: 'AI System Design & Technical Interview Preparation',
      type: 'interview',
      phaseId: 'ph-ai-5',
      description:
        'Master AI system design interview case studies (Design Enterprise RAG, Design Copilot, Context window limits, Token economics), Python DSA problem solving, and STAR behavioral defense.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.08),
      estimatedWeeks: calcWeeks(0.08),
      status: 'blocked',
      prerequisites: ['ai-node-9'],
      skills: ['AI System Design', 'Token Cost Modeling', 'STAR Behavioral Defense', 'Coding Interviews', 'Architecture Trade-offs'],
      deliverable: 'A comprehensive interview defense playbook with 15 solved AI system design architectures and recorded mock interview defense.',
      completionCriteria: [
        'Diagram multi-tenant RAG system design under 40-minute mock interview constraint',
        'ATS resume optimization score >= 90 tailored to target role',
      ],
      whyItMatters:
        'Converting technical competence into offers requires defending latency, cost, and architecture trade-offs under high-pressure interview conditions.',
      learningObjectives: [
        'Frame AI system design trade-offs: fine-tuning vs RAG, small vs large models, latency vs quality',
        'Calculate token throughput, memory footprint, and monthly cloud bill projections',
        'Articulate technical challenges and architectural trade-offs using the STAR framework',
      ],
      confidence: 'high',
      resources: [
        {
          id: 'res-ai-interview',
          title: 'Chip Huyen: Building LLM Applications & System Design',
          url: 'https://huyenchip.com/2023/04/11/llm-engineering.html',
          type: 'book',
          cost: 'free',
          verificationStatus: 'verified',
        },
      ],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'ai-e1', source: 'ai-node-1', target: 'ai-node-2', relationship: 'prerequisite' },
    { id: 'ai-e1b', source: 'ai-node-1', target: 'ai-node-3', relationship: 'prerequisite' },
    { id: 'ai-e2', source: 'ai-node-2', target: 'ai-node-4', relationship: 'prerequisite' },
    { id: 'ai-e3', source: 'ai-node-3', target: 'ai-node-5', relationship: 'prerequisite' },
    { id: 'ai-e4', source: 'ai-node-4', target: 'ai-node-5', relationship: 'prerequisite' },
    { id: 'ai-e4b', source: 'ai-node-4', target: 'ai-node-8', relationship: 'prerequisite' },
    { id: 'ai-e5', source: 'ai-node-5', target: 'ai-node-6', relationship: 'prerequisite' },
    { id: 'ai-e5b', source: 'ai-node-2', target: 'ai-node-6', relationship: 'prerequisite' },
    { id: 'ai-e6', source: 'ai-node-6', target: 'ai-node-7', relationship: 'prerequisite' },
    { id: 'ai-e7', source: 'ai-node-6', target: 'ai-node-9', relationship: 'prerequisite' },
    { id: 'ai-e8', source: 'ai-node-7', target: 'ai-node-9', relationship: 'prerequisite' },
    { id: 'ai-e9', source: 'ai-node-8', target: 'ai-node-9', relationship: 'prerequisite' },
    { id: 'ai-e10', source: 'ai-node-9', target: 'ai-node-10', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'ai-cp-1',
      title: 'Backend API & Structured LLM Tool Execution Checkpoint',
      description: 'Ship an async streaming API with guaranteed Pydantic structured output validation.',
      criteria: ['FastAPI Server-Sent Events operational', 'Zero schema parsing failures'],
      estimatedWeek: Math.round(totalWeeks * 0.4),
    },
    {
      id: 'ai-cp-2',
      title: 'Production RAG & Evaluation Harness Checkpoint',
      description: 'Validate hybrid retrieval accuracy and deploy automated regression tests in CI.',
      criteria: ['Hybrid Qdrant retrieval MRR@10 > 0.85', 'Automated Ragas evaluation badge in GitHub'],
      estimatedWeek: Math.round(totalWeeks * 0.7),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'ai-ins-1',
      title: 'Shift from Prompting to Systems Engineering',
      description: `For ${target.role} positions, tech companies prioritize reliable structured outputs, evaluation test harnesses, and latency optimization over ad-hoc prompt engineering.`,
      type: 'recommendation',
    },
    {
      id: 'ai-ins-2',
      title: 'Parallel Engineering Tracks',
      description: `Your roadmap allows containerization and Docker deployment (Phase 4) to be learned in parallel with RAG and Evaluation, maximizing weekly study throughput.`,
      type: 'tradeoff',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 2: MACHINE LEARNING ENGINEER (PyTorch, Training, Models, Serving)
// ============================================================================
function buildMLEngineerRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    {
      id: 'ph-ml-1',
      title: 'Phase 1: Mathematical Foundations & Scientific Python',
      description: 'Linear algebra, multivariable calculus, NumPy, vectorization, and data extraction.',
      order: 1,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ml-2',
      title: 'Phase 2: Classical Machine Learning & Tree Ensembles',
      description: 'Scikit-Learn, regression, tree ensembles (XGBoost/LightGBM), and statistical validation.',
      order: 2,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ml-3',
      title: 'Phase 3: Deep Learning Architectures with PyTorch',
      description: 'Tensors, autograd, custom Dataset/DataLoader, MLP, CNN, and Transformer self-attention.',
      order: 3,
      estimatedHours: calcHours(0.25),
      estimatedWeeks: calcWeeks(0.25),
    },
    {
      id: 'ph-ml-4',
      title: 'Phase 4: Training Pipelines, Tracking & High-Performance Serving',
      description: 'MLflow experiment tracking, ONNX Runtime optimization, and low-latency API serving.',
      order: 4,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ml-5',
      title: 'Phase 5: Capstone Pipeline & ML System Design',
      description: 'End-to-end production model pipeline, recommendation design, and technical coding rounds.',
      order: 5,
      estimatedHours: calcHours(0.13),
      estimatedWeeks: calcWeeks(0.13),
    },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'ml-node-1',
      title: 'Foundations of Modern Python & Scientific Computing',
      type: 'foundation',
      phaseId: 'ph-ml-1',
      description: 'Linear algebra vector operations, matrix decomposition, NumPy broadcasting, and performance profiling.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'available',
      prerequisites: [],
      skills: ['Python 3.12', 'NumPy Vectorization', 'Linear Algebra', 'Git', 'Profiling'],
      deliverable: 'A vector math library with vectorized matrix operations and performance benchmarks against naive loops.',
      completionCriteria: ['100x speedup demonstrated via vectorization', 'Passing automated test suite'],
      whyItMatters: 'Deep learning requires mathematical fluency with tensor broadcasting and memory layouts.',
      learningObjectives: ['Implement vector broadcasting in NumPy', 'Profile memory and compute bottlenecks', 'Apply linear algebra transformations'],
      confidence: 'high',
      resources: [{ id: 'res-numpy-docs', title: 'NumPy Official User Guide', url: 'https://numpy.org/doc/stable/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-2',
      title: 'Feature Engineering & Data Pipeline Foundations',
      type: 'foundation',
      phaseId: 'ph-ml-1',
      description: 'Handling missing values, categorical encoding, feature scaling, and preventing target data leakage.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ml-node-1'],
      skills: ['Pandas / Polars', 'Feature Encoding', 'Data Leakage Prevention', 'SQL for ML'],
      deliverable: 'An automated preprocessing pipeline with zero data leakage across train/validation splits.',
      completionCriteria: ['Zero target leakage verified', 'Handles edge cases and null values gracefully'],
      whyItMatters: 'Bad features ruin good algorithms. Robust preprocessing is half of machine learning in production.',
      learningObjectives: ['Design modular transformers and pipelines', 'Prevent target leakage in temporal datasets'],
      confidence: 'high',
      resources: [{ id: 'res-scikit-pipeline', title: 'Scikit-Learn Pipelines & ColumnTransformer Guide', url: 'https://scikit-learn.org/stable/modules/compose.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-3',
      title: 'Classical Machine Learning & Gradient Boosted Trees',
      type: 'technical',
      phaseId: 'ph-ml-2',
      description: 'Logistic/Linear regression, regularization (L1/L2), Random Forests, XGBoost, and ROC-AUC / PR evaluation.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.13),
      estimatedWeeks: calcWeeks(0.13),
      status: 'blocked',
      prerequisites: ['ml-node-1', 'ml-node-2'],
      skills: ['Scikit-Learn', 'XGBoost / LightGBM', 'Hyperparameter Tuning', 'ROC-AUC & PR Curves'],
      deliverable: 'A benchmarked tabular prediction engine comparing Logistic Regression vs XGBoost with cross-validation.',
      completionCriteria: ['ROC-AUC score improvement documented', 'Feature importance and SHAP analysis plotted'],
      whyItMatters: 'Gradient boosted trees remain the standard algorithm for tabular business and financial data.',
      learningObjectives: ['Tune tree depth, learning rate, and subsampling', 'Evaluate precision-recall trade-offs under class imbalance'],
      confidence: 'high',
      resources: [{ id: 'res-xgboost-docs', title: 'XGBoost Official Documentation', url: 'https://xgboost.readthedocs.io/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-4',
      title: 'Deep Learning Architectures with PyTorch',
      type: 'technical',
      phaseId: 'ph-ml-3',
      description: 'PyTorch tensors, autograd computation graphs, custom nn.Module, custom Dataset/DataLoader, and optimization.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.15),
      estimatedWeeks: calcWeeks(0.15),
      status: 'blocked',
      prerequisites: ['ml-node-1'],
      skills: ['PyTorch', 'Autograd & Backprop', 'Custom Dataset/DataLoader', 'AdamW & Schedulers', 'GPU Acceleration'],
      deliverable: 'A custom neural network trained on GPU with early stopping, learning rate warm-up, and checkpointing.',
      completionCriteria: ['Validation loss convergence verified', 'Model checkpoints saved and loaded cleanly'],
      whyItMatters: 'PyTorch is the undisputed framework for modern deep learning and AI research.',
      learningObjectives: ['Implement forward/backward passes and autograd', 'Build memory-efficient custom DataLoaders with multiprocessing'],
      confidence: 'high',
      resources: [{ id: 'res-pytorch-tutorials', title: 'Deep Learning with PyTorch: A 60 Minute Blitz', url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-5',
      title: 'Experiment Tracking, Checkpointing & Model Registry',
      type: 'technical',
      phaseId: 'ph-ml-4',
      description: 'Track hyperparameters and metrics using MLflow, model registry staging, and artifact versioning.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ml-node-3', 'ml-node-4'],
      skills: ['MLflow', 'Weights & Biases', 'Model Versioning', 'Artifact Management'],
      deliverable: 'An automated training run logging metrics, loss curves, and model weights to an MLflow registry.',
      completionCriteria: ['Complete experiment comparison dashboard', 'Model artifact promoted to Staging registry'],
      whyItMatters: 'Reproducibility separates professional ML engineers from hobbyists playing in notebooks.',
      learningObjectives: ['Instrument training loops with automatic metric logging', 'Version models and schemas in a model registry'],
      confidence: 'high',
      resources: [{ id: 'res-mlflow-docs', title: 'MLflow Tracking & Model Registry Documentation', url: 'https://mlflow.org/docs/latest/index.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-6',
      title: 'High-Performance Model Serving & Inference Optimization',
      type: 'technical',
      phaseId: 'ph-ml-4',
      description: 'Export models to ONNX Runtime, FP16 quantization, dynamic batching, and async FastAPI serving.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
      status: 'blocked',
      prerequisites: ['ml-node-4'],
      skills: ['ONNX Runtime', 'Quantization (INT8/FP16)', 'Model Serving (FastAPI)', 'Latency Benchmarking'],
      deliverable: 'An optimized ONNX model inference micro-service running with 3x lower latency than raw PyTorch.',
      completionCriteria: ['P95 inference latency under 25ms', 'Passing concurrency load test under 100 req/sec'],
      whyItMatters: 'Serving unoptimized models in production is slow and wastes hundreds of thousands of dollars in cloud GPU costs.',
      learningObjectives: ['Convert PyTorch models to ONNX graphs', 'Apply post-training quantization and measure accuracy degradation'],
      confidence: 'high',
      resources: [{ id: 'res-onnx-docs', title: 'ONNX Runtime Optimization Tutorials', url: 'https://onnxruntime.ai/docs/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-7',
      title: 'Capstone: Production End-to-End PyTorch Deep Learning System',
      type: 'project',
      phaseId: 'ph-ml-5',
      description: 'Full-stack machine learning pipeline from raw dataset ingestion, training, MLflow tracking, ONNX optimization, to deployed serving API.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['ml-node-5', 'ml-node-6'],
      skills: ['End-to-End ML Architecture', 'PyTorch Pipeline', 'MLflow Tracking', 'ONNX Serving', 'Production Deployment'],
      deliverable: 'A deployed production model inference service with public GitHub repository, automated CI tests, and live Swagger endpoint.',
      completionCriteria: ['Live API endpoint accepting inference requests', 'Reproducible single-command training and evaluation script'],
      whyItMatters: 'Demonstrates end-to-end ownership across the entire ML lifecycle from raw dataset to production API.',
      learningObjectives: ['Architect an automated train-eval-serve pipeline', 'Document model cards and operational latency benchmarks'],
      confidence: 'high',
      resources: [{ id: 'res-ml-capstone', title: 'Full Stack Deep Learning Course Notes', url: 'https://fullstackdeeplearning.com/', type: 'course', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ml-node-8',
      title: 'ML System Design & Technical Interview Preparation',
      type: 'interview',
      phaseId: 'ph-ml-5',
      description: 'System design interviews for recommendation systems, search ranking, fraud detection, and Python coding rounds.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.08),
      estimatedWeeks: calcWeeks(0.08),
      status: 'blocked',
      prerequisites: ['ml-node-7'],
      skills: ['ML System Design', 'Recommendation Systems', 'Metric Trade-offs', 'STAR Defense', 'Python DSA'],
      deliverable: 'An ML system design playbook diagramming 10 core architectures (e.g. YouTube RecSys, Ad Click Prediction).',
      completionCriteria: ['Pass mock ML system design rubric score >= 4/5', 'Flawless defense of latency vs accuracy trade-offs'],
      whyItMatters: 'Mid-level and senior ML engineering offers depend on structured system design problem solving.',
      learningObjectives: ['Frame machine learning problems into candidate generation, ranking, and re-ranking layers', 'Estimate compute, training frequency, and feature store requirements'],
      confidence: 'high',
      resources: [{ id: 'res-ml-sys-design', title: 'Machine Learning System Design Interview (Patrick Halina)', url: 'https://github.com/chiphuyen/machine-learning-systems-design', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'ml-e1', source: 'ml-node-1', target: 'ml-node-2', relationship: 'prerequisite' },
    { id: 'ml-e1b', source: 'ml-node-1', target: 'ml-node-3', relationship: 'prerequisite' },
    { id: 'ml-e1c', source: 'ml-node-1', target: 'ml-node-4', relationship: 'prerequisite' },
    { id: 'ml-e2', source: 'ml-node-2', target: 'ml-node-3', relationship: 'prerequisite' },
    { id: 'ml-e3', source: 'ml-node-3', target: 'ml-node-5', relationship: 'prerequisite' },
    { id: 'ml-e4', source: 'ml-node-4', target: 'ml-node-5', relationship: 'prerequisite' },
    { id: 'ml-e5', source: 'ml-node-4', target: 'ml-node-6', relationship: 'prerequisite' },
    { id: 'ml-e6', source: 'ml-node-5', target: 'ml-node-7', relationship: 'prerequisite' },
    { id: 'ml-e7', source: 'ml-node-6', target: 'ml-node-7', relationship: 'prerequisite' },
    { id: 'ml-e8', source: 'ml-node-7', target: 'ml-node-8', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'ml-cp-1',
      title: 'Core Machine Learning & Deep Learning Checkpoint',
      description: 'Master supervised training loops in PyTorch with reproducible experiment logs.',
      criteria: ['PyTorch training loop converges without NaN gradients', 'Scikit-Learn baseline established'],
      estimatedWeek: Math.round(totalWeeks * 0.45),
    },
    {
      id: 'ml-cp-2',
      title: 'Production Model Serving Checkpoint',
      description: 'Deploy ONNX optimized inference service with sub-25ms latency.',
      criteria: ['ONNX runtime integration passing load tests', 'MLflow model registry tracking operational'],
      estimatedWeek: Math.round(totalWeeks * 0.75),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'ml-ins-1',
      title: 'Emphasis on PyTorch and Model Serving',
      description: `For ${target.role}, recruiters prioritize candidates who can write custom training loops and serve optimized models over candidates who only call high-level APIs.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 3: DATA SCIENTIST (Statistics, SQL, Causal Inference, Modeling)
// ============================================================================
function buildDataScientistRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    {
      id: 'ph-ds-1',
      title: 'Phase 1: Probability, Statistics & Analytical SQL',
      description: 'Hypothesis testing, p-values, experimental design, and advanced analytical SQL.',
      order: 1,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ds-2',
      title: 'Phase 2: Exploratory Data Analysis & Interpretable ML',
      description: 'Pandas, Polars, data storytelling, tree ensembles, and SHAP interpretability.',
      order: 2,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ds-3',
      title: 'Phase 3: Causal Inference & A/B Testing Experimentation',
      description: 'A/B testing frameworks, difference-in-differences, and synthetic controls.',
      order: 3,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ds-4',
      title: 'Phase 4: Capstone Predictive Engine & Executive Cockpit',
      description: 'End-to-end customer analytics model with interactive Streamlit decision studio.',
      order: 4,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ds-5',
      title: 'Phase 5: Product Sense & Technical Case Studies',
      description: 'Product intuition, metric design, live SQL rounds, and executive storytelling.',
      order: 5,
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
    },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'ds-node-1',
      title: 'Foundations of Modern Applied Statistics & Probability',
      type: 'foundation',
      phaseId: 'ph-ds-1',
      description: 'Distributions, hypothesis testing, p-values, confidence intervals, power analysis, and sample size calculations.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'available',
      prerequisites: [],
      skills: ['Statistical Inference', 'Hypothesis Testing', 'Power Analysis', 'Python (SciPy/Statsmodels)', 'Git'],
      deliverable: 'A statistical testing notebook simulating A/B test power analysis and Type I / Type II error rates.',
      completionCriteria: ['Accurate sample size calculation derived for a 5% MDE', 'Passing statistical hypothesis test simulations'],
      whyItMatters: 'Statistical rigor prevents false discoveries that waste millions in misguided product launches.',
      learningObjectives: ['Calculate sample sizes and minimum detectable effects', 'Perform parametric and non-parametric hypothesis tests'],
      confidence: 'high',
      resources: [{ id: 'res-stat-thinking', title: 'Statistical Thinking for the 21st Century', url: 'https://statsthinking21.github.io/statsthinking21-core-site/', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-2',
      title: 'Advanced Analytical SQL & Cohort Modeling',
      type: 'foundation',
      phaseId: 'ph-ds-1',
      description: 'Window functions (ROW_NUMBER, LEAD/LAG), Common Table Expressions, retention cohorts, and funnel analytics.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['ds-node-1'],
      skills: ['PostgreSQL / Snowflake', 'Window Functions', 'Cohort Retention', 'Funnel Analysis', 'CTEs'],
      deliverable: 'An end-to-end analytical SQL script computing 30-day user retention cohorts and conversion funnels.',
      completionCriteria: ['Executes without temporary tables or cartesian products', 'Accurately computes monthly churn and LTV cohorts'],
      whyItMatters: 'SQL is the primary language used to extract, aggregate, and model data across tech companies.',
      learningObjectives: ['Master window ranking and rolling aggregation functions', 'Calculate complex user retention and lifecycle cohorts in SQL'],
      confidence: 'high',
      resources: [{ id: 'res-mode-sql', title: 'Mode Analytics Advanced SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-3',
      title: 'Exploratory Data Analysis & Scientific Visualization',
      type: 'technical',
      phaseId: 'ph-ds-2',
      description: 'High-speed data manipulation with Pandas & Polars, missing value imputation, outlier detection, and Plotly charts.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['ds-node-1'],
      skills: ['Pandas / Polars', 'Plotly / Seaborn', 'Outlier Detection', 'Data Wrangling', 'Exploratory Analysis'],
      deliverable: 'An interactive EDA report uncovering hidden correlations, distributions, and business levers.',
      completionCriteria: ['Zero unaddressed anomalies or skewed distribution warnings', 'Interactive publication-grade charts'],
      whyItMatters: 'Translating noisy raw tables into actionable business insight is the core superpower of a data scientist.',
      learningObjectives: ['Profile datasets with automated statistical summaries', 'Create compelling interactive data visualizations with Plotly'],
      confidence: 'high',
      resources: [{ id: 'res-polars-docs', title: 'Polars: Fast Multi-Threaded DataFrame Library Guide', url: 'https://docs.pola.rs/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-4',
      title: 'Predictive Modeling & Interpretable Machine Learning',
      type: 'technical',
      phaseId: 'ph-ds-2',
      description: 'Logistic regression, tree ensembles with LightGBM, feature importance, cross-validation, and SHAP value explainability.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['ds-node-2', 'ds-node-3'],
      skills: ['Scikit-Learn', 'LightGBM', 'SHAP Values', 'Model Interpretability', 'Cross-Validation'],
      deliverable: 'A predictive customer churn model with SHAP waterfall plots explaining individual customer risk drivers.',
      completionCriteria: ['ROC-AUC score >= 0.82 on out-of-time validation holdout', 'Individual customer prediction explanations generated via SHAP'],
      whyItMatters: 'Business stakeholders demand interpretable models so they can take concrete retention actions.',
      learningObjectives: ['Train regularized regression and gradient boosted models', 'Interpret global and local feature effects with SHAP'],
      confidence: 'high',
      resources: [{ id: 'res-shap-docs', title: 'SHAP (SHapley Additive exPlanations) Documentation', url: 'https://shap.readthedocs.io/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-5',
      title: 'Causal Inference & Production A/B Testing',
      type: 'technical',
      phaseId: 'ph-ds-3',
      description: 'Quasi-experiments, difference-in-differences, propensity score matching, and A/B test decision frameworks.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.16),
      estimatedWeeks: calcWeeks(0.16),
      status: 'blocked',
      prerequisites: ['ds-node-1', 'ds-node-4'],
      skills: ['Causal Inference', 'Difference-in-Differences', 'Propensity Matching', 'A/B Testing Analysis'],
      deliverable: 'A causal analysis measuring feature rollout impact using difference-in-differences methodology.',
      completionCriteria: ['Parallel trends assumption verified statistically', 'Estimated treatment effect isolated with confidence intervals'],
      whyItMatters: 'Correlation is not causation. Causal inference tells executives what will happen if they change a strategy.',
      learningObjectives: ['Distinguish selection bias from true treatment effects', 'Implement propensity score matching and difference-in-differences'],
      confidence: 'high',
      resources: [{ id: 'res-causal-mixtape', title: 'Causal Inference: The Mixtape (Scott Cunningham)', url: 'https://mixtape.scunning.com/', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-6',
      title: 'Capstone: Enterprise Customer Analytics Engine & Decision Studio',
      type: 'project',
      phaseId: 'ph-ds-4',
      description: 'End-to-end predictive customer LTV & churn engine with causal uplift modeling and interactive Streamlit executive decision app.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
      status: 'blocked',
      prerequisites: ['ds-node-4', 'ds-node-5'],
      skills: ['End-to-End Data Science', 'Streamlit App', 'Causal Uplift', 'Executive Presentation', 'Public Deployment'],
      deliverable: 'A deployed Streamlit decision cockpit letting executives simulate interventions and see predicted revenue impacts.',
      completionCriteria: ['Live interactive dashboard active with scenario sliders', 'Reproducible GitHub repository with complete methodology documentation'],
      whyItMatters: 'Demonstrates end-to-end impact: from raw database tables to predictive models and executive decision-making tools.',
      learningObjectives: ['Deploy interactive data science applications with Streamlit', 'Present statistical findings clearly to non-technical business leaders'],
      confidence: 'high',
      resources: [{ id: 'res-streamlit-docs', title: 'Streamlit Official App Development Documentation', url: 'https://docs.streamlit.io/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ds-node-7',
      title: 'Product Sense, Case Studies & Technical Interview Preparation',
      type: 'interview',
      phaseId: 'ph-ds-5',
      description: 'Product sense questions (e.g. How would you measure engagement for Netflix?), metric design, live SQL coding, and case study defense.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ds-node-6'],
      skills: ['Product Sense', 'Metric Design (North Star KPIs)', 'Live SQL Coding', 'Case Study Frameworks', 'STAR Method'],
      deliverable: 'A case study playbook answering 12 core product metric questions and 20 solved complex SQL challenges.',
      completionCriteria: ['Score 4/5 on mock product analytics case study rubric', 'Flawless live SQL execution under 30-minute constraint'],
      whyItMatters: 'Data science interviews test business intuition and metric trade-offs just as heavily as raw coding.',
      learningObjectives: ['Define North Star and counter-metrics for digital products', 'Structure ambiguous business problem answers using clear frameworks'],
      confidence: 'high',
      resources: [{ id: 'res-ds-interviews', title: 'Ace the Data Science Interview (Nick Singh)', url: 'https://www.acethedatascienceinterview.com/', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'ds-e1', source: 'ds-node-1', target: 'ds-node-2', relationship: 'prerequisite' },
    { id: 'ds-e1b', source: 'ds-node-1', target: 'ds-node-3', relationship: 'prerequisite' },
    { id: 'ds-e2', source: 'ds-node-2', target: 'ds-node-4', relationship: 'prerequisite' },
    { id: 'ds-e3', source: 'ds-node-3', target: 'ds-node-4', relationship: 'prerequisite' },
    { id: 'ds-e4', source: 'ds-node-1', target: 'ds-node-5', relationship: 'prerequisite' },
    { id: 'ds-e5', source: 'ds-node-4', target: 'ds-node-5', relationship: 'prerequisite' },
    { id: 'ds-e6', source: 'ds-node-4', target: 'ds-node-6', relationship: 'prerequisite' },
    { id: 'ds-e7', source: 'ds-node-5', target: 'ds-node-6', relationship: 'prerequisite' },
    { id: 'ds-e8', source: 'ds-node-6', target: 'ds-node-7', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'ds-cp-1',
      title: 'Advanced SQL & Predictive Modeling Checkpoint',
      description: 'Produce high-performance analytical SQL queries and interpretable tree-based predictions.',
      criteria: ['SQL cohort retention query passing benchmarks', 'SHAP feature importance validated'],
      estimatedWeek: Math.round(totalWeeks * 0.45),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'ds-ins-1',
      title: 'Causal Inference & Business Impact',
      description: `Modern tech firms evaluate data scientists on causal experimentation and product sense rather than raw black-box model tuning.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 4: MLOPS ENGINEER (Containers, K8s, Pipelines, Drift, Monitoring)
// ============================================================================
function buildMLOpsRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    {
      id: 'ph-ops-1',
      title: 'Phase 1: Linux, Production Tooling & Docker',
      description: 'Linux systems, python packaging, Docker multi-stage builds, and GPU containerization.',
      order: 1,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ops-2',
      title: 'Phase 2: Kubernetes & Cloud Infrastructure',
      description: 'Kubernetes primitives, Helm, GPU scheduling, and cloud compute provisioning.',
      order: 2,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-ops-3',
      title: 'Phase 3: Data Versioning, Pipelines & Model Registry',
      description: 'DVC data versioning, Feast feature store, Airflow/Prefect pipelines, and MLflow registry.',
      order: 3,
      estimatedHours: calcHours(0.24),
      estimatedWeeks: calcWeeks(0.24),
    },
    {
      id: 'ph-ops-4',
      title: 'Phase 4: Model Observability & Automated Retraining CI/CD',
      description: 'Evidently AI drift monitoring, Prometheus, Grafana, and automated canary rollouts.',
      order: 4,
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
    },
    {
      id: 'ph-ops-5',
      title: 'Phase 5: Capstone Platform & Infrastructure Defense',
      description: 'Self-healing ML CI/CD platform, system design defense, and technical interviews.',
      order: 5,
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
    },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'ops-node-1',
      title: 'Foundations of Modern Linux & Python Tooling',
      type: 'foundation',
      phaseId: 'ph-ops-1',
      description: 'Linux shell scripting, POSIX tools, process management, python packaging (uv/poetry), pre-commit hooks, and Git CI.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'available',
      prerequisites: [],
      skills: ['Linux Shell', 'Poetry / uv', 'Git Actions', 'Pre-commit', 'Makefiles'],
      deliverable: 'A standardized repository scaffolding package with automated linting, testing, and Makefile targets.',
      completionCriteria: ['100% automated lint and test pass in GitHub Actions', 'Single-command setup via Makefile'],
      whyItMatters: 'MLOps engineers must maintain pristine development hygiene and automate manual developer overhead.',
      learningObjectives: ['Automate code hygiene with pre-commit hooks', 'Manage reproducible Python virtual environments with uv'],
      confidence: 'high',
      resources: [{ id: 'res-linux-ops', title: 'The Linux Command Line (William Shotts)', url: 'https://linuxcommand.org/tlcl.php', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-2',
      title: 'Containerization with Docker & GPU Acceleration',
      type: 'foundation',
      phaseId: 'ph-ops-1',
      description: 'Multi-stage Dockerfiles, image size minimization, non-root security, and NVIDIA container toolkit for CUDA GPU acceleration.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['ops-node-1'],
      skills: ['Docker', 'Multi-Stage Builds', 'NVIDIA Container Toolkit', 'Container Security'],
      deliverable: 'A minimal, production-hardened PyTorch container image (<800MB) with GPU acceleration verified via nvidia-smi.',
      completionCriteria: ['Image passes vulnerability scan with zero critical CVEs', 'GPU device passthrough operational in container'],
      whyItMatters: 'Reproducible containers ensure models that run on a developer laptop deploy seamlessly to cloud clusters.',
      learningObjectives: ['Structure multi-stage Docker builds', 'Configure GPU passthrough for PyTorch training workloads'],
      confidence: 'high',
      resources: [{ id: 'res-docker-ml', title: 'NVIDIA Container Toolkit Documentation', url: 'https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-3',
      title: 'Kubernetes Fundamentals & AI Cluster Orchestration',
      type: 'technical',
      phaseId: 'ph-ops-2',
      description: 'Kubernetes Pods, Deployments, Services, ConfigMaps, Helm package management, and GPU resource limits.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
      status: 'blocked',
      prerequisites: ['ops-node-2'],
      skills: ['Kubernetes', 'Helm Charts', 'GPU Scheduling', 'K8s Ingress', 'K8s Secrets'],
      deliverable: 'A Helm chart deploying an auto-scaling ML inference service on a local or cloud Kubernetes cluster.',
      completionCriteria: ['Deployment passes health checks with rolling updates', 'Zero downtime observed during pod termination'],
      whyItMatters: 'Kubernetes is the industry standard substrate for orchestrating distributed AI workloads at scale.',
      learningObjectives: ['Write declarative Kubernetes manifests and Helm charts', 'Manage CPU/GPU memory limits and node affinity'],
      confidence: 'high',
      resources: [{ id: 'res-k8s-docs', title: 'Kubernetes Official Documentation on GPU Management', url: 'https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-4',
      title: 'Data & Feature Pipeline Orchestration',
      type: 'technical',
      phaseId: 'ph-ops-3',
      description: 'DVC data version control on S3/GCS, Feast feature store setup, and DAG workflow orchestration using Prefect/Airflow.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['ops-node-1', 'ops-node-2'],
      skills: ['DVC (Data Version Control)', 'Feast Feature Store', 'Prefect / Airflow', 'Data Validation (Great Expectations)'],
      deliverable: 'An automated data ingestion DAG that validates data contracts, tracks revisions via DVC, and pushes to a feature store.',
      completionCriteria: ['Data schema validation passing in Great Expectations', 'DVC pointer accurately tracking remote cloud dataset'],
      whyItMatters: 'Models are only as good as the data they train on; data versioning is mandatory for auditability.',
      learningObjectives: ['Version large datasets alongside code with DVC', 'Serve low-latency online features using Feast'],
      confidence: 'high',
      resources: [{ id: 'res-dvc-docs', title: 'DVC (Data Version Control) Documentation', url: 'https://dvc.org/doc', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-5',
      title: 'Automated ML CI/CD Pipelines & Model Registries',
      type: 'technical',
      phaseId: 'ph-ops-3',
      description: 'Continuous training pipelines with GitHub Actions, MLflow model registry promotion, and automated deployment triggers.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
      status: 'blocked',
      prerequisites: ['ops-node-3', 'ops-node-4'],
      skills: ['MLflow Model Registry', 'GitHub Actions CI/CD', 'Automated Retraining', 'Continuous Deployment'],
      deliverable: 'A CI/CD pipeline where pushing new training code triggers automated testing, training, model evaluation, and registry promotion.',
      completionCriteria: ['Automated model accuracy gate prevents regression', 'Model promoted automatically to Staging/Production in MLflow'],
      whyItMatters: 'Automating the path from code commit to deployed model eliminates error-prone manual handoffs.',
      learningObjectives: ['Implement model quality gating in GitHub Actions', 'Manage model lifecycle stages in a unified registry'],
      confidence: 'high',
      resources: [{ id: 'res-cml-docs', title: 'Continuous Machine Learning (CML) Documentation', url: 'https://cml.dev/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-6',
      title: 'Model Observability, Drift Monitoring & Telemetry',
      type: 'technical',
      phaseId: 'ph-ops-4',
      description: 'Data drift detection with Evidently AI, Prometheus metrics collection, Grafana dashboards, and automated alert webhooks.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['ops-node-3'],
      skills: ['Evidently AI', 'Prometheus', 'Grafana', 'Concept Drift', 'Alerting Webhooks'],
      deliverable: 'A live observability dashboard tracking prediction distributions and triggering automated alerts on statistical drift.',
      completionCriteria: ['Drift alert fires successfully when synthetic skewed distribution is fed', 'Live dashboard showing P95 latency and throughput'],
      whyItMatters: 'Models degrade silently over time. Observability is the only way to detect performance drops before users do.',
      learningObjectives: ['Detect covariate shift and concept drift using Evidently AI', 'Instrument model services with custom Prometheus metrics'],
      confidence: 'high',
      resources: [{ id: 'res-evidently-docs', title: 'Evidently AI Model Monitoring Guide', url: 'https://docs.evidentlyai.com/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-7',
      title: 'Capstone: Self-Healing Automated ML CI/CD Platform',
      type: 'project',
      phaseId: 'ph-ops-5',
      description: 'End-to-end production MLOps platform: git commit triggers automated validation, distributed training, model registry staging, canary deployment on Kubernetes, and drift-triggered retraining.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.2),
      estimatedWeeks: calcWeeks(0.2),
      status: 'blocked',
      prerequisites: ['ops-node-5', 'ops-node-6'],
      skills: ['Production MLOps Platform', 'Kubernetes Deployment', 'Self-Healing CI/CD', 'Automated Retraining', 'Drift Monitoring'],
      deliverable: 'A complete deployed MLOps platform repository with full architecture diagrams, Kubernetes manifests, and live telemetry.',
      completionCriteria: ['Full end-to-end retraining and rollout executes without manual intervention', 'Automated rollback triggered if canary fails health checks'],
      whyItMatters: 'The gold-standard portfolio artifact for MLOps roles—proves you can build resilient infrastructure for serious AI companies.',
      learningObjectives: ['Build self-healing continuous deployment pipelines for ML', 'Integrate monitoring alerts directly into automated retraining triggers'],
      confidence: 'high',
      resources: [{ id: 'res-mlops-guide', title: 'Google Cloud: Architecture for MLOps Continuous Delivery', url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'ops-node-8',
      title: 'MLOps Infrastructure System Design & Technical Defense',
      type: 'interview',
      phaseId: 'ph-ops-5',
      description: 'System design for large-scale model serving, GPU cluster management, zero-downtime rollouts, and technical coding rounds.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.08),
      estimatedWeeks: calcWeeks(0.08),
      status: 'blocked',
      prerequisites: ['ops-node-7'],
      skills: ['MLOps System Design', 'High Availability Infrastructure', 'GPU Cluster Management', 'Cost Optimization', 'STAR Defense'],
      deliverable: 'An infrastructure system design playbook with 10 production architecture diagrams and mock interview defenses.',
      completionCriteria: ['Score 4/5 on mock MLOps architecture defense rubric', 'Articulate clear trade-offs between batch vs streaming feature stores'],
      whyItMatters: 'Senior MLOps interviews focus on disaster recovery, high availability, and multi-million dollar cloud cost optimization.',
      learningObjectives: ['Design high-availability model serving infrastructure under 99.99% SLA constraints', 'Optimize GPU cluster utilization and spot instance scheduling'],
      confidence: 'high',
      resources: [{ id: 'res-mlops-interviews', title: 'MLOps Engineering Technical Interview Guides', url: 'https://github.com/GokuMohandas/Made-With-ML', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'ops-e1', source: 'ops-node-1', target: 'ops-node-2', relationship: 'prerequisite' },
    { id: 'ops-e1b', source: 'ops-node-1', target: 'ops-node-4', relationship: 'prerequisite' },
    { id: 'ops-e2', source: 'ops-node-2', target: 'ops-node-3', relationship: 'prerequisite' },
    { id: 'ops-e2b', source: 'ops-node-2', target: 'ops-node-4', relationship: 'prerequisite' },
    { id: 'ops-e3', source: 'ops-node-3', target: 'ops-node-5', relationship: 'prerequisite' },
    { id: 'ops-e4', source: 'ops-node-4', target: 'ops-node-5', relationship: 'prerequisite' },
    { id: 'ops-e5', source: 'ops-node-3', target: 'ops-node-6', relationship: 'prerequisite' },
    { id: 'ops-e6', source: 'ops-node-5', target: 'ops-node-7', relationship: 'prerequisite' },
    { id: 'ops-e7', source: 'ops-node-6', target: 'ops-node-7', relationship: 'prerequisite' },
    { id: 'ops-e8', source: 'ops-node-7', target: 'ops-node-8', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'ops-cp-1',
      title: 'Containerization & Kubernetes AI Deployment Checkpoint',
      description: 'Ship GPU accelerated containers orchestrated cleanly via Kubernetes Helm charts.',
      criteria: ['Docker multi-stage build passing vulnerability scans', 'Kubernetes Helm deployment operational'],
      estimatedWeek: Math.round(totalWeeks * 0.45),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'ops-ins-1',
      title: 'Infrastructure Automation is Paramount',
      description: `For ${target.role}, recruiters value automated CI/CD pipelines, Kubernetes primitives, and drift monitoring far above tuning model hyperparameters.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 5: FRONTEND ENGINEER (Modern TypeScript, React 19, Next.js, UX)
// ============================================================================
function buildFrontendRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    { id: 'ph-fe-1', title: 'Phase 1: Modern JavaScript & Web Architecture', description: 'TypeScript, ESNext, DOM lifecycle, reactive mental model, and CSS layouts.', order: 1, estimatedHours: calcHours(0.2), estimatedWeeks: calcWeeks(0.2) },
    { id: 'ph-fe-2', title: 'Phase 2: React Core & Component Design Systems', description: 'Custom hooks, state management, render optimization, and accessible UI patterns.', order: 2, estimatedHours: calcHours(0.25), estimatedWeeks: calcWeeks(0.25) },
    { id: 'ph-fe-3', title: 'Phase 3: Next.js, Server State & Full-Stack UX', description: 'Server Components, streaming SSR, TanStack Query, and client data caching.', order: 3, estimatedHours: calcHours(0.25), estimatedWeeks: calcWeeks(0.25) },
    { id: 'ph-fe-4', title: 'Phase 4: Capstone Product & Web Vitals Hardening', description: 'High-performance fintech/SaaS dashboard, Vitest testing, and CI/CD.', order: 4, estimatedHours: calcHours(0.18), estimatedWeeks: calcWeeks(0.18) },
    { id: 'ph-fe-5', title: 'Phase 5: Frontend System Design & Interview Prep', description: 'UI architecture defense, caching strategies, and technical interview coding.', order: 5, estimatedHours: calcHours(0.12), estimatedWeeks: calcWeeks(0.12) },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'fe-node-1',
      title: 'Foundations of Modern TypeScript & JavaScript In-Depth',
      type: 'foundation',
      phaseId: 'ph-fe-1',
      description: 'Generics, union types, event loop, closures, async/await, and microtask queues.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'available',
      prerequisites: [],
      skills: ['TypeScript', 'JavaScript ES6+', 'Event Loop', 'Promises', 'Git'],
      deliverable: 'A type-safe utility library with 100% test coverage and strict tsconfig.',
      completionCriteria: ['Use conditional types and mapped types', 'Pass 15 unit tests in Vitest'],
      whyItMatters: 'Strong type foundations eliminate runtime bugs in complex web interfaces.',
      learningObjectives: ['Master advanced TypeScript generics', 'Understand asynchronous event loop queuing'],
      confidence: 'high',
      resources: [{ id: 'res-ts-handbook', title: 'TypeScript Handbook Official Documentation', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'fe-node-2',
      title: 'Component Architecture & Responsive Layouts',
      type: 'foundation',
      phaseId: 'ph-fe-1',
      description: 'CSS Grid, Flexbox, Tailwind CSS, accessible semantics, and WCAG AA guidelines.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['fe-node-1'],
      skills: ['Tailwind CSS', 'CSS Grid', 'A11y / ARIA', 'Responsive Design'],
      deliverable: 'A pixel-perfect responsive dashboard component supporting keyboard navigation.',
      completionCriteria: ['No layout shifts', 'Lighthouse Accessibility score >= 95'],
      whyItMatters: 'Accessibility and responsive design are table-stakes for product engineering.',
      learningObjectives: ['Build responsive layouts without magic CSS numbers', 'Implement accessible keyboard navigation'],
      confidence: 'high',
      resources: [{ id: 'res-mdn-css', title: 'MDN Web Docs - CSS Grid and Flexbox Layouts', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'fe-node-3',
      title: 'React 19 Hooks, State & Component Lifecycle',
      type: 'technical',
      phaseId: 'ph-fe-2',
      description: 'Custom hooks, useCallback / useMemo mechanics, Context, and state machines.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.15),
      estimatedWeeks: calcWeeks(0.15),
      status: 'blocked',
      prerequisites: ['fe-node-2'],
      skills: ['React 19', 'Custom Hooks', 'State Management (Zustand)', 'Immer'],
      deliverable: 'An interactive kanban board with undo/redo and drag-and-drop state.',
      completionCriteria: ['Prevent unnecessary parent re-renders', 'Clean separation of UI and state logic'],
      whyItMatters: 'Managing client state predictably without render thrashing defines great frontend engineers.',
      learningObjectives: ['Implement custom hooks with memoization', 'Manage global state with lightweight stores like Zustand'],
      confidence: 'high',
      resources: [{ id: 'res-react-dev', title: 'React Official Documentation (react.dev)', url: 'https://react.dev/learn', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'fe-node-4',
      title: 'Next.js App Router, SSR & Server Actions',
      type: 'technical',
      phaseId: 'ph-fe-3',
      description: 'React Server Components, dynamic streaming SSR, routing, metadata SEO, and mutations.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.15),
      estimatedWeeks: calcWeeks(0.15),
      status: 'blocked',
      prerequisites: ['fe-node-3'],
      skills: ['Next.js App Router', 'React Server Components', 'Server Actions', 'Route Handlers'],
      deliverable: 'A full-stack product catalog with server-side pagination, instant search, and optimistic UI updates.',
      completionCriteria: ['Zero client JS for static views', 'Optimistic UI update on favorite/like action'],
      whyItMatters: 'Next.js App Router is the industry standard framework for modern web engineering.',
      learningObjectives: ['Optimize server vs client component boundaries', 'Stream dynamic UI using React Suspense'],
      confidence: 'high',
      resources: [{ id: 'res-next-learn', title: 'Next.js Learn Official Tutorial', url: 'https://nextjs.org/learn', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'fe-node-5',
      title: 'Capstone: High-Performance Fintech / SaaS Dashboard',
      type: 'project',
      phaseId: 'ph-fe-4',
      description: 'Full-stack responsive application with real-time charts, virtualization, and auth.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['fe-node-4'],
      skills: ['Virtualization', 'WebSockets', 'Recharts', 'Design Systems', 'Production Deployment'],
      deliverable: 'A deployed real-time financial trading dashboard with virtualized order books and dark mode.',
      completionCriteria: ['60fps rendering under 1,000 live updates/min', 'Live URL with GitHub README'],
      whyItMatters: 'High-frequency streaming interfaces prove you can handle demanding product requirements.',
      learningObjectives: ['Virtualize long lists for 60fps scrolling', 'Integrate real-time WebSocket feeds cleanly into React state'],
      confidence: 'high',
      resources: [{ id: 'res-web-vitals', title: 'Web.dev Performance and Core Web Vitals Guide', url: 'https://web.dev/explore/fast', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'fe-node-6',
      title: 'Frontend System Design & Technical Interview Prep',
      type: 'interview',
      phaseId: 'ph-fe-5',
      description: 'Live coding problem solving, UI component architecture, caching strategies, and STAR behavioral answers.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['fe-node-5'],
      skills: ['Frontend System Design', 'DOM Coding Interview', 'Web Security (XSS/CSRF)', 'Resume Prep'],
      deliverable: 'Mastery of top 20 UI architecture design prompts (e.g. Design Google Docs, Design Twitter feed).',
      completionCriteria: ['Diagram caching and offline sync layers', 'Deliver 3 mock interview recordings'],
      whyItMatters: 'Landing top frontend roles requires proving architectural maturity beyond copying components.',
      learningObjectives: ['Diagram complex client architectures under interview constraints', 'Defend performance and state synchronization trade-offs'],
      confidence: 'high',
      resources: [{ id: 'res-fe-interview', title: 'GreatFrontEnd Technical Interview Guides', url: 'https://www.greatfrontend.com/', type: 'interactive', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'fe-e1', source: 'fe-node-1', target: 'fe-node-2', relationship: 'prerequisite' },
    { id: 'fe-e2', source: 'fe-node-2', target: 'fe-node-3', relationship: 'prerequisite' },
    { id: 'fe-e3', source: 'fe-node-3', target: 'fe-node-4', relationship: 'prerequisite' },
    { id: 'fe-e4', source: 'fe-node-4', target: 'fe-node-5', relationship: 'prerequisite' },
    { id: 'fe-e5', source: 'fe-node-5', target: 'fe-node-6', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'fe-cp-1',
      title: 'Full-Stack React Production Deploy',
      description: 'Ship a performant Next.js app with server-side rendering and optimistic UX.',
      criteria: ['Core Web Vitals all green', 'Live deployed on Vercel or cloud'],
      estimatedWeek: Math.round(totalWeeks * 0.75),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'fe-ins-1',
      title: 'Focus on System Design over Basic CSS Tricks',
      description: `For ${target.role} at top product firms, interviewers focus on state management at scale and SSR trade-offs rather than memorized CSS syntax.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 6: BACKEND / GENERAL SOFTWARE ENGINEER
// ============================================================================
function buildBackendRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    { id: 'ph-be-1', title: 'Phase 1: Foundations & Systems Programming', description: 'Core programming language, data structures, concurrency, and Git.', order: 1, estimatedHours: calcHours(0.2), estimatedWeeks: calcWeeks(0.2) },
    { id: 'ph-be-2', title: 'Phase 2: Relational Databases & API Architecture', description: 'PostgreSQL, indexing, transactions, and REST/gRPC microservice design.', order: 2, estimatedHours: calcHours(0.25), estimatedWeeks: calcWeeks(0.25) },
    { id: 'ph-be-3', title: 'Phase 3: Distributed Systems, Caching & Queues', description: 'Redis caching, message brokers (Kafka/RabbitMQ), and asynchronous processing.', order: 3, estimatedHours: calcHours(0.25), estimatedWeeks: calcWeeks(0.25) },
    { id: 'ph-be-4', title: 'Phase 4: Capstone Distributed System & Docker Deployment', description: 'High-throughput fault-tolerant service deployed with automated CI/CD.', order: 4, estimatedHours: calcHours(0.18), estimatedWeeks: calcWeeks(0.18) },
    { id: 'ph-be-5', title: 'Phase 5: Backend System Design & Interview Prep', description: 'Distributed system design (CAP theorem, sharding, caching) and coding rounds.', order: 5, estimatedHours: calcHours(0.12), estimatedWeeks: calcWeeks(0.12) },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'be-node-1',
      title: `Foundations of Modern ${personalization.preferredLanguage || 'Programming'}`,
      type: 'foundation',
      phaseId: 'ph-be-1',
      description: 'Master core language syntax, concurrency primitives, memory management, and testing frameworks.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'available',
      prerequisites: [],
      skills: [personalization.preferredLanguage || 'Python', 'Data Structures', 'Concurrency', 'Git', 'Testing'],
      deliverable: 'A clean GitHub utility package with modular algorithms and automated tests.',
      completionCriteria: ['Passing automated test suite', 'Adherence to clean code architecture'],
      whyItMatters: 'Foundational mastery of algorithms and language semantics is required for all backend engineering.',
      learningObjectives: ['Implement thread-safe or asynchronous concurrency primitives', 'Write unit tests covering edge cases and race conditions'],
      confidence: 'high',
      resources: [{ id: 'res-be-core', title: `Official ${personalization.preferredLanguage || 'Python'} Documentation`, url: 'https://docs.python.org/3/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'be-node-2',
      title: 'Relational Database Engineering & Schema Design',
      type: 'foundation',
      phaseId: 'ph-be-2',
      description: 'PostgreSQL, normalization, ACID transactions, composite indexing, and query optimization.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['be-node-1'],
      skills: ['PostgreSQL', 'Transactions & Isolation Levels', 'Query Optimization', 'Indexes (B-Tree/GIN)'],
      deliverable: 'A relational database schema for high-concurrency order processing with transactional guarantees.',
      completionCriteria: ['Zero deadlocks under concurrent write simulation', 'P95 query response time < 10ms'],
      whyItMatters: 'Databases are the hardest part of backend engineering to scale and migrate safely.',
      learningObjectives: ['Select appropriate transaction isolation levels', 'Profile slow queries using EXPLAIN ANALYZE'],
      confidence: 'high',
      resources: [{ id: 'res-pg-internals', title: 'Use The Index, Luke! - Database Performance Guide', url: 'https://use-the-index-luke.com/', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'be-node-3',
      title: 'Microservices & High-Throughput REST / gRPC APIs',
      type: 'technical',
      phaseId: 'ph-be-2',
      description: 'API design, Protobuf / gRPC, connection pooling, middleware authentication, and graceful degradation.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.13),
      estimatedWeeks: calcWeeks(0.13),
      status: 'blocked',
      prerequisites: ['be-node-1', 'be-node-2'],
      skills: ['gRPC / Protobuf', 'REST Architecture', 'Connection Pooling', 'Middleware'],
      deliverable: 'A high-throughput API gateway and microservice communicating via gRPC with bidirectional streaming.',
      completionCriteria: ['Handles 1,000 requests/sec with P99 latency < 50ms', 'Comprehensive OpenAPI / gRPC documentation'],
      whyItMatters: 'Inter-service communication speed directly impacts user-facing application latency.',
      learningObjectives: ['Design backward-compatible protobuf contracts', 'Implement connection pooling and circuit breakers'],
      confidence: 'high',
      resources: [{ id: 'res-grpc-guide', title: 'Official gRPC Documentation & Quickstart', url: 'https://grpc.io/docs/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'be-node-4',
      title: 'Distributed Caching & Message Queue Architecture',
      type: 'technical',
      phaseId: 'ph-be-3',
      description: 'Redis caching strategies (Cache-Aside, Write-Through), message brokers (RabbitMQ/Kafka), and idempotent workers.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.15),
      estimatedWeeks: calcWeeks(0.15),
      status: 'blocked',
      prerequisites: ['be-node-2', 'be-node-3'],
      skills: ['Redis Caching', 'Kafka / RabbitMQ', 'Idempotency', 'Event-Driven Architecture'],
      deliverable: 'An event-driven background processing pipeline processing asynchronous tasks with at-least-once delivery.',
      completionCriteria: ['Handles simulated worker crashes without lost messages', 'Idempotent worker execution verified'],
      whyItMatters: 'Asynchronous decoupling prevents web APIs from blocking during long-running tasks.',
      learningObjectives: ['Implement cache invalidation patterns without stampedes', 'Handle poison messages with dead-letter queues'],
      confidence: 'high',
      resources: [{ id: 'res-redis-patterns', title: 'Redis University - Caching Architecture Patterns', url: 'https://university.redis.com/', type: 'interactive', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'be-node-5',
      title: 'Capstone: Production High-Throughput Distributed Microservice',
      type: 'project',
      phaseId: 'ph-be-4',
      description: 'Complete containerized distributed system with database replication, Redis caching, message queue, and Docker deployment.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['be-node-3', 'be-node-4'],
      skills: ['Distributed Architecture', 'Docker Compose', 'Redis Cache', 'Database Replication', 'Live Cloud Deploy'],
      deliverable: 'A deployed distributed microservice stack with live load test results, GitHub repository, and architecture documentation.',
      completionCriteria: ['Live deployed service accessible via public URL', 'CI/CD pipeline passing with integration tests'],
      whyItMatters: 'Proves you can architect resilient, fault-tolerant systems ready for high-volume enterprise production.',
      learningObjectives: ['Orchestrate multi-container backend stacks', 'Document system design and benchmark latency under load'],
      confidence: 'high',
      resources: [{ id: 'res-ddia', title: 'Designing Data-Intensive Applications (Martin Kleppmann)', url: 'https://dataintensive.net/', type: 'book', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'be-node-6',
      title: 'Backend System Design & Technical Interview Readiness',
      type: 'interview',
      phaseId: 'ph-be-5',
      description: 'Large-scale system design (Design URL Shortener, Design Rate Limiter, Distributed Locking), data structures, and algorithms.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['be-node-5'],
      skills: ['System Design (CAP Theorem)', 'Distributed Sharding', 'Data Structures & Algorithms', 'STAR Defense'],
      deliverable: 'System design notebook diagramming 15 distributed architectures with estimated QPS and storage capacities.',
      completionCriteria: ['Score 4/5 on mock system design rubric', 'Flawless calculation of read/write bandwidth and sharding keys'],
      whyItMatters: 'System design determines whether you get hired as a junior coder or a senior backend architect.',
      learningObjectives: ['Estimate QPS, network bandwidth, and storage capacity under 45-minute interview constraints', 'Defend consistency vs availability trade-offs (CAP theorem)'],
      confidence: 'high',
      resources: [{ id: 'res-system-design-primer', title: 'The System Design Primer (Donne Martin)', url: 'https://github.com/donnemartin/system-design-primer', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'be-e1', source: 'be-node-1', target: 'be-node-2', relationship: 'prerequisite' },
    { id: 'be-e2', source: 'be-node-1', target: 'be-node-3', relationship: 'prerequisite' },
    { id: 'be-e3', source: 'be-node-2', target: 'be-node-3', relationship: 'prerequisite' },
    { id: 'be-e4', source: 'be-node-2', target: 'be-node-4', relationship: 'prerequisite' },
    { id: 'be-e5', source: 'be-node-3', target: 'be-node-4', relationship: 'prerequisite' },
    { id: 'be-e6', source: 'be-node-3', target: 'be-node-5', relationship: 'prerequisite' },
    { id: 'be-e7', source: 'be-node-4', target: 'be-node-5', relationship: 'prerequisite' },
    { id: 'be-e8', source: 'be-node-5', target: 'be-node-6', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'be-cp-1',
      title: 'Distributed Backend System Deploy Checkpoint',
      description: 'Ship a containerized microservice with database caching and message queue workers.',
      criteria: ['Load test passes 1,000 req/sec', 'Zero unhandled exceptions during queue worker failure'],
      estimatedWeek: Math.round(totalWeeks * 0.75),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'be-ins-1',
      title: 'Scalability & Consistency Trade-offs',
      description: `For ${target.role}, recruiters evaluate candidate understanding of data consistency, transaction boundaries, and caching invalidation far more than simple CRUD framework knowledge.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

// ============================================================================
// ARCHETYPE 7: DATA ENGINEER (Spark, Kafka, SQL, Airflow, Lakehouse, dbt)
// ============================================================================
function buildDataEngineerRoadmap(
  target: TargetDestination,
  personalization: UserPersonalization,
  totalWeeks: number,
  totalBudgetHours: number
) {
  const calcHours = (weight: number) => Math.round(totalBudgetHours * weight);
  const calcWeeks = (weight: number) => Math.max(1, Math.round(totalWeeks * weight));

  const phases: RoadmapPhase[] = [
    {
      id: 'ph-de-1',
      title: 'Phase 1: Python, Linux & Dimensional Data Modeling',
      description: 'Linux shell data tooling, Python data pipelines, advanced SQL, and Star/Snowflake schemas.',
      order: 1,
      estimatedHours: calcHours(0.22),
      estimatedWeeks: calcWeeks(0.22),
    },
    {
      id: 'ph-de-2',
      title: 'Phase 2: Distributed Processing with Apache Spark',
      description: 'PySpark DataFrames, Catalyst optimizer, partitioning, shuffles, and broadcast joins.',
      order: 2,
      estimatedHours: calcHours(0.24),
      estimatedWeeks: calcWeeks(0.24),
    },
    {
      id: 'ph-de-3',
      title: 'Phase 3: Real-Time Event Streaming & Modern Lakehouse',
      description: 'Apache Kafka event pipelines, Delta Lake ACID transactions, and dbt medallion layers.',
      order: 3,
      estimatedHours: calcHours(0.25),
      estimatedWeeks: calcWeeks(0.25),
    },
    {
      id: 'ph-de-4',
      title: 'Phase 4: Workflow Orchestration & Lakehouse Capstone',
      description: 'Apache Airflow DAG scheduling, backfills, telemetry, and end-to-end streaming capstone platform.',
      order: 4,
      estimatedHours: calcHours(0.19),
      estimatedWeeks: calcWeeks(0.19),
    },
    {
      id: 'ph-de-5',
      title: 'Phase 5: Data Architecture System Design & Interviews',
      description: 'Lambda vs Kappa architecture, storage formats (Parquet), and distributed system interviews.',
      order: 5,
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
    },
  ];

  const nodes: RoadmapNode[] = [
    {
      id: 'de-node-1',
      title: 'Foundations of Modern Python & Linux for Data Pipelines',
      type: 'foundation',
      phaseId: 'ph-de-1',
      description: 'Modern Python 3.12, Linux CLI text processing (awk/sed/jq), virtual environments (uv), and Git branching hygiene.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'available',
      prerequisites: [],
      skills: ['Python 3.12', 'Linux Shell', 'Data Ingestion', 'Git Workflow', 'Pytest'],
      deliverable: 'A CLI data ingestion utility that cleanses and normalizes multi-source raw logs into Parquet format.',
      completionCriteria: ['100% test coverage on data validation routines', 'Automated Makefile for local containerized execution'],
      whyItMatters: 'Data engineers must automate ingestion pipelines with high reliability and reproducible execution environments.',
      learningObjectives: ['Process large text streams in Linux without memory exhaustion', 'Enforce data contracts with automated validation'],
      confidence: 'high',
      resources: [{ id: 'res-de-linux', title: 'Data Engineering with Python & Linux Guide', url: 'https://github.com/datastacktv/data-engineer-roadmap', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-2',
      title: 'Advanced SQL, Dimensional Modeling & Query Optimization',
      type: 'foundation',
      phaseId: 'ph-de-1',
      description: 'Window functions, CTEs, Kimball dimensional modeling, Star/Snowflake schemas, and query execution plans.',
      importance: 'essential',
      difficulty: 'beginner',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['de-node-1'],
      skills: ['PostgreSQL', 'Dimensional Modeling (Kimball)', 'Window Functions', 'Partitioning', 'EXPLAIN ANALYZE'],
      deliverable: 'A Kimball Star Schema data warehouse model with Fact and Dimension tables and optimized reporting views.',
      completionCriteria: ['Zero table scans on multi-million row joins', 'Proper Slowly Changing Dimension (SCD Type 2) implementation'],
      whyItMatters: 'Clean dimensional modeling provides the analytical foundation for all downstream BI and machine learning.',
      learningObjectives: ['Design Kimball dimensional schemas with surrogate keys', 'Optimize complex analytical window queries'],
      confidence: 'high',
      resources: [{ id: 'res-kimball', title: 'The Data Warehouse Toolkit (Ralph Kimball Overview)', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-3',
      title: 'Distributed Processing with PySpark & DataFrames',
      type: 'technical',
      phaseId: 'ph-de-2',
      description: 'PySpark architecture, Catalyst query optimizer, RDD vs DataFrame APIs, broadcast joins, and shuffle tuning.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.14),
      estimatedWeeks: calcWeeks(0.14),
      status: 'blocked',
      prerequisites: ['de-node-1', 'de-node-2'],
      skills: ['Apache Spark', 'PySpark', 'Catalyst Optimizer', 'Partition Pruning', 'Shuffle Tuning'],
      deliverable: 'A PySpark batch processing pipeline transforming 50GB of raw transactional events into optimized partitioned Parquet.',
      completionCriteria: ['Eliminate Spark OOM executor failures using salting and broadcast joins', 'Execution time under 8 minutes on benchmark dataset'],
      whyItMatters: 'Apache Spark is the industry standard engine for distributed big data processing across modern enterprises.',
      learningObjectives: ['Diagnose and eliminate data skew with partition salting', 'Leverage Catalyst optimization plans and broadcast joins'],
      confidence: 'high',
      resources: [{ id: 'res-spark-docs', title: 'Apache Spark Official Documentation & PySpark Guide', url: 'https://spark.apache.org/docs/latest/api/python/', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-4',
      title: 'Real-Time Event Streaming with Apache Kafka',
      type: 'technical',
      phaseId: 'ph-de-3',
      description: 'Kafka architecture, topic partitions, producer acknowledgments, consumer groups, offsets, and schema registry.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.12),
      estimatedWeeks: calcWeeks(0.12),
      status: 'blocked',
      prerequisites: ['de-node-1'],
      skills: ['Apache Kafka', 'Event Streaming', 'Consumer Groups', 'Avro / Schema Registry', 'Partition Strategy'],
      deliverable: 'A high-throughput Kafka event streaming producer and consumer pipeline with Avro schema registry validation.',
      completionCriteria: ['Throughput benchmark exceeding 10,000 events/sec', 'Zero message loss under simulated consumer rebalance'],
      whyItMatters: 'Real-time telemetry and CDC data streams are essential for instant operational decision making.',
      learningObjectives: ['Design partition strategies for high-cardinality event streams', 'Enforce schema evolution rules with Avro and Schema Registry'],
      confidence: 'high',
      resources: [{ id: 'res-kafka-guide', title: 'Confluent Kafka Definitive Architecture Guide', url: 'https://developer.confluent.io/learn/kafka-foundations/', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-5',
      title: 'Modern Lakehouse Engineering with Delta Lake & dbt',
      type: 'technical',
      phaseId: 'ph-de-3',
      description: 'Delta Lake ACID transactions, time travel, Medallion Architecture (Bronze -> Silver -> Gold), and dbt transformation workflows.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.13),
      estimatedWeeks: calcWeeks(0.13),
      status: 'blocked',
      prerequisites: ['de-node-2', 'de-node-3', 'de-node-4'],
      skills: ['Delta Lake', 'dbt (data build tool)', 'Medallion Architecture', 'ACID Lakehouse', 'Data Quality Testing'],
      deliverable: 'A Medallion Lakehouse pipeline using Delta Lake with dbt data transformations and automated schema tests.',
      completionCriteria: ['Automated dbt test suite passing 20+ integrity checks', 'Time-travel query demonstrating point-in-time recovery'],
      whyItMatters: 'Lakehouses combine the reliability of data warehouses with the cost efficiency and scale of object lakes.',
      learningObjectives: ['Structure Bronze (raw), Silver (cleansed), and Gold (aggregated) layers', 'Automate data quality testing and documentation with dbt'],
      confidence: 'high',
      resources: [{ id: 'res-delta-lake', title: 'Delta Lake Official Documentation & Architecture', url: 'https://docs.delta.io/latest/index.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-6',
      title: 'Workflow Orchestration with Apache Airflow / Dagster',
      type: 'technical',
      phaseId: 'ph-de-4',
      description: 'Directed Acyclic Graphs (DAGs), task dependencies, sensors, custom operators, dynamic task mapping, and automated backfills.',
      importance: 'essential',
      difficulty: 'intermediate',
      estimatedHours: calcHours(0.11),
      estimatedWeeks: calcWeeks(0.11),
      status: 'blocked',
      prerequisites: ['de-node-2', 'de-node-5'],
      skills: ['Apache Airflow', 'DAG Authoring', 'Task Mapping', 'Backfilling', 'Slack Alerting'],
      deliverable: 'A resilient, idempotent Airflow DAG pipeline with automated retry policies, SLA monitoring, and alerting hooks.',
      completionCriteria: ['Pipeline safely recovers from intermediate task failure without re-running completed tasks', 'Automated backfill execution verified'],
      whyItMatters: 'Unorchestrated pipelines break silently. Airflow guarantees timely, visible, and idempotent pipeline execution.',
      learningObjectives: ['Author declarative, idempotent Airflow DAGs', 'Implement dynamic task mapping and conditional branching'],
      confidence: 'high',
      resources: [{ id: 'res-airflow-docs', title: 'Apache Airflow Core Concepts & Tutorial', url: 'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-7',
      title: 'Capstone: End-to-End Real-Time Streaming Lakehouse Platform',
      type: 'project',
      phaseId: 'ph-de-4',
      description: 'Build a production streaming lakehouse platform integrating Kafka ingestion, Spark Structured Streaming, Delta Lake storage, dbt modeling, and Airflow orchestration.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.18),
      estimatedWeeks: calcWeeks(0.18),
      status: 'blocked',
      prerequisites: ['de-node-4', 'de-node-5', 'de-node-6'],
      skills: ['Full-Stack Data Engineering', 'Kafka Streaming', 'Delta Lake Medallion', 'dbt Transformation', 'Airflow CI/CD'],
      deliverable: 'A fully containerized streaming lakehouse repository with architecture diagrams, sample data generation, live metrics, and CI/CD.',
      completionCriteria: ['Sub-second latency from Kafka ingestion to Delta Bronze table', 'Automated CI/CD pipeline verifying dbt models and Airflow DAGs'],
      whyItMatters: 'Demonstrates end-to-end technical mastery across the entire modern enterprise data stack.',
      learningObjectives: ['Architect multi-engine data platforms', 'Implement real-time CDC and streaming transformations in production'],
      confidence: 'high',
      resources: [{ id: 'res-lakehouse-patterns', title: 'Modern Data Architecture with Delta Lake & Spark', url: 'https://www.databricks.com/glossary/lakehouse', type: 'documentation', cost: 'free', verificationStatus: 'verified' }],
    },
    {
      id: 'de-node-8',
      title: 'Data Architecture System Design & Technical Defense',
      type: 'interview',
      phaseId: 'ph-de-5',
      description: 'Big data system design (Design Uber rides data pipeline, Design Netflix video telemetry, Design Real-Time Metrics), SQL rounds, and STAR defense.',
      importance: 'essential',
      difficulty: 'advanced',
      estimatedHours: calcHours(0.1),
      estimatedWeeks: calcWeeks(0.1),
      status: 'blocked',
      prerequisites: ['de-node-7'],
      skills: ['Big Data System Design', 'Storage Optimization (Parquet/ORC)', 'Partitioning & Sharding', 'STAR Behavioral Defense'],
      deliverable: 'A technical interview playbook with 12 solved big data architectures and recorded mock interview defense.',
      completionCriteria: ['Score 4/5 on mock big data system design rubric', 'Clear calculation of daily data volume, storage retention, and cluster sizing'],
      whyItMatters: 'Data engineering interviews focus heavily on storage cost trade-offs, network shuffles, and failure recovery.',
      learningObjectives: ['Calculate storage compression, compute cost, and throughput for petabyte-scale systems', 'Defend batch vs streaming architecture trade-offs under high-pressure interview settings'],
      confidence: 'high',
      resources: [{ id: 'res-de-interviews', title: 'Data Engineering Interview Guide & System Design Cases', url: 'https://github.com/alexeygrigorev/data-engineering-zoomcamp', type: 'tutorial', cost: 'free', verificationStatus: 'verified' }],
    },
  ];

  const edges: RoadmapEdge[] = [
    { id: 'de-e1', source: 'de-node-1', target: 'de-node-2', relationship: 'prerequisite' },
    { id: 'de-e1b', source: 'de-node-1', target: 'de-node-4', relationship: 'prerequisite' },
    { id: 'de-e2', source: 'de-node-1', target: 'de-node-3', relationship: 'prerequisite' },
    { id: 'de-e2b', source: 'de-node-2', target: 'de-node-3', relationship: 'prerequisite' },
    { id: 'de-e3', source: 'de-node-3', target: 'de-node-5', relationship: 'prerequisite' },
    { id: 'de-e4', source: 'de-node-4', target: 'de-node-5', relationship: 'prerequisite' },
    { id: 'de-e5', source: 'de-node-2', target: 'de-node-6', relationship: 'prerequisite' },
    { id: 'de-e6', source: 'de-node-5', target: 'de-node-6', relationship: 'prerequisite' },
    { id: 'de-e7', source: 'de-node-5', target: 'de-node-7', relationship: 'prerequisite' },
    { id: 'de-e8', source: 'de-node-6', target: 'de-node-7', relationship: 'prerequisite' },
    { id: 'de-e9', source: 'de-node-7', target: 'de-node-8', relationship: 'prerequisite' },
  ];

  const checkpoints: CareerCheckpoint[] = [
    {
      id: 'de-cp-1',
      title: 'Streaming & Medallion Lakehouse Deployment Checkpoint',
      description: 'Ship an end-to-end Kafka streaming pipeline into Delta Lake with dbt transformations.',
      criteria: ['Kafka producer/consumer running with zero message loss', 'dbt test suite passing 100%'],
      estimatedWeek: Math.round(totalWeeks * 0.5),
    },
  ];

  const insights: CareerInsight[] = [
    {
      id: 'de-ins-1',
      title: 'Data Reliability & Idempotency Over Hype',
      description: `For ${target.role}, engineering teams test your ability to build idempotent, self-healing pipelines that never produce duplicate or corrupt downstream data.`,
      type: 'recommendation',
    },
  ];

  return { phases, nodes, edges, checkpoints, insights };
}

