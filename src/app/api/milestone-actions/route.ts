import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ActionRequestSchema = z.object({
  action: z.enum(['study_plan', 'weekend_project', 'interview_questions']),
  milestoneTitle: z.string(),
  milestoneDescription: z.string().optional(),
  targetRole: z.string(),
  skills: z.array(z.string()).default([]),
  difficulty: z.string().default('intermediate'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ActionRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { action, milestoneTitle, targetRole, skills, difficulty } = parsed.data;

    if (action === 'study_plan') {
      return NextResponse.json({
        success: true,
        action,
        data: {
          title: `Intensive 7-Day Study Plan: ${milestoneTitle}`,
          targetRole,
          overview: `Designed to take you from foundational understanding to verifiable code implementation in ${skills.join(', ') || milestoneTitle}.`,
          schedule: [
            { day: 'Day 1-2', focus: 'Core Theory & Official Docs', tasks: ['Read official documentation', 'Take notes on edge cases', 'Implement minimal toy examples'] },
            { day: 'Day 3-4', focus: 'Real-world Architecture & Patterns', tasks: ['Analyze open-source implementations on GitHub', 'Write reusable modules with strict typing', 'Write unit tests'] },
            { day: 'Day 5-6', focus: 'Hands-on Deliverable Build', tasks: ['Assemble the milestone deliverable project', 'Benchmark performance and latency', 'Conduct code review against standards'] },
            { day: 'Day 7', focus: 'Interview Defense & Reflection', tasks: ['Practice answering top 5 interview questions out loud', 'Push clean commit to GitHub with README', 'Record 60s demo'] },
          ],
        },
      });
    }

    if (action === 'weekend_project') {
      return NextResponse.json({
        success: true,
        action,
        data: {
          title: `Production Mini-System: ${milestoneTitle}`,
          problemStatement: `Hiring teams for ${targetRole} evaluate whether you can build demonstrable applications, not just pass tutorials.`,
          techStack: skills.length > 0 ? skills : ['Python', 'Docker', 'FastAPI'],
          estimatedHours: 8,
          difficulty,
          features: [
            'Modular pipeline design with separation of concerns',
            'Automated input validation and structured error logs',
            'Lightweight benchmarking script tracking throughput and memory usage',
          ],
          acceptanceCriteria: [
            'Runs with a single command or Docker run',
            'Comprehensive README with architecture diagram',
          ],
        },
      });
    }

    if (action === 'interview_questions') {
      return NextResponse.json({
        success: true,
        action,
        data: {
          role: targetRole,
          milestone: milestoneTitle,
          questions: [
            {
              question: `How would you explain the core architectural trade-offs of ${milestoneTitle} to a non-technical stakeholder vs a principal engineer?`,
              framework: 'Lead with the business impact (reliability/cost), followed by the technical trade-off (latency vs complexity).',
              redFlags: 'Giving purely textbook definitions without mentioning real-world engineering constraints.',
            },
            {
              question: `What is the most insidious bug or performance degradation you have encountered when utilizing ${skills[0] || 'this technology'} in production?`,
              framework: 'Describe the symptom, the debugging tool used (profiler/logs), the root cause, and the permanent mitigation.',
              redFlags: 'Claiming you never ran into any bugs or giving a trivial typo example.',
            },
            {
              question: `If incoming traffic or data volume scaled 100x, where would ${milestoneTitle} become the bottleneck?`,
              framework: 'Identify memory limits, network I/O, or database lock contention, and propose sharding, caching, or streaming.',
              redFlags: 'Saying "I would just add more RAM" without architectural depth.',
            },
          ],
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
