import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { synthesizeDynamicRoadmap } from '@/lib/ai-generator';
import { RoleComparisonData } from '@/types/roadmap';

const CompareRequestSchema = z.object({
  roleA: z.string().min(2),
  roleB: z.string().min(2),
  hoursPerWeek: z.number().default(10),
  targetMonths: z.number().default(6),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CompareRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid comparison parameters' }, { status: 400 });
    }

    const { roleA, roleB, hoursPerWeek, targetMonths } = parsed.data;

    // Generate dynamic roadmaps for both roles
    const roadmapA = synthesizeDynamicRoadmap(
      {
        role: roleA,
        industry: 'Technology',
        companyType: 'High-growth Product Company',
        location: 'Global / Remote',
        seniority: 'Entry to Associate',
      },
      {
        hoursPerWeek,
        targetMonths,
        startingLevel: 'beginner',
        masteredSkills: [],
        learningSkills: [],
        programmingExperience: '1 year of coding',
        preferredLanguage: 'Python',
        preferredLearningStyle: 'project-first',
        freeResourcesOnly: true,
        assumptions: [],
      }
    );

    const roadmapB = synthesizeDynamicRoadmap(
      {
        role: roleB,
        industry: 'Technology',
        companyType: 'High-growth Product Company',
        location: 'Global / Remote',
        seniority: 'Entry to Associate',
      },
      {
        hoursPerWeek,
        targetMonths,
        startingLevel: 'beginner',
        masteredSkills: [],
        learningSkills: [],
        programmingExperience: '1 year of coding',
        preferredLanguage: 'Python',
        preferredLearningStyle: 'project-first',
        freeResourcesOnly: true,
        assumptions: [],
      }
    );

    const skillsA = new Set(roadmapA.nodes.flatMap((n) => n.skills));
    const skillsB = new Set(roadmapB.nodes.flatMap((n) => n.skills));

    const sharedSkills: string[] = [];
    const uniqueToA: string[] = [];
    const uniqueToB: string[] = [];

    for (const skill of skillsA) {
      if (skillsB.has(skill)) {
        sharedSkills.push(skill);
      } else {
        uniqueToA.push(skill);
      }
    }

    for (const skill of skillsB) {
      if (!skillsA.has(skill)) {
        uniqueToB.push(skill);
      }
    }

    const overlapPercentage =
      skillsA.size > 0 ? Math.round((sharedSkills.length / Math.max(skillsA.size, skillsB.size)) * 100) : 50;

    const hoursA = roadmapA.summary.estimatedTotalHours;
    const hoursB = roadmapB.summary.estimatedTotalHours;
    const effortDelta = Math.abs(hoursA - hoursB);

    const comparison: RoleComparisonData = {
      roleA: {
        title: roleA,
        roadmap: roadmapA,
      },
      roleB: {
        title: roleB,
        roadmap: roadmapB,
      },
      sharedSkills: sharedSkills.length > 0 ? sharedSkills : ['Programming Foundations', 'Git & GitHub', 'System Architecture', 'Testing'],
      uniqueToA: uniqueToA.length > 0 ? uniqueToA.slice(0, 6) : [`Core ${roleA} Frameworks`, 'Domain Specialization'],
      uniqueToB: uniqueToB.length > 0 ? uniqueToB.slice(0, 6) : [`Core ${roleB} Frameworks`, 'Domain Specialization'],
      sharedProjects: [
        'Production Containerization & Microservice Deployment',
        'End-to-End Automated Testing & CI/CD Pipeline',
      ],
      prerequisiteOverlapPercentage: Math.max(35, overlapPercentage),
      effortDeltaHours: effortDelta,
      careerFlexibilityScore: Math.min(95, Math.max(45, overlapPercentage + 15)),
      interviewFocusDifferences: [
        {
          role: roleA,
          focus: [`Domain architecture for ${roleA}`, 'Practical algorithmic implementation', 'Code structure & hygiene'],
        },
        {
          role: roleB,
          focus: [`Domain architecture for ${roleB}`, 'System performance & scalability', 'Data pipelines & state handling'],
        },
      ],
      strategicAdvice: `Both roles share strong technical foundations. Mastering the shared prerequisites keeps your career highly flexible—you can switch between ${roleA} and ${roleB} with only ~${Math.round(hoursB * 0.35)} additional hours of targeted portfolio work.`,
    };

    return NextResponse.json({ success: true, comparison });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
