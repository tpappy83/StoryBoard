import { AuditLogEntry, OfflineQueueItem, SyncConnectionStatus, SyncResponse } from '../types/auditSync';

const OFFLINE_QUEUE_KEY = 'narrative_os_offline_sync_queue';
const CLIENT_VERSION_KEY = 'narrative_os_client_version';

export type SyncStateListener = (status: SyncConnectionStatus, pendingCount: number, lastSyncedAt: Date | null) => void;

export class NarrativeSyncService {
  private static instance: NarrativeSyncService | null = null;

  private clientVersion = 1;
  private sequenceNumber = 0;
  private syncStatus: SyncConnectionStatus = 'connected';
  private pendingQueue: OfflineQueueItem[] = [];
  private listeners: Set<SyncStateListener> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingStatePayload: Record<string, any> | null = null;
  private pendingAuditEntries: AuditLogEntry[] = [];
  private lastSyncedAt: Date | null = new Date();
  private isProcessingQueue = false;

  private constructor() {
    this.loadSavedState();
    this.setupNetworkListeners();
  }

  public static getInstance(): NarrativeSyncService {
    if (!NarrativeSyncService.instance) {
      NarrativeSyncService.instance = new NarrativeSyncService();
    }
    return NarrativeSyncService.instance;
  }

  private loadSavedState() {
    try {
      const savedVersion = localStorage.getItem(CLIENT_VERSION_KEY);
      if (savedVersion) {
        this.clientVersion = parseInt(savedVersion, 10) || 1;
      }
      const rawQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (rawQueue) {
        this.pendingQueue = JSON.parse(rawQueue);
      }
    } catch (e) {
      console.warn('[NarrativeSyncService] Failed loading offline queue from storage:', e);
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.pendingQueue));
      localStorage.setItem(CLIENT_VERSION_KEY, this.clientVersion.toString());
    } catch (e) {
      console.warn('[NarrativeSyncService] Failed saving offline queue:', e);
    }
  }

  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[NarrativeSyncService] Network connection restored. Processing queue...');
        this.syncStatus = 'connected';
        this.notifyListeners();
        this.flushOfflineQueue();
      });

      window.addEventListener('offline', () => {
        console.warn('[NarrativeSyncService] Client went offline. Mutations will be queued locally.');
        this.syncStatus = 'offline';
        this.notifyListeners();
      });
    }
  }

  public subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.syncStatus, this.pendingQueue.length, this.lastSyncedAt);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.syncStatus, this.pendingQueue.length, this.lastSyncedAt));
  }

  public getClientVersion(): number {
    return this.clientVersion;
  }

  public setClientVersion(ver: number) {
    this.clientVersion = ver;
    localStorage.setItem(CLIENT_VERSION_KEY, ver.toString());
  }

  /**
   * Queue a state sync payload with batching / debouncing
   */
  public queueStateSync(updatedStateDelta: Record<string, any>, auditEntry?: AuditLogEntry, debounceMs = 600) {
    this.sequenceNumber += 1;
    this.pendingStatePayload = {
      ...(this.pendingStatePayload || {}),
      ...updatedStateDelta
    };

    if (auditEntry) {
      this.pendingAuditEntries.push(auditEntry);
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushPendingSync();
    }, debounceMs);
  }

  /**
   * Flush current pending batched payload immediately
   */
  public async flushPendingSync(): Promise<SyncResponse | null> {
    if (!this.pendingStatePayload) return null;

    const payloadState = { ...this.pendingStatePayload };
    const auditEntries = [...this.pendingAuditEntries];
    this.pendingStatePayload = null;
    this.pendingAuditEntries = [];

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const syncPayload = {
      clientVersion: this.clientVersion,
      sequenceNumber: this.sequenceNumber,
      transactionId,
      timestamp: new Date().toISOString(),
      state: payloadState,
      auditEntries
    };

    return this.sendSyncRequest(syncPayload);
  }

  private async sendSyncRequest(syncPayload: any): Promise<SyncResponse> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.enqueueOfflinePayload(syncPayload);
      this.syncStatus = 'offline';
      this.notifyListeners();
      return {
        success: true,
        serverVersion: this.clientVersion,
        transactionId: syncPayload.transactionId
      };
    }

    this.syncStatus = 'syncing';
    this.notifyListeners();

    try {
      // Token Refresh & Auth Header check
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // If Firebase Auth or stored auth token exists, refresh and attach
      const authObj = (window as any)?.firebaseAuth;
      if (authObj && authObj.currentUser) {
        try {
          const token = await authObj.currentUser.getIdToken(false);
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokErr) {
          console.warn('[NarrativeSyncService] Token refresh issue, sending unauthed sync:', tokErr);
        }
      }

      const response = await fetch('/api/update-state', {
        method: 'POST',
        headers,
        body: JSON.stringify(syncPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result: SyncResponse = await response.json();

      if (result.conflictDetected) {
        console.warn('[NarrativeSyncService] Sync Conflict Detected from server!', result.conflictReason);
        this.syncStatus = 'conflict';
        if (result.serverVersion) {
          this.clientVersion = result.serverVersion;
        }
        this.notifyListeners();
        return result;
      }

      // Success
      if (result.serverVersion) {
        this.clientVersion = result.serverVersion;
        localStorage.setItem(CLIENT_VERSION_KEY, this.clientVersion.toString());
      }

      this.syncStatus = 'connected';
      this.lastSyncedAt = new Date();
      this.notifyListeners();
      return result;
    } catch (err: any) {
      console.warn('[NarrativeSyncService] Network sync failed, enqueueing offline:', err.message);
      this.enqueueOfflinePayload(syncPayload);
      this.syncStatus = 'offline';
      this.notifyListeners();
      return {
        success: false,
        serverVersion: this.clientVersion,
        conflictReason: err.message
      };
    }
  }

  private enqueueOfflinePayload(payload: any) {
    const queueItem: OfflineQueueItem = {
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      payload,
      retryCount: 0
    };
    this.pendingQueue.push(queueItem);
    this.saveOfflineQueue();
  }

  public async flushOfflineQueue() {
    if (this.isProcessingQueue || this.pendingQueue.length === 0) return;
    this.isProcessingQueue = true;

    console.log(`[NarrativeSyncService] Flushing ${this.pendingQueue.length} offline queued sync items...`);

    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue[0];
      try {
        const res = await fetch('/api/update-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.serverVersion) {
            this.clientVersion = data.serverVersion;
          }
          this.pendingQueue.shift();
          this.saveOfflineQueue();
        } else {
          item.retryCount += 1;
          if (item.retryCount > 5) {
            console.error('[NarrativeSyncService] Dropping offline item after 5 failed retries:', item);
            this.pendingQueue.shift();
            this.saveOfflineQueue();
          } else {
            break; // Stop loop and try again later
          }
        }
      } catch (err) {
        console.warn('[NarrativeSyncService] Retrying offline queue failed:', err);
        break;
      }
    }

    this.isProcessingQueue = false;
    this.syncStatus = this.pendingQueue.length === 0 ? 'connected' : 'offline';
    this.lastSyncedAt = new Date();
    this.notifyListeners();
  }
}
