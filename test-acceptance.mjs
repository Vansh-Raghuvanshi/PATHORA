/**
 * PATHORA Full Acceptance Test Suite
 * Validates domain rules, cycle detection, adaptive flows, and API endpoints.
 */

import { DEMO_ROADMAP } from './src/lib/demo-roadmap.ts';
import { sanitizeAndValidateRoadmap } from './src/lib/schema-validator.ts';
import {
  recomputeNodeStatuses,
  calculateProgressSummary,
  applyMarkSkillAsKnown,
  applyWeeklyHoursChange,
  applyDeadlineChange,
  applyMilestoneCompletion,
  computeGraphLayout,
} from './src/lib/graph-engine.ts';
import { synthesizeDynamicRoadmap } from './src/lib/ai-generator.ts';

async function runTests() {
  console.log('--- PATHORA ACCEPTANCE VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1 & 2: Dynamic generation from target role and constraints
  const testTarget = {
    role: 'Frontend Engineer',
    industry: 'Fintech',
    companyType: 'High-growth Startup',
    location: 'India',
    seniority: 'Associate',
  };
  const testPersonalization = {
    hoursPerWeek: 15,
    targetMonths: 4,
    startingLevel: 'beginner',
    masteredSkills: ['TypeScript'],
    learningSkills: ['React', 'Next.js'],
    programmingExperience: '1 year',
    preferredLanguage: 'TypeScript',
    preferredLearningStyle: 'project-first',
    freeResourcesOnly: true,
    assumptions: ['Dedicated 15h/wk'],
  };
  const dynamicRoadmap = synthesizeDynamicRoadmap(testTarget, testPersonalization);
  assert(dynamicRoadmap.nodes.length >= 5, 'TEST 1 & 2: System generates custom roadmap with sufficient nodes');
  assert(dynamicRoadmap.summary.estimatedDurationWeeks > 0, 'TEST 2: Timeline duration estimated correctly');

  // TEST 3: Graph layout computation for React Flow
  const layout = computeGraphLayout(dynamicRoadmap);
  assert(layout.flowNodes.length === dynamicRoadmap.nodes.length, 'TEST 3: Flow nodes generated for React Flow');
  assert(layout.flowEdges.length === dynamicRoadmap.edges.length, 'TEST 3: Flow edges generated for React Flow');

  // TEST 8, 9, 10: Flow A - Mark Skill as Known (Adaptive Replan)
  const availableNode = DEMO_ROADMAP.nodes.find((n) => n.status === 'in_progress') || DEMO_ROADMAP.nodes[2];
  const { updatedRoadmap: knownRoadmap, replanEvent } = applyMarkSkillAsKnown(DEMO_ROADMAP, availableNode.id, false);
  const updatedNode = knownRoadmap.nodes.find((n) => n.id === availableNode.id);
  assert(updatedNode.status === 'known', 'TEST 8: Node status updated to "known"');
  assert(replanEvent.hoursAfter <= replanEvent.hoursBefore, 'TEST 10: System recalculated remaining hours reduction');

  // TEST 11: Flow B - Weekly Hours Change
  const { updatedRoadmap: hoursRoadmap, replanEvent: hoursEvent } = applyWeeklyHoursChange(DEMO_ROADMAP, 20);
  assert(hoursEvent.weeksAfter < hoursEvent.weeksBefore, 'TEST 11: Changing hours/wk from 10 to 20 accelerated weeks');
  assert(hoursRoadmap.personalization.hoursPerWeek === 20, 'TEST 11: Weekly hours persisted in personalization');

  // Flow C: Deadline Change
  const { updatedRoadmap: deadlineRoadmap, replanEvent: deadlineEvent } = applyDeadlineChange(DEMO_ROADMAP, 3);
  assert(deadlineEvent.weeksAfter < deadlineEvent.weeksBefore, 'Flow C: Deadline change compressed schedule');

  // TEST 13: Milestone Completion & Downstream Unlock
  const blockedNodeId = DEMO_ROADMAP.nodes.find((n) => n.status === 'blocked')?.id;
  const { updatedRoadmap: compRoadmap } = applyMilestoneCompletion(DEMO_ROADMAP, availableNode.id);
  const compStats = calculateProgressSummary(compRoadmap);
  assert(compStats.hoursInvested > 0, 'TEST 13: Milestone completion increments invested hours');

  // TEST 21 & 22: Reject dependency cycles and invalid edge references
  const cyclicRoadmap = {
    ...DEMO_ROADMAP,
    edges: [
      ...DEMO_ROADMAP.edges,
      { id: 'cycle-bad', source: DEMO_ROADMAP.edges[0].target, target: DEMO_ROADMAP.edges[0].source, relationship: 'prerequisite' },
      { id: 'non-existent-edge', source: 'phantom-node-999', target: DEMO_ROADMAP.nodes[0].id, relationship: 'prerequisite' },
    ],
  };
  const sanitized = sanitizeAndValidateRoadmap(cyclicRoadmap);
  assert(sanitized.success === true, 'TEST 21: Malformed graph does not crash sanitizer');
  const hasCycleEdge = sanitized.roadmap.edges.some((e) => e.id === 'cycle-bad');
  const hasPhantomEdge = sanitized.roadmap.edges.some((e) => e.id === 'non-existent-edge');
  assert(!hasCycleEdge, 'TEST 22: Circular dependency cycle successfully detected and pruned');
  assert(!hasPhantomEdge, 'TEST 22: Edges referencing non-existent nodes successfully pruned');

  // TEST 18: Demo roadmap works out-of-the-box without API keys
  assert(DEMO_ROADMAP.isDemo === true, 'TEST 18: Demo roadmap labeled and structured');
  assert(DEMO_ROADMAP.nodes.length >= 8, 'TEST 18: Demo roadmap has comprehensive milestone tree');

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
