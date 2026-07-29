import React from 'react';
import { PlotThread, ConvergenceEvent } from '../types';
import { GitMerge, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface ConvergenceMapProps {
  plotThreads: PlotThread[];
  convergenceEvents: ConvergenceEvent[];
  onTriggerBackwardPlan: () => void;
}

export const ConvergenceMap: React.FC<ConvergenceMapProps> = ({
  plotThreads,
  convergenceEvents,
  onTriggerBackwardPlan
}) => {
  return (
    <div className="bg-[#141B2D] border border-[#1A2338] rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A2338] pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600/20 text-amber-400 p-2 rounded-lg border border-amber-500/30">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              STORY CONVERGENCE MAP
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                BACKWARD PLANNING MATRIX
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Backward planning model connecting concurrent plot threads to mandatory convergence nodes and climax resolution.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerBackwardPlan}
          className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>VALIDATE BACKWARD CONVERGENCE</span>
        </button>
      </div>

      {/* Flow Diagram */}
      <div className="bg-[#0B1020] p-6 rounded-xl border border-[#1A2338] space-y-6 bg-daw-grid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Active Plot Threads */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              1. PARALLEL PLOT THREADS
            </div>
            {plotThreads.map(thread => (
              <div key={thread.id} className="p-3 rounded-lg bg-[#141B2D] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-xs text-white">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thread.color }} />
                    <span>{thread.name}</span>
                  </div>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {thread.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {thread.setup}
                </p>
              </div>
            ))}
          </div>

          {/* Column 2: Convergence Events */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              2. REQUIRED CONVERGENCE NODES
            </div>
            {convergenceEvents.map(conv => (
              <div key={conv.id} className="p-3.5 rounded-lg bg-[#141B2D] border border-amber-900/60 space-y-2 relative shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-200">{conv.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    {conv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Target Outcome: {conv.targetOutcome}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                  <span>Threads:</span>
                  {conv.connectingThreadIds.map(tid => {
                    const t = plotThreads.find(p => p.id === tid);
                    return (
                      <span key={tid} className="px-1.5 rounded bg-slate-800 text-slate-300">
                        {t?.name || tid}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Climax Resolution */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              3. FINAL RESOLUTION GOAL
            </div>
            <div className="p-4 rounded-lg bg-[#141B2D] border border-emerald-900/60 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>RESOLVED CANON FINALE</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                The Orbit-9 Citadel energy grid collapses. Ava, Liam, and Rowan must decide whether to restart the Citadel AI or initiate the Earth Surface Return protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
