export interface AuditLogEntry {
  id: string;
  timestamp: string;
  transactionId: string;
  sequenceNumber: number;
  authorId?: string;
  actionType:
    | 'STATE_SYNC'
    | 'SETUP_CREATED'
    | 'SETUP_RESOLVED'
    | 'PAYOFF_CREATED'
    | 'SCENE_MUTATED'
    | 'CHARACTER_MUTATED'
    | 'CANON_MUTATED'
    | 'ROLLBACK_EXECUTED'
    | 'CONFLICT_RESOLVED';
  summary: string;
  targetObjectType?: string;
  targetObjectId?: string;
  previousVersion: number;
  newVersion: number;
  snapshotDelta?: Record<string, unknown>;
}

export interface SyncStatePayload {
  clientVersion: number;
  sequenceNumber: number;
  transactionId: string;
  timestamp: string;
  state: Record<string, any>;
  auditEntries?: AuditLogEntry[];
}

export interface SyncResponse {
  success: boolean;
  serverVersion: number;
  conflictDetected?: boolean;
  conflictReason?: string;
  serverState?: Record<string, any>;
  transactionId?: string;
}

export type SyncConnectionStatus = 'connected' | 'syncing' | 'offline' | 'conflict' | 'error';

export interface OfflineQueueItem {
  id: string;
  timestamp: number;
  payload: SyncStatePayload;
  retryCount: number;
}
