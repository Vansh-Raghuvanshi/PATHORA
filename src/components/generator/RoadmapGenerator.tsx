'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Briefcase,
  Layers,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Code2,
  AlertCircle,
  Laptop,
  GraduationCap,
  MapPin,
  Building2,
  Shield,
} from 'lucide-react';
import { saveActiveRoadmap } from '@/lib/roadmap-storage';
import { CareerRoadmap } from '@/types/roadmap';

export default function RoadmapGenerator() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [role, setRole] = useState('AI Engineer');
  const [companyType, setCompanyType] = useState('Product-Based Tech (Unicorn / Startup)');
  const [industry, setIndustry] = useState('Generative AI / SaaS Platform');
  const [location, setLocation] = useState('India (Bengaluru / Remote / Hybrid)');
  const [seniority, setSeniority] = useState('Entry-to-Associate (0-2 YOE)');
  const [education, setEducation] = useState('B.Tech / Bachelor Degree');
  const [currentRole, setCurrentRole] = useState('CS Student / Aspiring Engineer');

  // Step 2 Starting Point
  const [programmingExp, setProgrammingExp] = useState('1 year of academic coding');
  const [masteredSkills, setMasteredSkills] = useState<string[]>(['Basic Python', 'Git & GitHub']);
  const [skillInput, setSkillInput] = useState('');
  const [learningSkills, setLearningSkills] = useState('Pandas, NumPy, Machine Learning algorithms');
  const [existingProjects, setExistingProjects] = useState('College mini project in Python');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Step 3 Constraints
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(10);
  const [targetMonths, setTargetMonths] = useState<number>(6);
  const [learningStyle, setLearningStyle] = useState<'project-first' | 'theory-then-build' | 'interactive-docs' | 'visual-video'>('project-first');
  const [preferredLanguage, setPreferredLanguage] = useState('Python');
  const [freeResourcesOnly, setFreeResourcesOnly] = useState<boolean>(true);

  const generationStages = [
    'Analyzing target job market & role hiring bar...',
    'Deconstructing essential vs optional technical skills...',
    'Architecting proof-of-competence capstone projects...',
    'Calibrating effort hours & realistic weekly study budget...',
    'Compiling directed dependency tree & prerequisite validation...',
    'Finalizing adaptive career roadmap...',
  ];

  const handleAddMasteredSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!masteredSkills.includes(skillInput.trim())) {
        setMasteredSkills([...masteredSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setMasteredSkills(masteredSkills.filter((s) => s !== skill));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    // Progressive stage animation
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => (prev < generationStages.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: {
            role,
            industry,
            companyType,
            location,
            seniority,
            currentEducation: education,
            currentRole,
          },
          personalization: {
            hoursPerWeek,
            targetMonths,
            startingLevel: 'beginner',
            masteredSkills,
            learningSkills: learningSkills.split(',').map((s) => s.trim()).filter(Boolean),
            programmingExperience: programmingExp,
            existingProjects,
            portfolioUrl,
            preferredLanguage,
            preferredLearningStyle: learningStyle,
            freeResourcesOnly,
            assumptions: [
              `Targeting ${hoursPerWeek} hrs/week over ${targetMonths} months.`,
              `Focusing on ${preferredLanguage} and ${learningStyle} pedagogical style.`,
            ],
          },
        }),
      });

      const data = await response.json();
      clearInterval(stageInterval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      saveActiveRoadmap(data.roadmap as CareerRoadmap);
      router.push('/roadmap');
    } catch (err: unknown) {
      clearInterval(stageInterval);
      setIsGenerating(false);
      setErrorMessage(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          AI Career Architecture Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
          Reverse-Engineer Your Dream Role
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
          Define your specific career destination and constraints. PATHORA synthesizes a dependency graph of skills, portfolio proof, and milestones.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-8 relative">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-1" />
        {[
          { step: 1, label: 'Destination' },
          { step: 2, label: 'Starting Point' },
          { step: 3, label: 'Constraints' },
        ].map((s) => (
          <div key={s.step} className="flex flex-col items-center z-10">
            <button
              onClick={() => !isGenerating && setCurrentStep(s.step)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === s.step
                  ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-50'
                  : currentStep > s.step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {currentStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
            </button>
            <span className="text-[11px] font-semibold text-slate-600 mt-1.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: DEFINE THE DESTINATION */}
        {currentStep === 1 && !isGenerating && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Dream Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. AI Engineer, Frontend Engineer at Fintech, Data Scientist..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Presets:</span>
                {[
                  'AI Engineer in India',
                  'Frontend Engineer at Fintech',
                  'ML Engineer at Climate Tech',
                  'Data Scientist in Healthcare',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRole(preset)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Target Company Type
                </label>
                <input
                  type="text"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  placeholder="e.g. Product Startup, MNC, FAANG..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Preferred Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Fintech, SaaS, Healthcare, E-commerce..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Job Market / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. India (Bengaluru), US Remote, Europe..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Target Seniority
                </label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                >
                  <option value="Entry-to-Associate (0-2 YOE)">Entry / Associate (0-2 YOE)</option>
                  <option value="Mid-Level Engineer (2-5 YOE)">Mid-Level (2-5 YOE)</option>
                  <option value="Senior Specialist (5+ YOE)">Senior Specialist (5+ YOE)</option>
                  <option value="Internship / Campus Placement">Internship / Campus Placement</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Continue to Starting Point</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UNDERSTAND THE STARTING POINT */}
        {currentStep === 2 && !isGenerating && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Skills You Already Mastered (Press Enter to add)
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 min-h-[46px] items-center mb-2">
                {masteredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type a skill and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddMasteredSkill}
                  className="flex-1 min-w-[140px] text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Skills you already know will automatically be assessed or marked as completed, reducing redundant curriculum hours.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Programming Experience
              </label>
              <select
                value={programmingExp}
                onChange={(e) => setProgrammingExp(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="Complete beginner (No formal coding experience)">
                  Complete beginner (No coding experience)
                </option>
                <option value="1 year of academic coding (CS courses / college)">
                  1 year of academic coding (CS courses / college)
                </option>
                <option value="Self-taught (Built a few small scripts or tutorials)">
                  Self-taught (Built small scripts or tutorials)
                </option>
                <option value="Experienced developer switching career tracks">
                  Experienced developer switching career tracks
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Existing Projects or GitHub URL (Optional)
              </label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Continue to Constraints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONSTRAINTS & GENERATE */}
        {currentStep === 3 && !isGenerating && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Hours per Week */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-900">
                  Hours Available Per Week
                </label>
                <span className="text-xs font-bold text-indigo-600">{hoursPerWeek} hrs / week</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[5, 10, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setHoursPerWeek(preset)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      hoursPerWeek === preset
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset} hrs/wk
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Target Timeline */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-900">
                  Desired Timeline to Job Readiness
                </label>
                <span className="text-xs font-bold text-indigo-600">{targetMonths} Months</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMonths(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      targetMonths === m
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Language & Learning Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Primary Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="Python">Python</option>
                  <option value="TypeScript / JavaScript">TypeScript / JavaScript</option>
                  <option value="Go">Go</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value as unknown as typeof learningStyle)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="project-first">Project-First (Build to learn)</option>
                  <option value="theory-then-build">Theory Then Build</option>
                  <option value="interactive-docs">Interactive Documentation</option>
                  <option value="visual-video">Visual / Video Driven</option>
                </select>
              </div>
            </div>

            {/* Free Resources Only Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Free Tier & Open-Source Only
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Prioritize free official documentation, tutorials, and zero-cost tools
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={freeResourcesOnly}
                onChange={(e) => setFreeResourcesOnly(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Career Roadmap</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: GENERATING PROGRESS VIEW */}
        {isGenerating && (
          <div className="py-12 px-4 text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto shadow-sm animate-bounce">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Reverse-Engineering Career Path
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customizing for: <strong className="text-slate-800">{role}</strong> ({hoursPerWeek}h/wk • {targetMonths}mo)
              </p>
            </div>

            {/* Stages Tracker */}
            <div className="max-w-md mx-auto text-left space-y-2.5 pt-2">
              {generationStages.map((stage, idx) => {
                const isPassed = idx < activeStage;
                const isCurrent = idx === activeStage;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/80 text-indigo-900 font-bold border border-indigo-100'
                        : isPassed
                        ? 'text-slate-700 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-200" />
                      )}
                    </div>
                    <span className="text-xs">{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

