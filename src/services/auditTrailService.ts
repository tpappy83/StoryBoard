import { create } from 'zustand';
import { AuditLogEntry } from '../types/auditSync';
import { NarrativeSyncService } from './narrativeSyncService';

interface NarrativeCheckpoint {
  id: string;
  name: string;
  timestamp: string;
  version: number;
  snapshotState: Record<string, any>;
}

interface AuditTrailState {
  auditLogs: AuditLogEntry[];
  checkpoints: NarrativeCheckpoint[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'sequenceNumber' | 'previousVersion' | 'newVersion'>) => AuditLogEntry;
  createCheckpoint: (name: string, stateSnapshot: Record<string, any>) => NarrativeCheckpoint;
  loadAuditLogs: () => Promise<void>;
  rollbackToCheckpoint: (checkpointId: string, applyStateCallback: (state: Record<string, any>) => void) => Promise<boolean>;
  rollbackToVersion: (version: number, applyStateCallback: (state: Record<string, any>) => void) => Promise<boolean>;
}

export const useAuditTrailStore = create<AuditTrailState>((set, get) => ({
  auditLogs: [
    {
      id: 'aud_init_1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transactionId: 'tx_init',
      sequenceNumber: 1,
      actionType: 'STATE_SYNC',
      summary: 'Initialized Canonical Story Universe state & obligation tracking.',
      previousVersion: 0,
      newVersion: 1
    }
  ],
  checkpoints: [],

  addAuditLog: (entryData) => {
    const syncService = NarrativeSyncService.getInstance();
    const currentVersion = syncService.getClientVersion();
    const newVersion = currentVersion + 1;
    syncService.setClientVersion(newVersion);

    const logEntry: AuditLogEntry = {
      ...entryData,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sequenceNumber: newVersion,
      previousVersion: currentVersion,
      newVersion
    };

    set((state) => ({
      auditLogs: [logEntry, ...state.auditLogs].slice(0, 100) // retain last 100 entries locally
    }));

    return logEntry;
  },

  createCheckpoint: (name, stateSnapshot) => {
    const syncService = NarrativeSyncService.getInstance();
    const ver = syncService.getClientVersion();
    const checkpoint: NarrativeCheckpoint = {
      id: `ckpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      timestamp: new Date().toLocaleString(),
      version: ver,
      snapshotState: JSON.parse(JSON.stringify(stateSnapshot))
    };

    set((state) => ({
      checkpoints: [checkpoint, ...state.checkpoints]
    }));

    // Record audit log entry
    get().addAuditLog({
      transactionId: `tx_ckpt_${checkpoint.id}`,
      actionType: 'STATE_SYNC',
      summary: `Created story state continuity checkpoint: "${name}" at Version ${ver}.`,
      targetObjectType: 'checkpoint',
      targetObjectId: checkpoint.id
    });

    return checkpoint;
  },

  loadAuditLogs: async () => {
    try {
      const res = await fetch('/api/audit-trail');
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs && Array.isArray(data.auditLogs)) {
          set({ auditLogs: data.auditLogs });
        }
        if (data.checkpoints && Array.isArray(data.checkpoints)) {
          set({ checkpoints: data.checkpoints });
        }
      }
    } catch (err) {
      console.warn('Failed fetching remote audit log history:', err);
    }
  },

  rollbackToCheckpoint: async (checkpointId, applyStateCallback) => {
    const cp = get().checkpoints.find((c) => c.id === checkpointId);
    if (!cp) return false;

    try {
      // Call server rollback endpoint
      const res = await fetch('/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.restoredState) {
          applyStateCallback(data.restoredState);
        } else {
          applyStateCallback(cp.snapshotState);
        }
      } else {
        applyStateCallback(cp.snapshotState);
      }

      get().addAuditLog({
        transactionId: `tx_rollback_${checkpointId}`,
        actionType: 'ROLLBACK_EXECUTED',
        summary: `Rolled back story state to checkpoint "${cp.name}" (Version ${cp.version}).`,
        targetObjectType: 'checkpoint',
        targetObjectId: checkpointId
      });

      return true;
    } catch (err) {
      console.error('Rollback failed:', err);
      return false;
    }
  },

  rollbackToVersion: async (version, applyStateCallback) => {
    try {
      const res = await fetch('/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: version })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.restoredState) {
          applyStateCallback(data.restoredState);

          get().addAuditLog({
            transactionId: `tx_rollback_v${version}`,
            actionType: 'ROLLBACK_EXECUTED',
            summary: `Rolled back narrative obligations to state Version ${version}.`,
            targetObjectType: 'version',
            targetObjectId: version.toString()
          });

          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Version rollback error:', err);
      return false;
    }
  }
}));
