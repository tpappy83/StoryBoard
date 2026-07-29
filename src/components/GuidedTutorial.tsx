import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Cpu,
  Brain,
  Zap,
  Radio,
  Users,
  ShieldCheck,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  ArrowRight,
  Lightbulb,
  Compass,
  MessageSquare
} from 'lucide-react';
import { PresetMode } from '../types';

interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  presetMode?: PresetMode;
  icon: React.ReactNode;
  badgeText: string;
  highlightSelector?: string;
  speechPosition?: 'top' | 'bottom' | 'center' | 'left' | 'right';
  actionButtonText?: string;
}

interface GuidedTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: PresetMode;
  setActivePreset: (mode: PresetMode) => void;
  onOpenAiDrawer?: () => void;
  onRunAudit?: () => void;
}

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({
  isOpen,
  onClose,
  activePreset,
  setActivePreset,
  onOpenAiDrawer,
  onRunAudit
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Narrative OS v2.0',
      subtitle: 'The Real-Time AI Narrative Architecture & Worldbuilding Suite',
      description: 'Narrative OS is engineered for novelists, screenwriters, and narrative designers crafting multi-threaded stories. It coordinates live character memory, plot threads, canon rules, and AI advisory boards.',
      tip: 'Pro Tip: You can launch this interactive tour anytime from the header compass icon!',
      presetMode: 'WRITING',
      icon: <Sliders className="w-6 h-6 text-indigo-400" />,
      badgeText: 'Overview 1/8',
      speechPosition: 'center'
    },
    {
      id: 'presets',
      title: '11 Specialized Workspace Engines',
      subtitle: 'Seamlessly Switch Between Creative & Analytical Modes',
      description: 'Switch between 11 dedicated workstations: Scene Editor, State Engine, Writer\'s Room Council, Consequence Tracker, Intersection Engine, Structure Intelligence, Off-Screen Sim, Character Web, Continuity Vault, Timeline, and 16-Pad MPC Sequencer.',
      tip: 'Try clicking "Switch Workspace" below to jump directly into the targeted workstation!',
      presetMode: 'WRITING',
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
      badgeText: 'Header Transport 2/8',
      speechPosition: 'top',
      actionButtonText: 'Try Writing Engine'
    },
    {
      id: 'browser',
      title: 'Story Universe Navigator',
      subtitle: 'Collapsible Left Tree for Characters, Scenes & Lore',
      description: 'The left sidebar organizes active manuscript entities. Click any character, scene, or lore fact to inspect details, or click quick-add buttons to expand your universe on the fly.',
      tip: 'You can toggle the sidebar collapse state using the left arrow icon for an expansive editing canvas.',
      presetMode: 'WRITING',
      icon: <BookOpen className="w-6 h-6 text-sky-400" />,
      badgeText: 'Left Panel 3/8',
      speechPosition: 'left'
    },
    {
      id: 'chekhov',
      title: 'Foreshadowing & Chekhov\'s Gun Analyzer',
      subtitle: 'Automatic Detection of Unresolved High-Importance Setups',
      description: 'Track foreshadowed objects, secrets, and promises in the Setup & Payoff Tracker. Our automatic analyzer flags setups with Importance ≥ 7 introduced 20+ chapters ago with no linked payoff as a "Chekhov Warning".',
      tip: 'Click "AI Payoff" on any flagged item to let Gemini generate satisfying resolution beats!',
      presetMode: 'STATE_ENGINE',
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      badgeText: 'State Engine 4/8',
      actionButtonText: 'View Chekhov Analyzer'
    },
    {
      id: 'writers_room',
      title: 'Writer\'s Room AI Advisory Board',
      subtitle: '5-Agent Consensus Council for Structural & Prose Guidance',
      description: 'Consult 5 specialized council agents: Story Architect, Character Psychologist, Lore Guardian, Plot Engineer, and Continuity Inspector. Pitch story dilemmas or click "APPLY" to rewrite scene prose directly from directives!',
      tip: 'Use quick presets like "Escalate Scene Tension" or "Verify Lore Rules" for instant council feedback.',
      presetMode: 'WRITERS_ROOM',
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      badgeText: 'AI Council 5/8',
      actionButtonText: 'Open Writer\'s Room'
    },
    {
      id: 'offscreen_sim',
      title: 'Off-Screen Universe Simulator',
      subtitle: 'Simulating Autonomous Off-Screen Character Choices',
      description: 'Story universes continue evolving even when characters aren\'t on stage. Run background simulation ticks to let off-screen antagonists and allies pursue goals and trigger unscripted plot twists.',
      tip: 'Run a 1-chapter simulation tick to discover spontaneous plot convergences!',
      presetMode: 'OFFSCREEN_SIM',
      icon: <Radio className="w-6 h-6 text-rose-400" />,
      badgeText: 'World Sim 6/8',
      actionButtonText: 'Open Off-Screen Sim'
    },
    {
      id: 'continuity',
      title: 'Continuity Vault & Paradox Prevention',
      subtitle: 'Zero-Paradox Protection Against Plot Holes',
      description: 'Immutable canon facts enforce timeline logic, physical boundaries, and emotional continuity. Run automated audits to spot location conflicts or broken rules before drafting.',
      tip: 'Click "Audit" in the top header at any time to verify your entire manuscript\'s integrity.',
      presetMode: 'CONTINUITY',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      badgeText: 'Lore Audit 7/8',
      actionButtonText: 'View Continuity Vault'
    },
    {
      id: 'ai_propose',
      title: 'AI Proposal Engine & One-Click Approval',
      subtitle: 'Co-Create Rich Scenes with Structural State Mutations',
      description: 'Click "AI PROPOSE" in the top header to ask Gemini for next scene proposals. Review automatically generated validation checks, character mood shifts, and prose drafts before committing them.',
      tip: 'You\'re ready to build! Jump in and start crafting your masterpiece.',
      presetMode: 'WRITING',
      icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
      badgeText: 'Co-Pilot 8/8',
      actionButtonText: 'Finish Tutorial'
    }
  ];

  const currentStep = tutorialSteps[currentStepIndex];

  // Auto-align preset when stepping through tutorial
  useEffect(() => {
    if (isOpen && currentStep.presetMode) {
      setActivePreset(currentStep.presetMode);
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Tutorial Instruction Bubble Card */}
      <div className="bg-[#141B2D] border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-slate-100 font-sans space-y-6 transform transition-all animate-in fade-in zoom-in-95">
        {/* Animated Speech Bubble Pointer Accent */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#141B2D] border-t-2 border-l-2 border-indigo-500/60 rotate-45 rounded-xs hidden sm:block" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1A2338] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {currentStep.badgeText}
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1 font-mono leading-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#0B1020] border border-[#1A2338] rounded-xl transition-colors"
            title="Close Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-indigo-300 font-mono">
            {currentStep.subtitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#0B1020] p-4 rounded-2xl border border-[#1A2338]">
            {currentStep.description}
          </p>

          {/* Actionable Tip Bubble */}
          <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-amber-200 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="font-sans leading-relaxed">
              <span className="font-bold text-amber-300">Instruction Tip: </span>
              {currentStep.tip}
            </div>
          </div>
        </div>

        {/* Preset Jump Button */}
        {currentStep.presetMode && currentStep.actionButtonText && (
          <div className="flex items-center justify-between bg-[#0B1020] p-3 rounded-2xl border border-[#1A2338] text-xs font-mono">
            <span className="text-slate-400">Target Workstation:</span>
            <button
              onClick={() => {
                if (currentStep.presetMode) setActivePreset(currentStep.presetMode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activePreset === currentStep.presetMode
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <span>{activePreset === currentStep.presetMode ? '✓ Active Workstation' : currentStep.actionButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-1.5 pt-1">
          {tutorialSteps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-7 bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Go to step ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-[#1A2338] pt-4 font-mono text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-[#0B1020] hover:bg-[#1A2338] disabled:opacity-30 text-slate-300 rounded-xl font-bold transition-all flex items-center space-x-1.5 border border-[#1A2338]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <span className="text-slate-500 font-mono">
            Step {currentStepIndex + 1} of {tutorialSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-950"
          >
            <span>{currentStepIndex === tutorialSteps.length - 1 ? 'GET STARTED' : 'NEXT STEP'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
