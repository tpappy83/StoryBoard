import React from 'react';
import {
  Users,
  Layers,
  GitBranch,
  ShieldCheck,
  Brain,
  AlertTriangle,
  Sparkles,
  FileText,
  Clapperboard,
  Activity,
  CheckCircle,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface StatusDockProps {
  characterCount: number;
  sceneCount: number;
  threadCount: number;
  canonCount: number;
  memoryCount: number;
  warningCount: number;
  simulationStatus?: 'Ready' | 'Simulating' | 'Complete';
  keepConnected?: boolean;
  onOpenTool?: (toolName: string) => void;
  onOpenKeepWorkspace?: () => void;
  onRunAudit?: () => void;
}

export const StatusDock: React.FC<StatusDockProps> = ({
  characterCount,
  sceneCount,
  threadCount,
  canonCount,
  memoryCount,
  warningCount,
  simulationStatus = 'Ready',
  keepConnected = false,
  onOpenTool,
  onOpenKeepWorkspace,
  onRunAudit
}) => {
  return (
    <footer className="bg-[#0B1020] border-t border-[#1A2338] px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-3 select-none">
      {/* Brand & Status telemetry */}
      <div className="flex items-center space-x-4 flex-wrap gap-y-2">
        <div className="flex items-center space-x-1.5 font-bold text-slate-100">
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-indigo-400">iNarrator</span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-slate-400">TELEMETRY DOCK</span>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={() => onOpenTool && onOpenTool('CHARACTER')}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors bg-[#141B2D] px-2 py-0.5 rounded border border-[#1A2338]"
            title="View Characters"
          >
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Characters:</span>
            <span className="font-bold text-slate-200">{characterCount}</span>
          </button>

          <button
            onClick={() => onOpenTool && onOpenTool('WRITING_STUDIO')}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40 font-bold text-indigo-300"
            title="Open Writing Studio Workstation"
          >
            <Clapperboard className="w-3 h-3 text-indigo-400" />
            <span>Writing Studio</span>
          </button>

          <button
            onClick={() => onOpenTool && onOpenTool('WRITING')}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors bg-[#141B2D] px-2 py-0.5 rounded border border-[#1A2338]"
            title="View Scenes"
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Scenes:</span>
            <span className="font-bold text-slate-200">{sceneCount}</span>
          </button>

          <button
            onClick={() => onOpenTool && onOpenTool('PLANNING')}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors bg-[#141B2D] px-2 py-0.5 rounded border border-[#1A2338]"
            title="View Plot Threads"
          >
            <GitBranch className="w-3 h-3 text-rose-400" />
            <span className="text-slate-400">Threads:</span>
            <span className="font-bold text-slate-200">{threadCount}</span>
          </button>

          <button
            onClick={() => onOpenTool && onOpenTool('CONTINUITY')}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors bg-[#141B2D] px-2 py-0.5 rounded border border-[#1A2338]"
            title="View Canon Facts"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Canon:</span>
            <span className="font-bold text-slate-200">{canonCount}</span>
          </button>

          <button
            onClick={() => onOpenTool && onOpenTool('CONTINUITY')}
            className={`flex items-center space-x-1 transition-colors px-2 py-0.5 rounded border ${
              warningCount > 0
                ? 'bg-rose-950/60 border-rose-800 text-rose-300 animate-pulse'
                : 'bg-[#141B2D] border-[#1A2338] text-slate-400'
            }`}
            title="View Continuity Warnings"
          >
            <AlertTriangle
              className={`w-3 h-3 ${
                warningCount > 0 ? 'text-rose-400' : 'text-slate-500'
              }`}
            />
            <span>Warnings:</span>
            <span className="font-bold">{warningCount}</span>
          </button>
        </div>
      </div>

      {/* Right System Telemetry */}
      <div className="flex items-center space-x-3 text-[11px]">
        {/* Simulation Status */}
        <div className="flex items-center space-x-1.5 bg-[#141B2D] px-2.5 py-0.5 rounded border border-[#1A2338]">
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-slate-400">Simulation:</span>
          <span className="font-bold text-purple-300">{simulationStatus}</span>
        </div>

        {/* Google Keep Workspace Status */}
        {onOpenKeepWorkspace && (
          <button
            onClick={onOpenKeepWorkspace}
            className="flex items-center space-x-1 bg-[#141B2D] hover:bg-amber-950/40 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 transition-colors"
            title="Open Google Keep Workspace"
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>Keep Sync</span>
          </button>
        )}

        {/* Quick Audit Button */}
        {onRunAudit && (
          <button
            onClick={onRunAudit}
            className="px-2.5 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition-all flex items-center space-x-1 font-bold"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Audit</span>
          </button>
        )}
      </div>
    </footer>
  );
};
