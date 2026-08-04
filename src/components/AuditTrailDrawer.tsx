import React, { useState, useEffect } from 'react';
import { useAuditTrailStore } from '../services/auditTrailService';
import { NarrativeSyncService } from '../services/narrativeSyncService';
import { SyncConnectionStatus } from '../types/auditSync';
import { History, Shield, RefreshCw, Bookmark, ArrowLeft, Wifi, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRestoredState: (state: Record<string, any>) => void;
  currentStateSnapshot: Record<string, any>;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  onApplyRestoredState,
  currentStateSnapshot
}) => {
  const { auditLogs, checkpoints, createCheckpoint, rollbackToCheckpoint, rollbackToVersion, loadAuditLogs } = useAuditTrailStore();
  const [syncStatus, setSyncStatus] = useState<SyncConnectionStatus>('connected');
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [checkpointName, setCheckpointName] = useState('');
  const [isRollbackLoading, setIsRollbackLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit_log' | 'checkpoints'>('audit_log');

  useEffect(() => {
    const syncService = NarrativeSyncService.getInstance();
    const unsub = syncService.subscribe((status, pendingCount, syncedAt) => {
      setSyncStatus(status);
      setPendingQueueCount(pendingCount);
      setLastSyncedAt(syncedAt);
    });
    loadAuditLogs();
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleCreateCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointName.trim()) return;
    createCheckpoint(checkpointName.trim(), currentStateSnapshot);
    setCheckpointName('');
  };

  const handleRollbackCheckpoint = async (id: string) => {
    if (!window.confirm('Are you sure you want to rollback story universe state to this checkpoint? Current unsaved modifications will be reverted.')) return;
    setIsRollbackLoading(true);
    const success = await rollbackToCheckpoint(id, (restoredState) => {
      onApplyRestoredState(restoredState);
    });
    setIsRollbackLoading(false);
    if (success) {
      alert('Story state successfully rolled back to target checkpoint.');
    }
  };

  const handleRollbackVersion = async (version: number) => {
    if (!window.confirm(`Rollback narrative state to Version ${version}?`)) return;
    setIsRollbackLoading(true);
    const success = await rollbackToVersion(version, (restoredState) => {
      onApplyRestoredState(restoredState);
    });
    setIsRollbackLoading(false);
    if (success) {
      alert(`Story state successfully reverted to Version ${version}.`);
    }
  };

  const syncService = NarrativeSyncService.getInstance();
  const currentVer = syncService.getClientVersion();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#090D16] border-l border-[#1E293B] flex flex-col h-full shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B101D]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Audit Trail & Sync State Engine
              </h2>
              <p className="text-xs text-slate-400">
                Transaction boundaries, offline queueing, & versioned rollback history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#141B2D] hover:bg-[#1E293B] border border-[#232F48] rounded-md transition-colors"
          >
            Close
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="px-5 py-3 bg-[#0E1526] border-b border-[#1E293B] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {syncStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                Connected & Synced
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Syncing Transaction Batch...
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                Offline Mode ({pendingQueueCount} queued)
              </span>
            )}
            {syncStatus === 'conflict' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sync Conflict Resolved
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-slate-400 font-mono">
            <span>CLIENT VER: <strong className="text-indigo-400">v{currentVer}</strong></span>
            {lastSyncedAt && <span>Last Sync: {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1E293B] bg-[#0B101D] px-5">
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'audit_log'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Log Ledger ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'checkpoints'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Story Checkpoints ({checkpoints.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'audit_log' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Recorded State Transactions & Obligations Audit</span>
                <button
                  onClick={() => loadAuditLogs()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Ledger
                </button>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                          v{log.newVersion}
                        </span>
                        <span className="font-semibold text-slate-200">{log.actionType}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{log.summary}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1E293B]/60 text-[10px] text-slate-400 font-mono">
                      <span>TX: {log.transactionId}</span>
                      <button
                        onClick={() => handleRollbackVersion(log.previousVersion)}
                        disabled={isRollbackLoading}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-sans"
                      >
                        <ArrowLeft className="w-3 h-3" /> Revert to v{log.previousVersion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'checkpoints' && (
            <div className="space-y-4">
              {/* Create Checkpoint Form */}
              <form onSubmit={handleCreateCheckpoint} className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  <span>Create Story Continuity Checkpoint</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={checkpointName}
                    onChange={(e) => setCheckpointName(e.target.value)}
                    placeholder="e.g., Pre-Act 2 Climax Convergence, Before Sector 4 betrayal"
                    className="flex-1 bg-[#090D16] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Save Snapshot
                  </button>
                </div>
              </form>

              {/* Checkpoint List */}
              <div className="space-y-2">
                {checkpoints.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#1E293B] rounded-xl text-xs text-slate-500">
                    No story continuity checkpoints created yet. Save a snapshot above before major plot shifts.
                  </div>
                ) : (
                  checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="p-4 bg-[#0F172A] border border-[#1E293B] rounded-xl space-y-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-100 text-xs">{cp.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                            v{cp.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cp.timestamp}</p>
                      </div>

                      <button
                        onClick={() => handleRollbackCheckpoint(cp.id)}
                        disabled={isRollbackLoading}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Rollback
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
