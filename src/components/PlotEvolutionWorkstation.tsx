import React, { useState } from 'react';
import { PlotThread, Scene, Character, CanonFact, TimelineEvent, ConvergenceEvent } from '../types';
import { SetupEvent, PayoffEvent } from '../types/setupPayoff';
import { GitBranch, Flame, RefreshCw, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, Zap, Layers, Plus, TrendingUp, ShieldAlert } from 'lucide-react';

interface PlotEvolutionWorkstationProps {
  plotThreads: PlotThread[];
  scenes: Scene[];
  characters: Character[];
  canonFacts: CanonFact[];
  timelineEvents: TimelineEvent[];
  setups: SetupEvent[];
  payoffs: PayoffEvent[];
  convergenceEvents: ConvergenceEvent[];
  onUpdatePlotThread: (thread: PlotThread) => void;
  onAddScene: (scene: Scene) => void;
  onAddTimelineEvent: (event: TimelineEvent) => void;
}

export interface EvolutionBranch {
  title: string;
  summary: string;
  tensionDelta: number;
  proposedSceneTitle: string;
  proposedSceneLocation: string;
  proposedProseOutline: string;
  characterImpacts: string[];
  linkedSetups: string[];
}

export interface EvolutionBranches {
  escalation: EvolutionBranch;
  subversion: EvolutionBranch;
  convergence: EvolutionBranch;
  resolution: EvolutionBranch;
}

