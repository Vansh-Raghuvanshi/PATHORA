# PATHORA
> **Your dream job. Reverse-engineered.**

**Problem Statement:** Reverse-Engineered Career Roadmapper  
**Hackathon Project:** PATHORA Career Intelligence OS

---

## 🌟 Executive Summary

**PATHORA** is an advanced AI-powered career intelligence platform that reverse-engineers a student's hyper-specific dream job into a personalized, visually interactive, realistic, adaptive career roadmap.

Unlike static roadmaps or checklists disguised as AI, PATHORA:
1. **Understands a specific career destination:** Accepts hyper-specific targets (e.g., *AI Engineer at a product company in India*, *Frontend Engineer at a fintech startup*) and job market constraints.
2. **Visualizes a realistic path:** Constructs an interconnected directed dependency graph (powered by React Flow) featuring foundations, technical skills, verified deliverables, capstone portfolio projects, and interview preparation.
3. **Adapts over time:** When a student marks a skill as already mastered, changes available weekly hours (e.g. from 10h to 20h/wk), or shifts their deadline, the roadmap dynamically recalculates remaining hours, unblocks downstream nodes, and explains trade-offs.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | **Next.js 16** (App Router, Server Components + Client Workspaces) |
| **Language** | **TypeScript 5** (Strict mode) |
| **Styling & Design System** | **Tailwind CSS v4** (Custom design tokens, HSL palette, warm off-white surfaces) |
| **Interactive Graph** | **@xyflow/react** (Custom milestone nodes, directed handles, minimap, controls) |
| **Validation & Schema** | **Zod** (Strict runtime validation, cycle detection, edge pruning) |
| **Icons** | **Lucide React** |
| **Celebrations** | **canvas-confetti** |
| **State & Persistence** | Isolated repository layer with `localStorage` fallback and instant cross-component updates |
| **Backend & AI Engine** | Next.js API route endpoints with configurable LLM integration & high-speed dynamic synthesis engine |

---

## 🧭 Information Architecture & Screens

PATHORA is structured into 10 cohesive screens:

1. **Landing / Home (`/`)**: High-impact editorial hero with a live interactive React Flow graph preview, 4-step methodology, feature cards, and accessible navigation.
2. **Career Roadmap Generator (`/generator`)**: Multi-step onboarding with real-time stage progress:
   - *Step 1: Destination* (Role, industry, company type, location, seniority)
   - *Step 2: Starting Point* (Mastered skills chips, experience level, existing projects)
   - *Step 3: Constraints* (Hours/week, target months, learning style, free resources toggle)
   - *Step 4: AI Generation Stages* (Real-time progress feedback transitioning to graph)
3. **Interactive Roadmap Workspace (`/roadmap`)**: The signature React Flow workspace:
   - Pan, zoom, minimap, fit view, and phase/status filters.
   - Distinct node types (Foundations, Technical, Projects, Interview, Readiness).
   - Upstream prerequisite and downstream dependent highlighting on select.
   - **View Toggle**: Switch seamlessly between *Dependency Graph View* and *Timeline View*.
4. **Milestone Intelligence Panel**: Contextual slide-over drawer displaying:
   - Why it matters for the target role
   - Verifiable deliverable & acceptance criteria
   - Authoritative verified resources vs community links
   - Tailored weekend project spec
   - Top interview questions & common pitfalls
   - Actions: *Mark Completed* (celebration + unlock), *Set In Progress*, *Already Known (Adaptive Replan)*, *Generate 7-Day Study Plan*.
5. **My Progress (`/progress`)**: Analytics derived strictly from real application state:
   - Progress gauge & hours invested vs remaining
   - Projected completion date based on weekly pacing
   - Phase-by-phase completion breakdown
   - Suggested next high-impact action
   - Verified mastered skills portfolio
6. **Career Path Comparison (`/comparison`)**:
   - Compare two roles side-by-side (e.g. *AI Engineer vs Data Scientist*).
   - Visual breakdown of shared foundational skills, unique specialized competencies, effort delta, and career flexibility score.
