import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectBrief } from '@/types/roadmap';

const ProjectRequestSchema = z.object({
  targetRole: z.string().min(2),
  milestoneTitle: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  size: z.enum(['weekend', 'one_week', 'two_week', 'capstone']).default('weekend'),
  preferredStack: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ProjectRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { targetRole, milestoneTitle, difficulty, size, preferredStack } = parsed.data;

    const sizeHoursMap = {
      weekend: 8,
      one_week: 20,
      two_week: 40,
      capstone: 80,
    };

    const roleLower = targetRole.toLowerCase();
    const stack = preferredStack ? preferredStack.split(',').map((s) => s.trim()) : [];

    let title = `${targetRole} Production Portfolio System`;
    let problemStatement = `High-volume systems require fault-tolerant pipelines with observable metrics.`;
    let recommendedStack = stack.length > 0 ? stack : ['Python', 'FastAPI', 'Docker', 'PostgreSQL'];

    if (roleLower.includes('frontend') || roleLower.includes('react')) {
      title = `Real-time Telemetry Analytics Dashboard`;
      problemStatement = `Modern engineering teams require live visibility into distributed service metrics without browser lag or frame drops.`;
      recommendedStack = stack.length > 0 ? stack : ['Next.js App Router', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Recharts'];
    } else if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('ml')) {
      title = `Autonomous Hybrid RAG & Verification Engine`;
      problemStatement = `Enterprise LLM applications suffer from hallucinations and outdated context when querying private proprietary knowledge bases.`;
      recommendedStack = stack.length > 0 ? stack : ['Python', 'FastAPI', 'Qdrant Vector DB', 'PyTorch', 'Docker'];
    } else if (roleLower.includes('backend') || roleLower.includes('data engineer')) {
      title = `Distributed Event-Driven Ingestion Engine`;
      problemStatement = `Handling bursty webhook traffic without losing customer transactions requires reliable message queues and idempotent processing.`;
      recommendedStack = stack.length > 0 ? stack : ['Go / Node.js', 'Redis PubSub', 'PostgreSQL', 'Docker Compose'];
    }

    if (milestoneTitle) {
      title = `${milestoneTitle}: Production Micro-Service`;
    }

    const brief: ProjectBrief = {
      id: `proj-${Date.now()}`,
      title,
      problemStatement,
      whyItMatters: `This project directly addresses senior interviewers looking for evidence of system design maturity, resilience, and clean code hygiene.`,
      targetRole,
      targetSkills: recommendedStack,
      difficulty,
      size,
      estimatedHours: sizeHoursMap[size],
      recommendedStack,
      featureRequirements: [
        'Robust input schema validation with structured JSON error responses',
        'Asynchronous core execution pipeline with bounded memory consumption',
        'Structured logging and Prometheus / OpenTelemetry metrics endpoint',
        'Automated unit & integration test suite passing with high coverage',
      ],
      optionalAdvancedFeatures: [
        'Distributed Redis caching layer with intelligent TTL invalidation',
        'Circuit breaker pattern for upstream dependencies with graceful degradation',
        'End-to-end benchmarking harness simulating concurrent burst traffic',
      ],
      architectureOverview: `Modular hexagonal architecture: Ingestion / Transport Layer (REST/WebSocket) -> Domain Service Core -> Storage / Vector Adapter -> Observability Middleware.`,
      implementationPhases: [
        {
          phase: 'Phase 1: Architecture & Data Contracts',
          tasks: ['Define Pydantic/TypeScript schemas', 'Set up Git repo, linting, and CI config', 'Create local container compose environment'],
        },
        {
          phase: 'Phase 2: Core Engine & Business Logic',
          tasks: ['Implement core processing pipeline', 'Integrate database / vector storage layer', 'Write unit tests for edge cases'],
        },
        {
          phase: 'Phase 3: Hardening & Performance',
          tasks: ['Implement caching and rate limiting', 'Profile memory and latency under load', 'Add automated health checks'],
        },
        {
          phase: 'Phase 4: Showcase & Interview Readiness',
          tasks: ['Deploy live container to cloud provider', 'Draft comprehensive README with Mermaid architecture diagram', 'Record 90-second video walkthrough'],
        },
      ],
      acceptanceCriteria: [
        'Application spins up with a single docker-compose up or npm run dev command',
        'All automated test suites pass without warnings',
        'Live Swagger / OpenAPI documentation accessible',
      ],
      testingRequirements: [
        'Unit test coverage >= 80% on business logic',
        'Integration tests validating edge failure payloads and timeout handling',
      ],
      readmeOutline: `# Project Name\n\n## Overview\nProblem statement and business value.\n\n## Architecture Diagram\nMermaid diagram explaining data flow.\n\n## Tech Stack\nKey technologies chosen and rationale.\n\n## Benchmarks\nLatency, throughput, and memory consumption stats.\n\n## Quickstart\nStep-by-step setup instructions.\n\n## Trade-offs & Future Work\nKey design decisions and what would change at 100x scale.`,
      portfolioPresentationAdvice: `Lead with the problem statement and the quantitative outcome (e.g. "reduced p95 latency by 40%"). Provide a live click-through link and a 90-second Loom/YouTube walkthrough.`,
      interviewDiscussionPoints: [
        'Why did you choose this tech stack over alternative libraries?',
        'How does your system prevent memory leaks or cascading failures?',
        'What would be the first bottleneck if traffic increased 50x?',
      ],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, project: brief });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