export const PlotEvolutionWorkstation: React.FC<PlotEvolutionWorkstationProps> = ({
  plotThreads,
  scenes,
  characters,
  canonFacts,
  timelineEvents,
  setups,
  payoffs,
  convergenceEvents,
  onUpdatePlotThread,
  onAddScene,
  onAddTimelineEvent
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(plotThreads[0]?.id || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [branches, setBranches] = useState<EvolutionBranches | null>(null);
  const [selectedBranchType, setSelectedBranchType] = useState<'escalation' | 'subversion' | 'convergence' | 'resolution'>('escalation');
  const [applySuccessMessage, setApplySuccessMessage] = useState<string>('');
  const [isQuotaNotice, setIsQuotaNotice] = useState<boolean>(false);

  const selectedThread = plotThreads.find(t => t.id === selectedThreadId) || plotThreads[0];

  // Compute tension heat values (1-10) across 10 timeline phases
  const getPhaseTension = (thread: PlotThread, phase: number): number => {
    const threadScenes = scenes.filter(s => s.threadId === thread.id || s.timelinePhase === phase);
    const sceneCount = threadScenes.length;
    const baseTension = (thread.importance || 5) + Math.min(sceneCount * 2, 4);
    if (phase === 1) return Math.max(1, baseTension - 3);
    if (phase === 5) return Math.min(10, baseTension + 1);
    if (phase === 9 || phase === 10) return Math.min(10, baseTension + 3);
    return Math.min(10, Math.max(1, baseTension + (phase % 3) - 1));
  };

  const handleFetchEvolutionBranches = async (threadId?: string) => {
    setIsLoading(true);
    setApplySuccessMessage('');
    setIsQuotaNotice(false);
    const targetId = threadId || selectedThreadId;
    try {
      const res = await fetch('/api/plot-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: targetId,
          actionType: 'GENERATE_BRANCHES',
          context: {
            plotThreads,
            scenes: scenes.map(s => ({ id: s.id, title: s.title, threadId: s.threadId })),
            characters: characters.map(c => ({ id: c.id, name: c.name, role: c.role })),
            setups: setups.map(s => ({ id: s.id, title: s.title, status: s.status })),
            payoffs: payoffs.map(p => ({ id: p.id, title: p.title })),
            canonFacts: canonFacts.slice(0, 5).map(f => ({ id: f.id, fact: f.fact }))
          }
        })
      });
      const data = await res.json();
      if (data.success && data.branches) {
        setBranches(data.branches);
        if (data.isQuotaExceeded || data.isFallback) {
          setIsQuotaNotice(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plot evolution branches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyBranch = (branchKey: 'escalation' | 'subversion' | 'convergence' | 'resolution') => {
    if (!selectedThread || !branches) return;
    const branch = branches[branchKey];

    // 1. Update plot thread escalation or status
    const updatedThread: PlotThread = {
      ...selectedThread,
      escalation: `${selectedThread.escalation || ''}\n[EVOLVED: ${branch.title}] ${branch.summary}`,
      status: branchKey === 'resolution' ? 'Resolved' : 'Active',
      isStale: false
    };
    onUpdatePlotThread(updatedThread);

    // 2. Create new proposed scene
    const newScene: Scene = {
      id: `scene_evo_${Date.now()}`,
      chapter: Math.max(...scenes.map(s => s.chapter || 1), 1) + 1,
      padIndex: (scenes.length % 16) + 1,
      title: branch.proposedSceneTitle,
      location: branch.proposedSceneLocation,
      participantIds: characters.slice(0, 3).map(c => c.id),
      purpose: `[Plot Evolution: ${branch.title}] ${branch.summary}`,
      status: 'Drafted',
      prose: `# ${branch.proposedSceneTitle}\n\n**Location:** ${branch.proposedSceneLocation}\n\n${branch.proposedProseOutline}\n\n*Character Impact:* ${branch.characterImpacts.join(', ')}`,
      expectedConsequences: branch.characterImpacts,
      timelinePhase: Math.min(10, (selectedThread.lastSeenChapter || 1) + 1),
      wordCount: 120,
      threadId: selectedThread.id
    };
    onAddScene(newScene);

    // 3. Add timeline event
    const newTimelineEvent: TimelineEvent = {
      id: `evt_evo_${Date.now()}`,
      timestampLabel: `Phase ${newScene.timelinePhase} - Evolution Event`,
      phase: newScene.timelinePhase,
      layer: 'Character',
      description: `[Plot Evolution] ${branch.title}: ${branch.summary}`,
      involvedCharIds: newScene.participantIds,
      conflictStatus: 'Valid'
    };
    onAddTimelineEvent(newTimelineEvent);

    setApplySuccessMessage(`Successfully applied "${branch.title}"! Created Scene "${branch.proposedSceneTitle}" & updated Plot Thread.`);
    setTimeout(() => setApplySuccessMessage(''), 5000);
  };

  return (
    <div className="flex-1 bg-[#090D16] text-slate-200 p-6 overflow-y-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 bg-[#0B101F] border border-[#1E293B] rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-wide">PLOT EVOLUTION & ARC TRAJECTORY ENGINE</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                v2.5 DYNAMIC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Analyze plot thread tension curves, identify stale arcs, and simulate AI evolutionary plot branches across chapters.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleFetchEvolutionBranches()}
          disabled={isLoading || !selectedThread}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>SIMULATING BRANCHES...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>SIMULATE PLOT EVOLUTION</span>
            </>
          )}
        </button>
      </div>

      {applySuccessMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{applySuccessMessage}</span>
        </div>
      )}

      {isQuotaNotice && (
        <div className="p-4 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Gemini API Quota Notice:</strong> Rate limit reached on free tier. Successfully switched to synthetic plot evolution story engine. All branch options are fully functional.
            </span>
          </div>
          <button
            onClick={() => setIsQuotaNotice(false)}
            className="text-amber-400 hover:text-amber-200 text-xs underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Thread Selection & Tension Curve Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Plot Threads List */}
        <div className="p-5 bg-[#0D1322] border border-[#1E293B] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              MANUSCRIPT PLOT THREADS ({plotThreads.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {plotThreads.map(thread => {
              const isSelected = thread.id === selectedThreadId;
              const linkedScenes = scenes.filter(s => s.threadId === thread.id);
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setSelectedThreadId(thread.id);
                    setBranches(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-[#090D16] border-[#1E293B] hover:border-slate-700 hover:bg-[#111726]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thread.color || '#6366f1' }} />
                      {thread.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      thread.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      thread.status === 'Dormant' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-700/40 text-slate-400'
                    }`}>
                      {thread.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {thread.setup || 'No setup defined.'}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Category: <strong className="text-slate-200">{thread.threadCategory || 'Mystery'}</strong></span>
                    <span>Scenes: <strong className="text-indigo-300">{linkedScenes.length}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Thread Tension Matrix & Arc Health */}
        <div className="lg:col-span-2 space-y-6">
          {selectedThread ? (
            <div className="p-5 bg-[#0D1322] border border-[#1E293B] rounded-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedThread.color || '#6366f1' }} />
                    {selectedThread.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: {selectedThread.threadCategory || 'Mystery'} | Status: {selectedThread.status}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs font-mono text-slate-300">
                    Importance: <strong className="text-amber-400">{selectedThread.importance || 7}/10</strong>
                  </span>
                </div>
              </div>

              {/* Phase-by-Phase Tension Curve Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    PHASE TENSION CURVE (PHASES 1 TO 10)
                  </span>
                  <span>Climax Target: Phase 9-10</span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 p-3 bg-[#090D16] border border-[#1E293B] rounded-xl">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(phase => {
                    const tension = getPhaseTension(selectedThread, phase);
                    const isHigh = tension >= 8;
                    const isMed = tension >= 5;
                    return (
                      <div key={phase} className="flex flex-col items-center space-y-2">
                        <div className="w-full bg-[#141B2D] h-24 rounded-lg flex flex-col justify-end p-1 relative overflow-hidden border border-[#1E293B]">
                          <div
                            className={`w-full rounded transition-all ${
                              isHigh ? 'bg-gradient-to-t from-rose-600 to-amber-500' :
                              isMed ? 'bg-gradient-to-t from-indigo-600 to-purple-500' :
                              'bg-gradient-to-t from-slate-700 to-indigo-800'
                            }`}
                            style={{ height: `${tension * 10}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">P{phase}</span>
                        <span className={`text-[10px] font-mono font-bold ${
                          isHigh ? 'text-rose-400' : isMed ? 'text-indigo-300' : 'text-slate-500'
                        }`}>
                          {tension}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arc Setup, Escalation, & Payoff Triad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">SETUP BEAT</span>
                  <p className="text-slate-200 line-clamp-3 leading-relaxed">{selectedThread.setup || 'None'}</p>
                </div>
                <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">ESCALATION BEAT</span>
                  <p className="text-slate-200 line-clamp-3 leading-relaxed">{selectedThread.escalation || 'None'}</p>
                </div>
                <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">PAYOFF RESOLUTION</span>
                  <p className="text-slate-200 line-clamp-3 leading-relaxed">{selectedThread.payoff || 'None'}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 bg-[#0D1322] border border-[#1E293B] rounded-2xl text-center text-slate-400 text-xs">
              Select a plot thread from the left menu to inspect tension dynamics.
            </div>
          )}

          {/* Evolution Branch Options Preview Cards */}
          {branches && (
            <div className="p-5 bg-[#0D1322] border border-[#1E293B] rounded-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-mono font-bold text-amber-400 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  SIMULATED EVOLUTION BRANCH PATHWAYS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Select a branch pathway to apply to universe state
                </span>
              </div>

              {/* Branch Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'escalation', label: '1. Escalation', color: 'rose' },
                  { key: 'subversion', label: '2. Subversion', color: 'purple' },
                  { key: 'convergence', label: '3. Convergence', color: 'indigo' },
                  { key: 'resolution', label: '4. Resolution', color: 'emerald' }
                ].map(tab => {
                  const isSelected = selectedBranchType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedBranchType(tab.key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center font-mono ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                          : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Selected Branch Detail Box */}
              {branches[selectedBranchType] && (
                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      {branches[selectedBranchType].title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                      Tension Delta: +{branches[selectedBranchType].tensionDelta}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {branches[selectedBranchType].summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0F172A] border border-[#1E293B] rounded-lg space-y-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold block">PROPOSED NEW SCENE</span>
                      <strong className="text-slate-200 block">{branches[selectedBranchType].proposedSceneTitle}</strong>
                      <span className="text-[11px] text-slate-400">Loc: {branches[selectedBranchType].proposedSceneLocation}</span>
                    </div>

                    <div className="p-3 bg-[#0F172A] border border-[#1E293B] rounded-lg space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 font-bold block">CHARACTER IMPACTS</span>
                      <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                        {branches[selectedBranchType].characterImpacts.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyBranch(selectedBranchType)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPLY "{branches[selectedBranchType].title.toUpperCase()}" TO UNIVERSE STATE</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
