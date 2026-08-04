import { create } from 'zustand';

interface SettingsStore {
  isSettingsMenuOpen: boolean;
  activeSettingsSection: string | null;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  backupHistory: any[];

  toggleSettingsMenu: () => void;
  setActiveSettingsSection: (section: string | null) => void;
  
  saveProject: () => Promise<void>;
  loadProject: (id?: string) => Promise<void>;
  saveProjectAs: (newName: string) => Promise<void>;
  exportProject: (format: string) => Promise<void>;
  
  openProjectSettings: () => void;
  openAppSettings: () => void;
  openThemeSettings: () => void;
  openAccountSettings: () => void;
  
  createBackup: () => Promise<void>;
  restoreBackup: (backupId: string) => Promise<void>;
  syncToCloud: () => Promise<void>;
  loadFromCloud: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  isSettingsMenuOpen: false,
  activeSettingsSection: null,
  cloudSyncStatus: 'idle',
  backupHistory: [],

  toggleSettingsMenu: () => set((s) => ({ isSettingsMenuOpen: !s.isSettingsMenuOpen })),
  setActiveSettingsSection: (section) => set({ activeSettingsSection: section }),

  saveProject: async () => {
    console.log('[SettingsStore] Saving project...');
    // Simulated delay
    await new Promise(r => setTimeout(r, 500));
  },
  
  loadProject: async (id) => {
    console.log(`[SettingsStore] Loading project ${id}...`);
    await new Promise(r => setTimeout(r, 500));
  },

  saveProjectAs: async (newName) => {
    console.log(`[SettingsStore] Saving project as ${newName}...`);
    await new Promise(r => setTimeout(r, 500));
  },

  exportProject: async (format) => {
    console.log(`[SettingsStore] Exporting project as ${format}...`);
    await new Promise(r => setTimeout(r, 500));
  },

  openProjectSettings: () => set({ activeSettingsSection: 'projectSettings' }),
  openAppSettings: () => set({ activeSettingsSection: 'appSettings' }),
  openThemeSettings: () => set({ activeSettingsSection: 'themeSettings' }),
  openAccountSettings: () => set({ activeSettingsSection: 'accountSettings' }),

  createBackup: async () => {
    console.log('[SettingsStore] Creating backup...');
    await new Promise(r => setTimeout(r, 500));
    const backup = { id: Date.now().toString(), date: new Date().toISOString() };
    set((s) => ({ backupHistory: [...s.backupHistory, backup] }));
  },

  restoreBackup: async (backupId) => {
    console.log(`[SettingsStore] Restoring backup ${backupId}...`);
    await new Promise(r => setTimeout(r, 500));
  },

  syncToCloud: async () => {
    set({ cloudSyncStatus: 'syncing' });
    console.log('[SettingsStore] Syncing to cloud...');
    await new Promise(r => setTimeout(r, 1000));
    set({ cloudSyncStatus: 'synced' });
  },

  loadFromCloud: async (id) => {
    console.log(`[SettingsStore] Loading from cloud ${id}...`);
    await new Promise(r => setTimeout(r, 1000));
  }
}));
