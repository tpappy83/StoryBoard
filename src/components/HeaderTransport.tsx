import React from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Search,
  Grid,
  Layers,
  Users,
  GitMerge,
  BookOpen,
  Volume2,
  VolumeX,
  AlertTriangle,
  FolderKanban,
  Brain,
  Zap,
  Shuffle,
  Film,
  Radio,
  Cpu,
  Compass,
  HelpCircle
} from 'lucide-react';
import { PresetMode, ProjectMetadata } from '../types';

interface HeaderTransportProps {
  project: ProjectMetadata;
  activePreset: PresetMode;
  setActivePreset: (mode: PresetMode) => void;
  continuityScore: number;
  canonCount: number;
  violationCount: number;
  aiStatus: 'READY' | 'PROPOSING' | 'VALIDATING';
  onRunAudit: () => void;
  onOpenAiDrawer: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenTutorial?: () => void;
}

export const HeaderTransport: React.FC<HeaderTransportProps> = ({
  project,
  activePreset,
  setActivePreset,
  continuityScore,
  canonCount,
  violationCount,
  aiStatus,
  onRunAudit,
  onOpenAiDrawer,
  soundEnabled,
  setSoundEnabled,
  onOpenTutorial,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
    if (score >= 75) return 'text-amber-400 bg-amber-950/50 border-amber-800';
    return 'text-rose-400 bg-rose-950/50 border-rose-800';
  };

  return (
    <header className="bg-[#141B2D] border-b border-[#1A2338] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1.5 rounded-lg shadow-md font-bold tracking-wide text-sm">
          <Sliders className="w-4 h-4 animate-pulse" />
          <span>NARRATIVE OS</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-indigo-200">v2.0 OS</span>
        </div>

        <div className="hidden lg:block border-l border-slate-700/60 pl-3">
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            {project.title}
            <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              {project.genre}
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{project.tagline}</p>
        </div>
      </div>

      {/* Preset Switcher Tabs */}
      <div className="flex flex-wrap items-center bg-[#0B1020] p-1 rounded-lg border border-[#1A2338] text-xs font-medium gap-1">
        <button
          onClick={() => setActivePreset('WRITING')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'WRITING'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Scene Editor & Character Context"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WRITING</span>
        </button>

        <button
          onClick={() => setActivePreset('STATE_ENGINE')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'STATE_ENGINE'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Dynamic Narrative State Engine & Simulation Directive"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">STATE ENGINE</span>
        </button>

        <button
          onClick={() => setActivePreset('WRITERS_ROOM')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'WRITERS_ROOM'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Writer's Room AI Advisory Board"
        >
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">WRITER'S ROOM</span>
        </button>

        <button
          onClick={() => setActivePreset('CONSEQUENCE')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'CONSEQUENCE'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Narrative Consequence & Memory Engine"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">CONSEQUENCE</span>
        </button>

        <button
          onClick={() => setActivePreset('INTERSECTION')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'INTERSECTION'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Crash/Magnolia Intersection Engine"
        >
          <Shuffle className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">INTERSECTION</span>
        </button>

        <button
          onClick={() => setActivePreset('STRUCTURE')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'STRUCTURE'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Story Structure Intelligence"
        >
          <Film className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">STRUCTURE</span>
        </button>

        <button
          onClick={() => setActivePreset('OFFSCREEN_SIM')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'OFFSCREEN_SIM'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Story Universe Background Simulator"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">OFF-SCREEN SIM</span>
        </button>

        <button
          onClick={() => setActivePreset('CHARACTER')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'CHARACTER'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Character Intelligence & Relationship Web"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CHARACTERS</span>
        </button>

        <button
          onClick={() => setActivePreset('CONTINUITY')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'CONTINUITY'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Canon Vault & Violations Ledger"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CONTINUITY</span>
        </button>

        <button
          onClick={() => setActivePreset('PLANNING')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'PLANNING'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="Timeline Observatory & Plot Threads"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">TIMELINE</span>
        </button>

        <button
          onClick={() => setActivePreset('MPC_GRID')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            activePreset === 'MPC_GRID'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2D]'
          }`}
          title="16-Pad MPC Scene Sequencer"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">MPC PADS</span>
        </button>
      </div>

      {/* DAW Performance Meters & Action Controls */}

      {/* DAW Performance Meters & Action Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Continuity Meter */}
        <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-md border text-xs font-mono font-bold ${getScoreColor(continuityScore)}`}>
          <ShieldCheck className="w-4 h-4" />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-normal">CONTINUITY</div>
            <div>{continuityScore}%</div>
          </div>
        </div>

        {/* Violations Meter */}
        <div
          onClick={() => setActivePreset('CONTINUITY')}
          className={`cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-md border font-mono font-bold ${
            violationCount > 0
              ? 'bg-amber-950/60 border-amber-800/80 text-amber-400 hover:bg-amber-900/60'
              : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-normal">ISSUES</div>
            <div>{violationCount}</div>
          </div>
        </div>

        {/* Canon Memory Count */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0B1020] border border-[#1A2338] text-slate-300 font-mono">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-normal">CANON</div>
            <div className="font-bold">{canonCount} facts</div>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#0B1020] border border-[#1A2338] rounded-md transition-colors"
          title={soundEnabled ? 'Disable DAW Pad Audio Feedback' : 'Enable DAW Pad Audio Feedback'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Guided Tour / Interactive Tutorial Button */}
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="flex items-center space-x-1.5 bg-[#0B1020] hover:bg-[#1A2338] text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all shadow-sm"
            title="Launch Interactive Guided Tutorial with Instruction Bubbles"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">GUIDED TOUR</span>
          </button>
        )}

        {/* Run Continuity Audit Button */}
        <button
          onClick={onRunAudit}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md border border-slate-700 font-medium transition-colors"
          title="Run Continuity Audit"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Audit</span>
        </button>

        {/* Open AI Proposal Drawer */}
        <button
          onClick={onOpenAiDrawer}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-md font-semibold shadow-md transition-all animate-pulse hover:animate-none"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI PROPOSE</span>
        </button>
      </div>
    </header>
  );
};
