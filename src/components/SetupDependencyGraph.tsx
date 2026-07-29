import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Users,
  GitCommit,
  Sparkles,
  ArrowRight,
  BookOpen,
  Plus,
  Layers,
  ChevronRight,
  ChevronLeft,
  Info,
  Tag,
  Check,
  Maximize2
} from 'lucide-react';
import { PlotThread, Scene, Character, CanonFact } from '../types';
import {
  SetupEvent,
  PayoffEvent,
  getSetupAge,
  isChekhovWarning
} from '../types/setupPayoff';

interface SetupDependencyGraphProps {
  setups: SetupEvent[];
  payoffs: PayoffEvent[];
  characters?: Character[];
  plotThreads?: PlotThread[];
  scenes?: Scene[];
  canonFacts?: CanonFact[];
  currentChapter?: number;
  onSelectSetupForAiPayoff?: (setupId: string) => void;
  onLogPayoffForSetup?: (setup: SetupEvent) => void;
}

export const SetupDependencyGraph: React.FC<SetupDependencyGraphProps> = ({
  setups,
  payoffs,
  characters = [],
  plotThreads = [],
  scenes = [],
  canonFacts = [],
  currentChapter = 23,
  onSelectSetupForAiPayoff,
  onLogPayoffForSetup
}) => {
  const [selectedSetupId, setSelectedSetupId] = useState<string>(
    setups[0]?.id || ''
  );
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<{
    type: 'setup' | 'character' | 'thread' | 'payoff' | 'scene';
    id: string;
    title: string;
    subtitle: string;
    description: string;
    meta: Record<string, any>;
  } | null>(null);

  const [viewMode, setViewMode] = useState<'single' | 'matrix'>('single');

  // Find currently selected setup
  const currentSetup = setups.find(s => s.id === selectedSetupId) || setups[0];

  if (!currentSetup && setups.length === 0) {
    return (
      <div className="bg-[#141B2D] border border-[#1A2338] rounded-2xl p-8 text-center space-y-3 font-mono">
        <GitCommit className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-300">NO SETUPS IN LEDGER</h3>
        <p className="text-xs text-slate-500">
          Create a setup event to visualize its narrative lifecycle, character dependencies, and eventual payoffs.
        </p>
      </div>
    );
  }

  // Linked Payoffs for this setup
  const linkedPayoffs = payoffs.filter(
    p => p.setupIds.includes(currentSetup?.id) || currentSetup?.linkedPayoffIds.includes(p.id)
  );

  // Associated Characters
  const associatedCharacterNames = currentSetup?.introducedBy || [];
  const associatedCharacters = characters.filter(c =>
    associatedCharacterNames.some(
      name => c.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.name.toLowerCase())
    )
  );

  // Fallback if no exact character match
  const displayCharacters =
    associatedCharacters.length > 0
      ? associatedCharacters
      : characters.slice(0, 2);

  // Associated Introduced Scene
  const introducedScene = scenes.find(
    s => s.id === currentSetup?.introducedSceneId
  ) || scenes[0];

  // Associated Plot Thread
  const linkedThread =
    plotThreads.find(pt => pt.id === introducedScene?.threadId) ||
    plotThreads[0] || {
      id: 'core_mystery',
      title: 'Core Narrative Arc',
      category: 'Mystery',
      status: 'Active',
      tensionLevel: 8
    };

  const isResolved = currentSetup?.status === 'resolved';
  const age = currentSetup ? getSetupAge(currentSetup, currentChapter) : 0;
  const isChekhov = currentSetup ? isChekhovWarning(currentSetup, currentChapter) : false;

  // Setup Index
  const currentIndex = setups.findIndex(s => s.id === currentSetup?.id);

  const handlePrevSetup = () => {
    if (currentIndex > 0) {
      setSelectedSetupId(setups[currentIndex - 1].id);
    }
  };

  const handleNextSetup = () => {
    if (currentIndex < setups.length - 1) {
      setSelectedSetupId(setups[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-[#141B2D] border border-indigo-500/30 rounded-2xl p-5 space-y-5 shadow-2xl relative overflow-hidden font-sans">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2338] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black font-mono text-slate-100 uppercase tracking-wider">
                NARRATIVE LIFECYCLE DEPENDENCY GRAPH
              </h3>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                Setup → Character & Thread → Payoff
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Trace foreshadowed elements through their character anchors, plot threads, and climax resolution events.
            </p>
          </div>
        </div>

        {/* View Controls & Setup Selector */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="bg-[#0B1020] border border-[#1A2338] p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                viewMode === 'single'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Single Node Graph
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Lifecycle Flow
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE SETUP GRAPH VIEW */}
      {viewMode === 'single' && currentSetup && (
        <div className="space-y-4">
          {/* Setup Switcher Transport */}
          <div className="flex items-center justify-between bg-[#0B1020] border border-[#1A2338] p-2.5 rounded-xl text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevSetup}
                disabled={currentIndex === 0}
                className="p-1.5 bg-[#141B2D] border border-[#1A2338] hover:bg-[#1A2338] disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
                title="Previous Setup"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSetup}
                disabled={currentIndex === setups.length - 1}
                className="p-1.5 bg-[#141B2D] border border-[#1A2338] hover:bg-[#1A2338] disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
                title="Next Setup"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-slate-400 font-bold">
                Setup {currentIndex + 1} of {setups.length}:
              </span>
            </div>

            <select
              value={selectedSetupId}
              onChange={e => setSelectedSetupId(e.target.value)}
              className="bg-[#141B2D] border border-[#1A2338] text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 max-w-xs sm:max-w-md font-mono"
            >
              {setups.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  [{s.status.toUpperCase()}] Ch.{s.introducedChapterId || 1}: {s.title} ({s.setupType})
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Importance: <strong className="text-amber-400">{currentSetup.importance}/10</strong>
              </span>
              {isChekhov && (
                <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-bold animate-pulse">
                  ⚠️ Chekhov Warning
                </span>
              )}
            </div>
          </div>

          {/* DEPENDENCY GRAPH STAGE */}
          <div className="relative bg-[#0B1020] border border-[#1A2338] rounded-2xl p-6 min-h-[360px] flex flex-col justify-between overflow-x-auto">
            {/* SVG Connector Lines Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="setupToMidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="midToPayoffGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor={isResolved ? '#10b981' : '#ef4444'} stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connected bezier curves */}
              <path
                d="M 220 180 C 290 180, 290 100, 360 100"
                stroke="url(#setupToMidGrad)"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
              <path
                d="M 220 180 C 290 180, 290 260, 360 260"
                stroke="url(#setupToMidGrad)"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4,4"
              />
              <path
                d="M 580 100 C 650 100, 650 180, 720 180"
                stroke="url(#midToPayoffGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 580 260 C 650 260, 650 180, 720 180"
                stroke="url(#midToPayoffGrad)"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>

            {/* 3-COLUMN GRAPH ARCHITECTURE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 items-stretch">
              
              {/* COLUMN 1: SETUP NODE */}
              <div className="flex flex-col justify-center">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold mb-2 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>1. FORESHADOWED SETUP</span>
                </div>

                <div
                  onClick={() =>
                    setSelectedNodeDetails({
                      type: 'setup',
                      id: currentSetup.id,
                      title: currentSetup.title,
                      subtitle: `Type: ${currentSetup.setupType} | Introduced in Ch.${currentSetup.introducedChapterId || 1}`,
                      description: currentSetup.description,
                      meta: {
                        Importance: `${currentSetup.importance}/10`,
                        Status: currentSetup.status,
                        Age: `${age} Chapters`,
                        Tags: currentSetup.tags.join(', '),
                        Notes: currentSetup.notes || 'None'
                      }
                    })
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 hover:scale-[1.02] shadow-xl ${
                    isChekhov
                      ? 'bg-red-950/30 border-red-500/80 shadow-red-950/50'
                      : 'bg-[#141B2D] border-amber-500/50 hover:border-amber-400 shadow-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                      {currentSetup.setupType}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {currentSetup.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-mono">
                      {currentSetup.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                      {currentSetup.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="pt-2 border-t border-[#1A2338] flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="bg-[#0B1020] px-2 py-0.5 rounded text-slate-400 border border-[#1A2338]">
                      Ch.{currentSetup.introducedChapterId || 1}
                    </span>
                    <span className="bg-[#0B1020] px-2 py-0.5 rounded text-amber-300 border border-[#1A2338]">
                      Importance: {currentSetup.importance}/10
                    </span>
                    <span className="bg-[#0B1020] px-2 py-0.5 rounded text-purple-300 border border-[#1A2338]">
                      Age: {age} Chs
                    </span>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: ASSOCIATED ENTITIES (CHARACTERS & THREADS) */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>2. ANCHOR ENTITIES & PLOT THREADS</span>
                </div>

                {/* Character Anchors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Key Characters Linked ({displayCharacters.length})
                  </span>
                  {displayCharacters.map(char => (
                    <div
                      key={char.id}
                      onClick={() =>
                        setSelectedNodeDetails({
                          type: 'character',
                          id: char.id,
                          title: char.name,
                          subtitle: `Role: ${char.role} | Mood: ${char.emotionalState?.mood || 'Focused'}`,
                          description: `Primary goals: ${char.goals}`,
                          meta: {
                            Status: char.status,
                            'Arc Progress': `${char.arcProgress}%`,
                            Traits: char.traits?.join(', ') || 'Determined'
                          }
                        })
                      }
                      className="p-3 bg-[#141B2D] border border-indigo-500/40 hover:border-indigo-400 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center font-mono text-xs font-bold text-indigo-200">
                          {char.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-100 font-mono">
                            {char.name}
                          </h5>
                          <span className="text-[10px] text-indigo-300 font-mono">
                            {char.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded">
                        Arc: {char.arcProgress}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Plot Thread Anchor */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Narrative Thread
                  </span>
                  <div
                    onClick={() =>
                      setSelectedNodeDetails({
                        type: 'thread',
                        id: linkedThread.id,
                        title: linkedThread.title,
                        subtitle: `Category: ${linkedThread.category}`,
                        description: `Status: ${linkedThread.status}`,
                        meta: {
                          'Tension Rating': `${linkedThread.tensionLevel || 7}/10`,
                          'Scope': 'Main Arc'
                        }
                      })
                    }
                    className="p-3 bg-[#141B2D] border border-purple-500/40 hover:border-purple-400 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-purple-200 font-mono">
                        {linkedThread.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Category: {linkedThread.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/30 rounded">
                      Tension: {linkedThread.tensionLevel || 7}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: EVENTUAL PAYOFF EVENT */}
              <div className="flex flex-col justify-center">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-2 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3. CLIMAX RESOLUTION & PAYOFF</span>
                </div>

                {linkedPayoffs.length > 0 ? (
                  <div className="space-y-3">
                    {linkedPayoffs.map(payoff => (
                      <div
                        key={payoff.id}
                        onClick={() =>
                          setSelectedNodeDetails({
                            type: 'payoff',
                            id: payoff.id,
                            title: payoff.title,
                            subtitle: `Payoff Strength: ${payoff.payoffStrength}/10`,
                            description: payoff.description,
                            meta: {
                              'Resolved In Scene': payoff.sceneId,
                              Consequences: payoff.consequences?.join(', ') || 'Major world shift'
                            }
                          })
                        }
                        className="p-4 bg-[#141B2D] border border-emerald-500/50 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all space-y-3 shadow-xl shadow-emerald-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                            PAYOFF RESOLVED
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                            Strength: {payoff.payoffStrength}/10
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-emerald-200 font-mono">
                            {payoff.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                            {payoff.description}
                          </p>
                        </div>

                        {payoff.consequences && payoff.consequences.length > 0 && (
                          <div className="pt-2 border-t border-[#1A2338] text-[10px] font-mono text-emerald-400">
                            Impact: {payoff.consequences[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* UNRESOLVED PAYOFF PLACEHOLDER NODE */
                  <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isChekhov
                      ? 'bg-red-950/20 border-red-500/80 shadow-lg shadow-red-950/40'
                      : 'bg-[#141B2D]/70 border-dashed border-amber-500/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                        AWAITING PAYOFF
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">
                        Age: {age} Chs
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unresolved Narrative Tension</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        This setup has been open for {age} chapters with no logged payoff event in the manuscript.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-[#1A2338] flex items-center justify-between gap-2">
                      {onSelectSetupForAiPayoff && (
                        <button
                          onClick={() => onSelectSetupForAiPayoff(currentSetup.id)}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-mono font-bold transition-all flex items-center space-x-1 shadow flex-1 justify-center"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Suggest AI Payoff</span>
                        </button>
                      )}

                      {onLogPayoffForSetup && (
                        <button
                          onClick={() => onLogPayoffForSetup(currentSetup)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-mono font-bold transition-all flex items-center space-x-1 shadow flex-1 justify-center"
                        >
                          <Check className="w-3 h-3" />
                          <span>Log Payoff</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATRIX FLOW VIEW (ALL SETUPS DEPENDENCY FLOW) */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 bg-[#0B1020] p-3 rounded-xl border border-[#1A2338] flex items-center justify-between">
            <span>FULL MANUSCRIPT SETUPS & PAYOFF FLOW MAP ({setups.length} Setups)</span>
            <span className="text-amber-400">
              Click any setup row to select for detailed inspection
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {setups.map(sup => {
              const supPayoffs = payoffs.filter(p => p.setupIds.includes(sup.id));
              const supAge = getSetupAge(sup, currentChapter);
              const supChekhov = isChekhovWarning(sup, currentChapter);

              return (
                <div
                  key={sup.id}
                  onClick={() => {
                    setSelectedSetupId(sup.id);
                    setViewMode('single');
                  }}
                  className={`p-3 bg-[#0B1020] border rounded-xl cursor-pointer hover:border-indigo-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs ${
                    sup.id === selectedSetupId
                      ? 'border-indigo-500 bg-indigo-950/20'
                      : supChekhov
                      ? 'border-red-500/70 bg-red-950/10'
                      : 'border-[#1A2338]'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">
                      {sup.importance}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100">{sup.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                          {sup.setupType}
                        </span>
                        {supChekhov && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded font-bold">
                            ⚠️ Chekhov
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {sup.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>{sup.introducedBy.join(', ') || 'Elara'}</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

                    <div className="min-w-[140px] text-right">
                      {supPayoffs.length > 0 ? (
                        <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold block truncate">
                          ✓ {supPayoffs[0].title}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded block">
                          Pending (Age: {supAge} Chs)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NODE INSPECTOR MODAL */}
      {selectedNodeDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-indigo-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded">
                  {selectedNodeDetails.type.toUpperCase()} NODE INSPECTOR
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono mt-1">
                  {selectedNodeDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-slate-400 font-mono">
                {selectedNodeDetails.subtitle}
              </div>

              <div className="bg-[#0B1020] p-3 rounded-xl border border-[#1A2338] text-slate-300 leading-relaxed">
                {selectedNodeDetails.description}
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Metadata Attributes
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  {Object.entries(selectedNodeDetails.meta).map(([k, v]) => (
                    <div key={k} className="p-2 bg-[#0B1020] rounded border border-[#1A2338]">
                      <span className="text-slate-500 block text-[9px]">{k}</span>
                      <span className="text-slate-200 font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-bold transition-all"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