7. **Career Pathways (`/pathways`)**:
   - "People who took this path" progression trajectories (CS students, non-CS self-taught developers, career switchers).
   - Transparently labeled illustrative patterns with deliverables and real-world hurdles.
8. **Project Studio (`/project-studio`)**:
   - Synthesizes tailored portfolio project briefs across 4 sizes: *Weekend (8h)*, *1-Week (20h)*, *2-Week (40h)*, and *Capstone (80h)*.
   - Includes architecture overview, implementation phases, acceptance criteria, README template, and interview discussion points.
   - Action to convert and link project directly into the roadmap graph.
9. **Interview Preparation (`/interview-prep`)**:
   - Technical, scenario, behavioral (STAR), and project defense question arena.
   - Detailed model answer frameworks, what interviewers evaluate, and common red flags.
   - Practice tracking with self-assessment mastery toggle.
10. **Saved Roadmaps & Library (`/saved`)**:
    - Manage saved roadmaps, reload canonical demo, import/export JSON configurations.
11. **Settings & Profile (`/settings`)**:
    - Study pacing preferences, free resources only filter, AI provider key management, and demo state reset.

---

## ⚡ Adaptive Replanning Engine

PATHORA implements four distinct adaptive flows:

- **Flow A: Already-Known Skills:** Marking a skill as already mastered skips beginner study time, unlocks downstream dependent milestones, recalculates remaining effort and timeline, and logs a trade-off explanation.
- **Flow B: Weekly Hours Change:** Changing from 10h/wk to 15h/wk recalculates the projected completion date while preserving total work scope honestly.
- **Flow C: Deadline Change:** Shortening a deadline to 3 months flags elective specializations for post-placement deferral to protect essential core milestones.
- **Flow E: Milestone Completion:** Marking a milestone complete triggers celebration feedback, calculates newly unlocked downstream nodes, and updates progress analytics.

---

## 🤖 AI Integration & Transparency

PATHORA adheres to strict transparency standards:
- **Transparent Demo Mode:** Operates out-of-the-box with a high-fidelity dynamic synthesis engine that adapts to any role, industry, location, and constraints without requiring external API keys or incurring costs.
- **Configurable LLM Integration:** Supports `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` via server-side environment variables. API secrets are never exposed to the client.
- **Clear Ethical Disclaimers:** Estimated effort hours and timelines are explicitly presented as planning guidance rather than employment guarantees. Illustrative progression patterns and unverified resources are clearly labeled.
- **Cycle & Graph Safety:** The Zod schema validator runs Depth-First Search cycle detection to automatically detect and prune circular dependencies or invalid edge references before rendering.

---

## 🚀 Installation & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Environment Setup (Optional)
```bash
cp .env.example .env.local
```
Add your optional `GEMINI_API_KEY` or `OPENAI_API_KEY` if you wish to use external LLMs.

### Step 3: Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing Instructions

Run the automated acceptance test suite verifying all 24 judging acceptance criteria:
```bash
npx tsx test-acceptance.mjs
```

**Verified Test Coverage:**
- Dynamic generation appropriate to role and constraints
- React Flow coordinate layout generation
- Flow A: Already-known skill replanning and hours reduction
- Flow B: Weekly study hours timeline adjustment
- Flow C: Deadline compression and elective deferrals
- Milestone completion and downstream unlock
- Cycle detection (detects and breaks circular prerequisite loops)
- Invalid edge reference pruning
- Canonical demonstration roadmap integrity

---

## 🔒 Known Limitations & Production Notes

1. **Live Web Verification:** Resource URLs suggested by community pipelines are labeled with a verification badge. Live network link crawling requires outbound internet access.
2. **Persistence:** In local demo mode, roadmaps and project briefs persist in `localStorage` behind an isolated repository interface (`src/lib/roadmap-storage.ts`). For enterprise multi-user deployments, the repository interface is designed to connect to PostgreSQL / Supabase.

---

*Built with passion for the Reverse-Engineered Career Roadmapper Hackathon.*
