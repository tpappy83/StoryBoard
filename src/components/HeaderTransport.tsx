import React from 'react';
import { Download,
  ShieldCheck,
  Zap,
  BookOpen,
  Clapperboard,
  GitBranch,
  Globe,
  Users,
  Brain,
  Bot,
  Sparkles,
  History,
  Cpu,
  FileText,
  HelpCircle,
  Menu,
  Activity,
  Compass
} from 'lucide-react';
import { WorkspaceMode, ProjectMetadata } from '../types';
import { ThreeDotActionsBar } from './ThreeDotActionsBar';
import { AppMenu } from './AppMenu';

import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject, SceneProposal } from '../types';
import { generateProjectPDF } from '../lib/pdfExportService';
import { generateProjectDOCX } from '../lib/docxExportService';

import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';


interface HeaderTransportProps {
  scenes?: Scene[];
  proposals?: SceneProposal[];
  scene?: Scene;
  characters?: Character[];
  plotThreads?: PlotThread[];
  canonFacts?: CanonFact[];
  setups?: SetupPayoffEvent[];
  payoffs?: any[];
  selectedObject?: SelectedNarrativeObject | null;
  onClearSelection?: () => void;
  onSelectCharacter?: (id: string) => void;
  project: ProjectMetadata;
  activeWorkspace: WorkspaceMode;
  setActiveWorkspace: (mode: WorkspaceMode) => void;
  continuityScore: number;
  canonCount: number;
  violationCount: number;
  aiStatus: 'READY' | 'PROPOSING' | 'VALIDATING';
  onRunAudit: () => void;
  onOpenAiDrawer: () => void;
  onOpenChat?: () => void;
  onOpenKeepWorkspace?: () => void;
  onOpenAuditTrail?: () => void;
  onOpenTestHarness?: () => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (val: boolean) => void;
  onOpenTutorial?: () => void;
  user?: User | null;
  onToggleNavigator?: () => void;
  }

