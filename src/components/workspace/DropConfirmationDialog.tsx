import React from 'react';
import { ProposedChange, NarrativeDropResult } from '../../interactions/narrativeDragTypes';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, Users, Layers, GitBranch } from 'lucide-react';

interface DropConfirmationDialogProps {
  isOpen: boolean;
  dropResult: NarrativeDropResult | null;
  onConfirm: (payloadData?: any) => void;
  onCancel: () => void;
}

export const DropConfirmationDialog: React.FC<DropConfirmationDialogProps> = ({
  isOpen,
  dropResult,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !dropResult || dropResult.status === 'rejected') return null;

  const change: ProposedChange | undefined = dropResult.proposedChange;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1527] border border-indigo-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl shadow-indigo-950/50 text-slate-200 space-y-5 relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-semibold">
                Relationship-Aware Story Operation
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-serif">
                {change?.title || dropResult.message}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1020] p-3 rounded-xl border border-[#1A2338]">
          {change?.description || dropResult.message}
        </p>

        {/* Relationship Tensions Section */}
        {change?.relationshipTensions && change.relationshipTensions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Interpersonal Relationship Analysis</span>
            </div>
            <div className="bg-[#0B1020] p-3 rounded-xl border border-indigo-500/20 space-y-1.5 text-xs">
              {change.relationshipTensions.map((tension, i) => (
                <div key={i} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{tension}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings & Continuity Checks */}
        {change?.warnings && change.warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Continuity & Lore Audit Warnings</span>
            </div>
            <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30 space-y-1 text-xs text-amber-200">
              {change.warnings.map((warn, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Level Badge */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1A2338]">
          <span className="text-slate-400 font-mono text-[11px]">
            Requires Canon Memory Commitment
          </span>
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
              change?.impactLevel === 'high' || change?.impactLevel === 'critical'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            Impact: {change?.impactLevel || 'Medium'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel Drop
          </button>
          <button
            onClick={() => onConfirm(change?.payloadData)}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Commit Change</span>
          </button>
        </div>
      </div>
    </div>
  );
};
