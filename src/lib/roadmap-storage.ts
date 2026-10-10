'use client';

import {
  CareerRoadmap,
  ProjectBrief,
  InterviewQuestionItem,
  RoleComparisonData,
} from '@/types/roadmap';
import { DEMO_ROADMAP } from '@/lib/demo-roadmap';
import { sanitizeAndValidateRoadmap } from '@/lib/schema-validator';
import { recomputeNodeStatuses, calculateProgressSummary } from '@/lib/graph-engine';

const STORAGE_KEYS = {
  ACTIVE_ROADMAP: 'pathora_active_roadmap_v1',
  SAVED_ROADMAPS: 'pathora_saved_roadmaps_v1',
  SAVED_PROJECTS: 'pathora_saved_projects_v1',
  SAVED_QUESTIONS: 'pathora_saved_questions_v1',
  ROLE_COMPARISONS: 'pathora_saved_comparisons_v1',
  PREFERENCES: 'pathora_user_preferences_v1',
  AI_CONFIG: 'pathora_ai_config_v1',
};

export interface UserPreferences {
  hoursPerWeek: number;
  targetMonths: number;
  learningStyle: 'project-first' | 'theory-then-build' | 'interactive-docs' | 'visual-video';
  preferredLanguage: string;
  freeResourcesOnly: boolean;
  jobMarket: string;
  theme: 'light' | 'dark' | 'system';
}

export interface AIConfig {
  provider: 'demo' | 'gemini' | 'openai' | 'groq';
  customApiKey?: string;
  modelName?: string;
  useLiveSearchVerification: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  hoursPerWeek: 10,
  targetMonths: 6,
  learningStyle: 'project-first',
  preferredLanguage: 'Python',
  freeResourcesOnly: true,
  jobMarket: 'India (Bengaluru / Remote)',
  theme: 'light',
};

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'demo',
  useLiveSearchVerification: false,
};

/**
 * Checks if window and localStorage are available
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Retrieves the currently active career roadmap.
 * Falls back to DEMO_ROADMAP if nothing is stored or if storage is corrupted.
 */
export function getActiveRoadmap(): CareerRoadmap {
  if (!isClient()) {
    return DEMO_ROADMAP;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROADMAP);
    if (!raw) {
      saveActiveRoadmap(DEMO_ROADMAP);
      return DEMO_ROADMAP;
    }

    const parsed = JSON.parse(raw);
    const { success, roadmap } = sanitizeAndValidateRoadmap(parsed);
    if (success && roadmap) {
      // Ensure statuses and stats are accurate
      const refreshedNodes = recomputeNodeStatuses(roadmap.nodes);
      const tempRoadmap = { ...roadmap, nodes: refreshedNodes };
      const stats = calculateProgressSummary(tempRoadmap);
      const refreshedRoadmap: CareerRoadmap = {
        ...tempRoadmap,
        summary: {
          ...tempRoadmap.summary,
          hoursInvested: stats.hoursInvested,
          hoursRemaining: stats.hoursRemaining,
          estimatedDurationWeeks: stats.projectedWeeksRemaining,
          projectedCompletionDate: stats.projectedCompletionDate,
        },
      };
      return refreshedRoadmap;
    }
    return DEMO_ROADMAP;
  } catch (e) {
    console.error('Failed to load active roadmap from storage:', e);
    return DEMO_ROADMAP;
  }
}

/**
 * Saves the active career roadmap to persistent storage.
 */
export function saveActiveRoadmap(roadmap: CareerRoadmap): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROADMAP, JSON.stringify(roadmap));
    // Also dispatch custom event for instant cross-component updates
    window.dispatchEvent(new CustomEvent('pathora-roadmap-updated', { detail: roadmap }));
  } catch (e) {
    console.error('Failed to save active roadmap:', e);
  }
}

/**
 * Resets the active roadmap to the canonical demonstration roadmap.
 */
export function resetToDemoRoadmap(): CareerRoadmap {
  saveActiveRoadmap(DEMO_ROADMAP);
  return DEMO_ROADMAP;
}

/**
 * Retrieves all saved roadmaps from the user's library.
 */
export function getSavedRoadmaps(): CareerRoadmap[] {
  if (!isClient()) return [DEMO_ROADMAP];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ROADMAPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SAVED_ROADMAPS, JSON.stringify([DEMO_ROADMAP]));
      return [DEMO_ROADMAP];
    }
    const list = JSON.parse(raw) as CareerRoadmap[];
    return Array.isArray(list) ? list : [DEMO_ROADMAP];
  } catch {
    return [DEMO_ROADMAP];
  }
}

/**
 * Saves a roadmap to the user's saved library.
 */
export function saveRoadmapToLibrary(roadmap: CareerRoadmap): void {
  if (!isClient()) return;
  try {
    const list = getSavedRoadmaps();
    const existingIndex = list.findIndex((r) => r.roadmapId === roadmap.roadmapId);
    let updated: CareerRoadmap[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = roadmap;
    } else {
      updated = [roadmap, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_ROADMAPS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save roadmap to library:', e);
  }
}

/**
 * Deletes a roadmap from the library.
 */
export function deleteRoadmapFromLibrary(roadmapId: string): void {
  if (!isClient()) return;
  try {
    const list = getSavedRoadmaps();
    const filtered = list.filter((r) => r.roadmapId !== roadmapId);
    localStorage.setItem(STORAGE_KEYS.SAVED_ROADMAPS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete roadmap:', e);
  }
}

/**
 * Project Studio Persistence
 */
export function getSavedProjects(): ProjectBrief[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjectBrief(project: ProjectBrief): void {
  if (!isClient()) return;
  try {
    const projects = getSavedProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    let updated: ProjectBrief[];
    if (idx >= 0) {
      updated = [...projects];
      updated[idx] = project;
    } else {
      updated = [project, ...projects];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pathora-projects-updated'));
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function toggleProjectComplete(projectId: string): void {
  if (!isClient()) return;
  const projects = getSavedProjects();
  const target = projects.find((p) => p.id === projectId);
  if (target) {
    target.isCompleted = !target.isCompleted;
    localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent('pathora-projects-updated'));
  }
}

/**
 * Interview Preparation Persistence
 */
export function getSavedQuestions(): InterviewQuestionItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInterviewQuestion(question: InterviewQuestionItem): void {
  if (!isClient()) return;
  try {
    const questions = getSavedQuestions();
    const idx = questions.findIndex((q) => q.id === question.id);
    let updated: InterviewQuestionItem[];
    if (idx >= 0) {
      updated = [...questions];
      updated[idx] = question;
    } else {
      updated = [question, ...questions];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_QUESTIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pathora-questions-updated'));
  } catch (e) {
    console.error('Failed to save question:', e);
  }
}

export function toggleQuestionMastered(questionId: string): void {
  if (!isClient()) return;
  const questions = getSavedQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (q) {
    q.mastered = !q.mastered;
    localStorage.setItem(STORAGE_KEYS.SAVED_QUESTIONS, JSON.stringify(questions));
    window.dispatchEvent(new CustomEvent('pathora-questions-updated'));
  }
}

/**
 * User Preferences & AI Configuration
 */
export function getUserPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  if (!isClient()) return;
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
}

export function getAIConfig(): AIConfig {
  if (!isClient()) return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    return raw ? { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) } : DEFAULT_AI_CONFIG;
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(cfg: Partial<AIConfig>): void {
  if (!isClient()) return;
  const current = getAIConfig();
  const updated = { ...current, ...cfg };
  localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(updated));
}