export const HeaderTransport: React.FC<HeaderTransportProps> = ({
  user,

  project,
  activeWorkspace,
  setActiveWorkspace,
  continuityScore,
  canonCount,
  violationCount,
  aiStatus,
  onRunAudit,
  onOpenAiDrawer,
  onOpenChat,
  onOpenKeepWorkspace,
  onOpenAuditTrail,
  onOpenTestHarness,
  onOpenTutorial,
  onToggleNavigator,
  scenes,
  proposals,
  scene,
  characters,
  plotThreads,
  canonFacts,
  setups,
  payoffs,
  selectedObject,
  onClearSelection,
  onSelectCharacter
}) => {

  const handleAuth = async () => {
    if (user) {
      await signOut(auth);
    } else {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };


    const handleExportPDF = () => {
    try {
      generateProjectPDF({
        project,
        scenes,
        proposals,
        characters
      });
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("Failed to export PDF.");
    }
  };

  const handleExportDOCX = async () => {
    try {
      await generateProjectDOCX({
        project,
        scenes,
        proposals,
        characters
      });
    } catch (err) {
      console.error("Failed to export DOCX", err);
      alert("Failed to export DOCX.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-[#000000] border-emerald-500/50 hover:bg-[#0A2A43]';
    if (score >= 75) return 'text-[#F2C94C] bg-[#000000] border-[#F2C94C]/50 hover:bg-[#0A2A43]';
    return 'text-rose-400 bg-[#000000] border-rose-500/50 hover:bg-[#0A2A43]';
  };

  

  // Workstation button definitions
  const workstations: {
    id: WorkspaceMode | 'ADVISORY';
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }[] = [
    {
      id: 'PLANNING',
      label: 'Navigator',
      icon: <Compass className="w-3.5 h-3.5" />,
      onClick: () => {
        if (onToggleNavigator) onToggleNavigator();
        setActiveWorkspace('PLANNING');
      }
    },
    {
      id: 'WRITING_STUDIO',
      label: 'Writing Studio',
      icon: <Clapperboard className="w-3.5 h-3.5 text-[#F2C94C]" />,
      onClick: () => setActiveWorkspace('WRITING_STUDIO')
    },
    {
      id: 'SIMULATION',
      label: 'Timeline',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('SIMULATION')
    },
    {
      id: 'CHARACTER',
      label: 'Relationship Web',
      icon: <Users className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('CHARACTER')
    },
    {
      id: 'WORLDBUILDING',
      label: 'Canon Vault',
      icon: <Globe className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('WORLDBUILDING')
    },
    {
      id: 'ADVISORY',
      label: 'Advisory Council',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#F2C94C]" />,
      onClick: () => setActiveWorkspace('CUSTOM') // assuming ADVISORY maps to CUSTOM since there is no ADVISORY workspace mode
    },
    {
      id: 'CONTINUITY',
      label: 'Continuity Center',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('CONTINUITY')
    }
  ];

  return (
    <header className="bg-[#0A2A43] border-b border-[#153B5C] px-3 py-2 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-40 shadow-xl font-mono text-xs select-none">
      {/* Brand & Project Metadata */}
      <div className="flex items-center space-x-3">
        {/* Mobile Navigator Toggle */}
        {onToggleNavigator && (
          <button
            onClick={onToggleNavigator}
            className="md:hidden p-1.5 bg-[#000000] text-[#C4C4C4] hover:text-[#F2C94C] border border-[#153B5C] rounded-md transition-all"
            title="Toggle Navigator"
          >
            <Menu className="w-4 h-4 text-[#F2C94C]" />
          </button>
        )}

        <div
          onClick={() => setActiveWorkspace('WRITING')}
          className="flex items-center space-x-2 bg-[#000000] text-white px-3 py-1.5 rounded-md border border-[#F2C94C]/40 shadow-md cursor-pointer hover:border-[#F2C94C] transition-all group"
        >
          <Activity className="w-4 h-4 text-[#F2C94C] group-hover:rotate-12 transition-transform" />
          <span className="text-white tracking-widest font-extrabold uppercase text-xs">iNarrator</span>
          <span className="text-[9px] bg-[#0A2A43] text-[#F2C94C] px-1.5 py-0.5 rounded border border-[#153B5C] font-bold">
            PRO
          </span>
        </div>

        <div className="hidden lg:block border-l border-[#153B5C] pl-3">
          <h1 className="text-xs font-bold text-white flex items-center gap-2">
            {project.title}
            <span className="text-[10px] font-bold text-[#F2C94C] bg-[#000000] px-2 py-0.5 rounded border border-[#153B5C]">
              {project.genre}
            </span>
          </h1>
          <p className="text-[10px] text-[#C4C4C4] truncate max-w-xs">{project.tagline}</p>
        </div>
      </div>

      {/* WORKSTATION BUTTON BAR (RESCALED & ANIMATED) */}
      <div className="flex flex-wrap items-center bg-[#000000] p-1 rounded-md border border-[#153B5C] gap-1">
        {workstations.map((ws) => {
          const isActive = activeWorkspace === ws.id;

          return (
            <button
              key={ws.id}
              onClick={ws.onClick}
              className={`btn-workstation flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold tracking-tight transition-all duration-150 ${
                isActive
                  ? 'bg-[#000000] text-white border-b-2 border-[#F2C94C] shadow-md ring-1 ring-[#153B5C]'
                  : 'bg-[#0A2A43] text-[#C4C4C4] hover:bg-[#0E3859] hover:text-[#F2C94C] border border-[#153B5C]'
              }`}
              title={ws.label}
            >
              {ws.icon}
              <span className="inline">{ws.label}</span>
            </button>
          );
        })}
      </div>

      {/* System Quick Controls & ThreeDotActionsBar */}
      <div className="flex items-center space-x-2">
        {/* Continuity Health Badge */}
        <button
          onClick={() => setActiveWorkspace('CONTINUITY')}
          className={`flex items-center space-x-1.5 border px-2.5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${getScoreColor(
            continuityScore
          )}`}
          title={`Continuity Health: ${continuityScore}%. Click to open Continuity Center.`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{continuityScore}% HEALTH</span>
        </button>

        {/* Audit Button */}
        <button
          onClick={onRunAudit}
          className="bg-[#000000] hover:bg-[#0A2A43] text-[#F2C94C] border border-[#153B5C] hover:border-[#F2C94C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5"
          title="Run Universe Audit"
        >
          <Zap className="w-3.5 h-3.5 text-[#F2C94C] shrink-0" />
          <span className="hidden sm:inline">AUDIT</span>
        </button>

        {/* Audit Trail & Sync Ledger */}
        {onOpenAuditTrail && (
          <button
            onClick={onOpenAuditTrail}
            className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-[#C4C4C4] hover:text-white border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
            title="Open Transaction Audit Trail & Sync Engine"
          >
            <History className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden md:inline">AUDIT TRAIL</span>
          </button>
        )}

        {/* Test Harness */}
        {onOpenTestHarness && (
          <button
            onClick={onOpenTestHarness}
            className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-rose-300 border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
            title="Open Diagnostics Console"
          >
            <Cpu className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="hidden lg:inline">DIAGNOSTICS</span>
          </button>
        )}

        
                {/* Export Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-purple-400 border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">EXPORT</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-32 bg-[#000000] border border-[#153B5C] rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={handleExportPDF}
              className="block w-full text-left px-3 py-2 text-xs text-purple-400 hover:bg-[#0A2A43] hover:text-white"
            >
              Export to PDF
            </button>
            <button
              onClick={handleExportDOCX}
              className="block w-full text-left px-3 py-2 text-xs text-purple-400 hover:bg-[#0A2A43] hover:text-white"
            >
              Export to DOCX
            </button>
          </div>
        </div>

        {/* Google Keep Notes */}
        {onOpenKeepWorkspace && (
          <button
            onClick={onOpenKeepWorkspace}
            className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-[#F2C94C] border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
            title="Open Keep Notes Workspace"
          >
            <FileText className="w-3.5 h-3.5 text-[#F2C94C] shrink-0" />
            <span className="hidden md:inline">KEEP NOTES</span>
          </button>
        )}

        {/* App Main Menu */}
        <AppMenu />

        {/* Guided Walkthrough */}
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="p-1.5 bg-[#000000] text-[#C4C4C4] hover:text-white hover:bg-[#0A2A43] border border-[#153B5C] rounded-md transition-all shrink-0"
            title="System Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-[#F2C94C]" />
          </button>
        )}

        {/* THREE-DOT ACTIONS BAR COMPONENT */}
        <ThreeDotActionsBar
          onRunAudit={onRunAudit}
          onOpenAiDrawer={onOpenAiDrawer}
          onOpenWritingStudio={() => setActiveWorkspace('WRITING_STUDIO')}
          scene={scene}
          characters={characters}
          plotThreads={plotThreads}
          canonFacts={canonFacts}
          setups={setups}
          payoffs={payoffs}
          selectedObject={selectedObject}
          onClearSelection={onClearSelection}
          onSelectCharacter={onSelectCharacter}
        />
      </div>
    </header>
  );
};
